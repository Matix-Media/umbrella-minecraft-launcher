import Logger from "../../lib/Logger";
import _msmc, { Auth, MCToken, mcTokenToolbox } from "msmc";
import path from "path";
import fs from "fs/promises";
import { WebContents, app, ipcMain } from "electron";
import { RendererAccount } from "../../types/accounts";

export default class AccountManager {
    private static readonly SAVE_FILE = path.join(app.getPath("userData"), "accounts.json");
    private static readonly LOGGER = new Logger("AuthManager");

    private readonly webContents: WebContents;
    public readonly accounts: Account[] = [];

    constructor(webContents: WebContents) {
        this.webContents = webContents;

        ipcMain.handle("main:accountManager.load", async (event) => {
            await this.load();
        });
        ipcMain.handle("main:accountManager.select", (event, id: string) => {
            this.select(id);
        });
        ipcMain.handle("main:accountManager.save", async (event) => {
            await this.save();
        });
        ipcMain.handle("main:accountManager.linkAccount", async (event) => {
            await this.linkAccount();
        });
        ipcMain.handle("main:accountManager.remove", async (event, id) => {
            await this.remove(id);
        });
    }

    public async select(id: string) {
        let previouslySelected: Account | undefined;
        let nowSelected: Account | undefined;
        for (const account of this.accounts) {
            if (account.selected) previouslySelected = account;
            if (account.profile.id === id) {
                account.selected = true;
                nowSelected = account;
            } else {
                account.selected = false;
            }
        }
        if (nowSelected == null) {
            if (previouslySelected != null) {
                previouslySelected.selected = true;
                nowSelected = previouslySelected;
            } else if (this.accounts.length > 0) {
                this.accounts[0].selected = true;
                nowSelected = this.accounts[0];
            }
        }
        if (nowSelected != null) this.webContents.send("renderer:accountManager.select", nowSelected.profile.id);
        await this.save();
    }

    public async linkAccount() {
        try {
            const auth = new Auth("select_account");
            const xboxAccount = await auth.launch("electron");
            const minecraftAccount = await xboxAccount.getMinecraft();
            const token = minecraftAccount.getToken(true);
            this.add(token);
            this.select(token.profile.id);
            await this.save();
        } catch (err) {
            AccountManager.LOGGER.error("Error linking account:", err);
        }
    }

    public async remove(id: string) {
        const i = this.accounts.findIndex((_account) => _account.profile.id === id);
        this.accounts.splice(i, 1);
        this.webContents.send("renderer:accountManager.remove", id);
        if (this.accounts.length > 0) {
            this.select(this.accounts[0].profile.id);
        }
        await this.save();
    }

    public add(account: MCToken | Account) {
        if (this.accounts.find((_account) => _account.profile.id == account.profile.id)) return;
        let transAccount: Account;
        if ("selected" in account) transAccount = account;
        else transAccount = { ...account, selected: false };
        this.accounts.push(transAccount);
        this.webContents.send("renderer:accountManager.add", {
            id: transAccount.profile.id,
            name: transAccount.profile.name,
            selected: transAccount.selected,
        } as RendererAccount);
    }

    public async load() {
        const authManager = new Auth("select_account");

        try {
            await fs.access(AccountManager.SAVE_FILE);
        } catch (_) {
            return;
        }

        const loadedAccounts: Account[] = JSON.parse(
            await fs.readFile(AccountManager.SAVE_FILE, {
                encoding: "utf8",
            }),
        );

        for (const account of loadedAccounts) {
            AccountManager.LOGGER.log("Loading account:", account.profile.name, `(${account.profile.id})`);
            let existingAccount = this.accounts.find((_account) => _account.profile.id == account.profile.id);
            if (existingAccount != null) {
                AccountManager.LOGGER.log("Skipping, account already loaded");
                this.webContents.send("renderer:accountManager.add", {
                    id: existingAccount.profile.id,
                    name: existingAccount.profile.name,
                    selected: existingAccount.selected,
                } as RendererAccount);
                continue;
            }
            this.add({
                ...(await mcTokenToolbox.fromToken(authManager, account, true)).getToken(true),
                selected: account.selected,
            });
        }
        await this.save();
    }

    public async save() {
        AccountManager.LOGGER.log("Saving to:", AccountManager.SAVE_FILE);
        await fs.writeFile(AccountManager.SAVE_FILE, JSON.stringify(this.accounts));
    }
}

export type Account = MCToken & { selected: boolean };
