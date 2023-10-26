import Logger from "@/lib/Logger";
import { defineStore } from "pinia";
import type * as _gmll from "gmll";
import * as _path from "path";
import * as _fs from "fs";
const { setRoot } = require("gmll/config") as {
    setRoot: typeof _gmll.config.setRoot;
};
const { init, Instance } = require("gmll") as {
    init: typeof _gmll.init;
    Instance: typeof _gmll.Instance;
};
const path = require("path") as typeof _path;
const fs = require("fs").promises as typeof _fs.promises;

//
const logger = new Logger("InstanceManager");
const saveDir = path.join(nw.App.dataPath, ".gmll");
const instanceFile = path.join(nw.App.dataPath, "instance.json");

export const useInstanceManager = defineStore("instanceManager", {
    state: () => ({
        instances: [] as InstanceSelectionState[],
    }),
    getters: {
        selected(): InstanceSelectionState | undefined {
            return this.instances.find((instance) => instance.selected);
        },
    },
    actions: {
        async create(options: _gmll.types.LaunchOptions) {
            const instance = new Instance(options);
            instance.save();
            this.instances.push({ instance, selected: false });
            await this.save();
        },
        async load() {
            setRoot(saveDir);

            logger.log("Initializing GMLL");
            await init();

            const instances = Instance.getProfiles();
            let selectedStates: Array<{
                id: string;
                name: string;
                selected: boolean;
            }> = [];
            try {
                await fs.access(instanceFile);
                selectedStates = JSON.parse(
                    await fs.readFile(instanceFile, "utf-8")
                );
            } catch (_) {}

            for (const [name, getter] of instances) {
                logger.log(
                    "Loading instance:",
                    name,
                    `(${getter.path ?? "unknown location"})`
                );
                const instance = getter.get();
                if (
                    this.instances.find(
                        (_instance) =>
                            _instance.instance.getID() == instance.getID()
                    )
                )
                    logger.log("Skipping, instance already loaded");

                const selected =
                    selectedStates.find((state) => state.id == instance.getID())
                        ?.selected ?? false;

                this.instances.push({
                    instance,
                    selected,
                });
            }
        },
        async save() {
            logger.log("Saving to:", instanceFile);
            await fs.writeFile(
                instanceFile,
                JSON.stringify(
                    this.instances.map((instance) => ({
                        id: instance.instance.getID(),
                        name: instance.instance.getName(),
                        selected: instance.selected,
                    }))
                )
            );
        },
    },
});

export interface InstanceSelectionState {
    instance: Omit<typeof Instance.prototype, "assets" | "id">;
    selected: boolean;
}
