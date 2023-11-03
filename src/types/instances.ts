export interface RendererInstance {
    name: string;
    selected: boolean;
    version: string;
    loader: Loader;
}

export type Loader = "vanilla" | "fabric" | "forge";
