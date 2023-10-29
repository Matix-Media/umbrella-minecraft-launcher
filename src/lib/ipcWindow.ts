export interface IpcWindow extends Window {
    ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        receive: (channel: string, func: (...args: any[]) => void | Promise<void>) => void;
    };
}
