import { ChevereNodeData, Data, initFunc, Watch } from "@types";
import { Helper } from "@helpers";

/**
 *  The class with the data that will be passed to ChevereNode instances
 *  @class
 *  @implements {ChevereNodeData}
 */
export class ChevereData implements ChevereNodeData {
    readonly name: string;
    data: Data<any>;
    methods?: Data<Function>;
    init: initFunc;
    watch?: Data<Watch>;
    readonly updated?: () => void;
    readonly updating?: () => void;

    constructor(data: ChevereNodeData) {
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
        (this.watch) &&
            Object.keys(this.watch!).some((func) => {
                if (!this.data[func])
                    throw new ReferenceError(
                        `You're trying to watch an undefined property '${func}'`,
                    );
            });

        Object.freeze(this);
    }

    /**
     * Execute the init function, it is in the ChevereData scope, so $refs are undefined
     * @param args if the 'data-attached' attribute has arguments
     */
    async initFunc(args?: string): Promise<void> {
        let parsedArgs: any[] = args
            ? args?.split(",").map((a) => Helper.parser({ expr: a }))
            : [];

        await this.init!(...(parsedArgs || ""));
    }
}
