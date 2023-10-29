import Logger from "../../lib/Logger";
import { WebContents, app, ipcMain } from "electron";
import { Instance, init } from "gmll";
import { LaunchOptions } from "gmll/types";
import path from "path";
import fs from "fs/promises";
import { setRoot } from "gmll/config";
import { RendererInstance } from "../../types/instances";

export default class InstanceManager {
    private static readonly SAVE_DIR = path.join(app.getPath("userData"), ".gmll");
    private static readonly INSTANCES_FILE = path.join(app.getPath("userData"), "instance.json");
    private static readonly LOGGER = new Logger("InstanceManager");

    private readonly webContents: WebContents;
    public readonly instances: InstanceSelectionState[] = [];

    constructor(webContents: WebContents) {
        this.webContents = webContents;

        ipcMain.handle("main:instanceManager.load", async (event) => {
            await this.load();
        });
        ipcMain.handle("main:instanceManager.createInstance", async (event, options) => {
            await this.createInstance(options);
        });
        ipcMain.handle("main:instanceManager.save", async (event) => {
            await this.save();
        });
    }

    public async createInstance(options: LaunchOptions) {
        const instance = new Instance(options);
        instance.save();
        this.instances.push({ instance, selected: false });
        await this.save();
    }

    public async add(instance: Instance | InstanceSelectionState) {
        let transInstance: InstanceSelectionState;
        if (instance instanceof Instance) transInstance = { instance, selected: false };
        else transInstance = instance;

        if (this.instances.find((_instance) => _instance.instance.name === transInstance.instance.name)) return;
        this.instances.push(transInstance);
        this.webContents.send("renderer:instanceManager.add", {
            name: transInstance.instance.name,
            selected: transInstance.selected,
            version: transInstance.instance.version,
            loader: "vanilla",
        } as RendererInstance);
    }

    public async save() {
        InstanceManager.LOGGER.log("Saving to:", InstanceManager.INSTANCES_FILE);
        await fs.writeFile(
            InstanceManager.INSTANCES_FILE,
            JSON.stringify(
                this.instances.map((instance) => ({
                    id: instance.instance.getID(),
                    name: instance.instance.getName(),
                    selected: instance.selected,
                })),
            ),
        );
    }

    public async load() {
        setRoot(InstanceManager.SAVE_DIR);

        InstanceManager.LOGGER.log("Initializing GMLL");
        await init();

        const instances = Instance.getProfiles();
        let selectedStates: Array<{
            id: string;
            name: string;
            selected: boolean;
        }> = [];
        try {
            await fs.access(InstanceManager.INSTANCES_FILE);
            selectedStates = JSON.parse(await fs.readFile(InstanceManager.INSTANCES_FILE, "utf-8"));
        } catch (_) {}

        for (const [name, getter] of instances) {
            InstanceManager.LOGGER.log("Loading instance:", name, `(${getter.path ?? "unknown location"})`);
            const instance = getter.get();
            if (this.instances.find((_instance) => _instance.instance.getID() == instance.getID()))
                InstanceManager.LOGGER.log("Skipping, instance already loaded");

            const selected = selectedStates.find((state) => state.id == instance.getID())?.selected ?? false;

            this.add({
                instance,
                selected,
            });
        }
    }
}

export interface InstanceSelectionState {
    instance: Instance;
    selected: boolean;
}
