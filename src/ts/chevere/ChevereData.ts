import { ChevereNodeData, Data, initFunc, Watch } from "@interfaces";
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
    watch?          : Data<Watch>;
    updated?        : () => void;
    updating?       : () => void;

    constructor(data: ChevereNodeData) {
        ({ 
            name: this.name, 
            data: this.data, 
            methods: this.methods, 
            init: this.init,
            watch: this.watch,
            updated: this.updated,
            updating: this.updating
        } = data);


        (this.watch) && Object.keys(this.watch!).some((func) => {
            if(!this.data[func])
                throw new ReferenceError(`You're trying to watch an undefined property '${func}'`);
        });

        Object.freeze(this);
    }

    async initFunc(args?: string): Promise<void> {
        let parsedArgs: any[] = (args)
            ? (args?.split(",").map((a) => Helper.parser({ expr: a })))
            : [];

        await this.init!(...parsedArgs || "");
    }
}