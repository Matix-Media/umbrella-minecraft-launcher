import { IpcWindow } from "@/lib/ipcWindow";
import { RendererAccount } from "@/types/accounts";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

declare let window: IpcWindow;

export const useAccountManager = defineStore("accountManager", () => {
    const accounts = ref<RendererAccount[]>([]);

    async function load() {
        await window.ipcRenderer.invoke("main:accountManager.load");
    }

    async function select(id: string) {
        await window.ipcRenderer.invoke("main:accountManager.select", id);
    }

    async function remove(id: string) {
        await window.ipcRenderer.invoke("main:accountManager.remove", id);
    }

    const selected = computed(() => accounts.value.find((_account) => _account.selected));

    window.ipcRenderer.receive("renderer:accountManager.add", (account: RendererAccount) => {
        accounts.value.push(account);
    });

    window.ipcRenderer.receive("renderer:accountManager.remove", (id: string) => {
        const i = accounts.value.findIndex((_account) => _account.id === id);
        accounts.value.splice(i, 1);
        accounts.value = accounts.value;
    });

    window.ipcRenderer.receive("renderer:accountManager.select", (id: string) => {
        const account = accounts.value.find((_account) => _account.id === id);
        if (account != null) account.selected = true;
    });

    return { accounts, load, select, remove, selected };
});
