import { defineStore } from "pinia";
import Logger from "@/lib/Logger";
import _msmc from "msmc";
const msmc = require("msmc");
const path = require("path");
const fs = require("fs").promises;

const logger = new Logger("AuthManager");
const saveFile = path.join(nw.App.dataPath, "accounts.json");

export const useAccountManager = defineStore("accountManager", {
    state: () => ({
        accounts: [] as Account[],
    }),
    getters: {
        selected(): Account | undefined {
            const selected = this.accounts.find((account) => account.selected);
            if (selected == null && this.accounts.length > 0)
                return this.accounts[0];
            return selected;
        },
    },
    actions: {
        add(account: _msmc.MCToken | Account) {
            if (
                this.accounts.find(
                    (_account) => _account.profile.id == account.profile.id
                )
            )
                return;
            if ("selected" in account) this.accounts.push(account);
            else this.accounts.push({ ...account, selected: false });
        },
        select(account: Account) {
            for (const account of this.accounts) {
                account.selected = false;
            }
            account.selected = true;
            this.accounts = this.accounts;
        },
        async save() {
            logger.log("Saving to:", saveFile);
            await fs.writeFile(saveFile, JSON.stringify(this.accounts));
        },
        async load() {
            const authManager = new msmc.Auth();

            try {
                await fs.access(saveFile);
            } catch (_) {
                return;
            }

            const loadedAccounts: Account[] = JSON.parse(
                await fs.readFile(saveFile, {
                    encoding: "utf8",
                })
            );

            for (const account of loadedAccounts) {
                logger.log(
                    "Loading account:",
                    account.profile.name,
                    `(${account.profile.id})`
                );
                if (
                    this.accounts.find(
                        (_account) => _account.profile.id == account.profile.id
                    )
                ) {
                    logger.log("Skipping, account already loaded");
                    continue;
                }
                this.add({
                    ...(
                        (await msmc.mcTokenToolbox.fromToken(
                            authManager,
                            account,
                            true
                        )) as _msmc.Minecraft
                    ).getToken(true),
                    selected: account.selected,
                });
            }
            await this.save();
        },
    },
});

export type Account = _msmc.MCToken & { selected: boolean };
