import { Helper } from "../utils/index.js";
export class ChevereData {
    constructor(data) {
        ({
            name: this.name,
            data: this.data,
            methods: this.methods,
            init: this.init,
            watch: this.watch,
            updated: this.updated,
            updating: this.updating,
        } = data);
        (this.watch) &&
            Object.keys(this.watch).some((func) => {
                if (!this.data[func])
                    throw new ReferenceError(`You're trying to watch an undefined property '${func}'`);
            });
        Object.freeze(this);
    }
    async initFunc(args) {
        let parsedArgs = args
            ? args?.split(",").map((a) => Helper.parser({ expr: a }))
            : [];
        await this.init(...(parsedArgs || ""));
    }
}
