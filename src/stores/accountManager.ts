import { defineStore } from "pinia";
import _msmc from "msmc";
const msmc = require("msmc");
const path = require("path");
const fs = require("fs").promises;

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
        add(account: _msmc.MCToken) {
            if (
                this.accounts.find(
                    (_account) => _account.profile.id == account.profile.id
                )
            )
                return;
            this.accounts.push({ ...account, selected: false });
        },
        select(account: Account) {
            for (const account of this.accounts) {
                account.selected = false;
            }
            account.selected = true;
        },
        async save() {
            const file = path.join(nw.App.dataPath, "accounts.json");
            console.log("Saving to:", file);
            await fs.writeFile(file, JSON.stringify(this.accounts));
        },
        async load() {
            const authManager = new msmc.Auth();
            const file = path.join(nw.App.dataPath, "accounts.json");
            const loadedAccounts: Account[] = JSON.parse(
                await fs.readFile(file, {
                    encoding: "utf8",
                })
            );

            for (const account of loadedAccounts) {
                this.accounts.push(
                    await msmc.mcTokenToolbox.fromToken(
                        authManager,
                        account,
                        true
                    )
                );
            }
        },
    },
});

export type Account = _msmc.MCToken & { selected: boolean };
