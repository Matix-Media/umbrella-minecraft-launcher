import { defineStore } from "pinia";
import type * as gmll from "gmll";
import { IpcWindow } from "@/lib/ipcWindow";
import { computed, ref } from "vue";
import { RendererInstance, Version } from "@/types/instances";

declare let window: IpcWindow;

export const useInstanceManager = defineStore("instanceManager", () => {
    const instances = ref<RendererInstance[]>([]);

    async function load() {
        await window.ipcRenderer.invoke("main:instanceManager.load");
    }

    async function select(name: string) {
        await window.ipcRenderer.invoke("main:instanceManager.select", name);
    }

    async function createInstance(options: gmll.types.LaunchOptions) {
        await window.ipcRenderer.invoke("main:instanceManager.createInstance", options);
    }

    async function getVersions(): Promise<Version[]> {
        return await window.ipcRenderer.invoke("main:instanceManager.versions");
    }

    const selected = computed(() => instances.value.find((_instance) => _instance.selected));

    window.ipcRenderer.receive("renderer:instanceManager.add", (instance: RendererInstance) => {
        instances.value.push(instance);
    });

    window.ipcRenderer.receive("renderer:instanceManager.remove", (name: string) => {
        const i = instances.value.findIndex((_instance) => _instance.name === name);
        instances.value.splice(i, 1);
        instances.value = instances.value;
    });

    window.ipcRenderer.receive("renderer:instanceManager.select", (name: string) => {
        const instance = instances.value.find((_instance) => _instance.name === name);
        if (instance != null) instance.selected = true;
    });

    return { instances, load, select, createInstance, getVersions, selected };
});
