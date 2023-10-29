export interface RendererInstance {
    name: string;
    selected: boolean;
    version: string;
    loader: "vanilla" | "fabric" | "forge";
}
