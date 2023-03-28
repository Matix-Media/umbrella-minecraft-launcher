import { defineStore } from "pinia";

export const useInstances = defineStore("instances", {
    state: () => ({
        instances: [
            { name: "Minecraft 1.19.4 (Latest)", selected: true },
        ] as Instance[],
    }),
    getters: {
        selected(): Instance | undefined {
            return this.instances.find((instance) => instance.selected);
        },
    },
});

export interface Instance {
    name: string;
    selected: boolean;
}
