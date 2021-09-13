import { ChevereNodeData, Data, initFunc } from "@interfaces";
import { Helper } from "@helpers";

/**
 *  The class that users create their components
 *  @class
 */
export class ChevereData implements ChevereNodeData {
    readonly name   : string;
    data            : Data<any>;
    methods?        : Data<Function>;
    init            : initFunc;

    constructor(data: ChevereNodeData) {
        ({ name: this.name, data: this.data, methods: this.methods, init: this.init } = data);
    }

    initFunc(args?: string): void {
        let parsedArgs: any[] = (args)
            ? (args?.split(",").map((a) => Helper.parser({ expr: a })))
            : [];

        this.init?.bind(this)(...parsedArgs || "");
    }
}