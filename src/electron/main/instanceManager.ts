import Logger from "../../lib/Logger";
import { WebContents, app, ipcMain } from "electron";
import { Instance, init } from "gmll";
import path from "path";
import fs from "fs/promises";
import { setRoot } from "gmll/config";
import { Loader, RendererInstance } from "../../types/instances";
import { LaunchOptions } from "gmll/types";
import { XMLParser } from "fast-xml-parser";

export default class InstanceManager {
    private static readonly SAVE_DIR = path.join(app.getPath("userData"), ".gmll");
    private static readonly INSTANCES_FILE = path.join(app.getPath("userData"), "instance.json");
    private static readonly LOGGER = new Logger("InstanceManager");
    private static readonly MC_VERSION_MANIFEST = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
    private static readonly FORGE_VERSION_MANIFEST = "https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml";

    private readonly webContents: WebContents;
    public readonly instances: InstanceSelectionState[] = [];
    public readonly versions: Version[] = [];

    constructor(webContents: WebContents) {
        this.webContents = webContents;

        ipcMain.handle("main:instanceManager.load", async (event) => {
            await this.load();
        });
        ipcMain.handle("main:instanceManager.select", async (event, name) => {
            await this.select(name);
        });
        ipcMain.handle("main:instanceManager.createInstance", async (event, options) => {
            await this.createInstance(options);
        });
        ipcMain.handle("main:instanceManager.save", async (event) => {
            await this.save();
        });
    }

    public async select(name: string) {
        let previouslySelected: InstanceSelectionState | undefined;
        let nowSelected: InstanceSelectionState | undefined;
        for (const instance of this.instances) {
            if (instance.selected) previouslySelected = instance;
            if (instance.instance.name === name) {
                instance.selected = true;
                nowSelected = instance;
            } else {
                instance.selected = false;
            }
        }
        if (nowSelected == null) {
            if (previouslySelected != null) {
                previouslySelected.selected = true;
                nowSelected = previouslySelected;
            } else if (this.instances.length > 0) {
                this.instances[0].selected = true;
                nowSelected = this.instances[0];
            }
        }
        if (nowSelected != null) this.webContents.send("renderer:instanceManager.select", nowSelected.instance.name);
        await this.save();
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
                    name: instance.instance.name,
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
            InstanceManager.LOGGER.log(instance.name);
            let existingInstance = this.instances.find((_instance) => _instance.instance.name == instance.name);
            if (existingInstance != null) {
                InstanceManager.LOGGER.log("Skipping, instance already loaded");
                this.webContents.send("renderer:instanceManager.add", {
                    name: existingInstance.instance.name,
                    selected: existingInstance.selected,
                    version: existingInstance.instance.version,
                    loader: "vanilla",
                } as RendererInstance);
                continue;
            }

            const selected = selectedStates.find((state) => state.name == instance.name)?.selected ?? false;

            this.add({
                instance,
                selected,
            });
        }

        console.log("Loading available versions");
        console.log("Loading vanilla versions");
        const mcVersions: MCVersionManifest = await (await fetch(InstanceManager.MC_VERSION_MANIFEST)).json();
        for (const version of mcVersions.versions) {
            this.versions.push({ loader: "vanilla", version: version.id, forVersion: version.id });
        }

        console.log("Loading forge versions");
        const forgeVersionsText = await (await fetch(InstanceManager.FORGE_VERSION_MANIFEST)).text();
        const forgeVersions: ForgeVersionManifest = new XMLParser().parse(forgeVersionsText);
        console.log(forgeVersions.metadata.versioning.versions);
        for (const version of forgeVersions.metadata.versioning.versions.version) {
            const [forVersion, forgeVersion] = version.split("-");
            this.versions.push({ loader: "forge", version: forgeVersion, forVersion });
        }
    }
}

interface MCVersionManifest {
    latest: {
        release: string;
        snapshot: string;
    };
    versions: Array<{
        id: string;
        type: "snapshot" | "release";
        url: string;
        time: string;
        releaseTime: string;
    }>;
}

interface ForgeVersionManifest {
    metadata: {
        groupId: string;
        artifactId: string;
        versioning: {
            release: string;
            latest: string;
            lastUpdated: string;
            versions: {
                version: Array<string>;
            };
        };
    };
}

export interface InstanceSelectionState {
    instance: Instance;
    selected: boolean;
}

export interface Version {
    loader: Loader;
    version: string;
    forVersion: string;
}
