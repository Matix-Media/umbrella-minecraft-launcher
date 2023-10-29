import { defineStore } from "pinia";
import type * as gmll from "gmll";
import { IpcWindow } from "@/lib/ipcWindow";
import { computed, ref } from "vue";
import { RendererInstance } from "@/types/instances";

declare let window: IpcWindow;

export const useInstanceManager = defineStore("instanceManager", () => {
    const instances = ref<RendererInstance[]>([]);

    async function load() {
        await window.ipcRenderer.invoke("main:instanceManager.load");
    }

    async function createInstance(options: gmll.types.LaunchOptions) {
        await window.ipcRenderer.invoke("main:instanceManager.createInstance", options);
    }

    const selected = computed(() => instances.value.find((_instance) => _instance.selected));

    return { instances, load, createInstance, selected };
});

