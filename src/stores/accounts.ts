import { defineStore } from "pinia";

export const useAccounts = defineStore("accounts", {
    state: () => ({
        accounts: [
            {
                username: "MindOfMatix",
                uuid: "c8992bfb211c4fa7baceee640b9a6ad8",
                selected: true,
            },
        ] as Account[],
    }),
    getters: {
        selected(): Account | undefined {
            return this.accounts.find((account) => account.selected);
        },
    },
});

export interface Account {
    username: string;
    uuid: string;
    selected: boolean;
}
