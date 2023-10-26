export default class Logger {
    public readonly component: string;
    public readonly color: string;

    constructor(component: string, color = "#3297a8") {
        this.component = component;
        this.color = color;
    }

    public log(...params: any[]) {
        console.log(
            `%c[${this.component}]`,
            `color: ${this.color};`,
            ...params
        );
    }

    public debug(...params: any[]) {
        console.log(
            "%c[Debug] %s",
            "color: aqua; font-weight: bold;",
            `%c[${this.component}]`,
            `color: ${this.color};`,
            ...params
        );
    }

    public error(...params: any[]) {
        console.error(
            "%c[Error] %s",
            "color: red; font-weight: bold;",
            `%c[${this.component}]`,
            `color: ${this.color};`,
            ...params
        );
    }
}
