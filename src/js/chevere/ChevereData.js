import { Helper } from "@helpers";
/**
 *  The class with the data that will be passed to ChevereNode instances
 *  @class
 *  @implements {ChevereNodeData}
 */
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
        //Only existing properties can be watched
        this.watch &&
            Object.keys(this.watch).some((func) => {
                if (!this.data[func])
                    throw new ReferenceError(`You're trying to watch an undefined property '${func}'`);
            });
        Object.freeze(this);
    }
    /**
     * Execute the init function, it is in the ChevereData scope, so $refs are undefined
     * @param args if the 'data-attached' attribute has arguments
     */
    async initFunc(args) {
        let parsedArgs = args
            ? args?.split(",").map((a) => Helper.parser({ expr: a }))
            : [];
        await this.init(...(parsedArgs || ""));
    }
}
//# sourceMappingURL=ChevereData.js.map