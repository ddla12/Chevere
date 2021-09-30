import { Data, Watch } from "@types";
import { ChevereData } from "./ChevereData";
import { Chevere } from "./Chevere";
export declare class ChevereNode extends Chevere {
    readonly name: string;
    data: Data<any>;
    methods?: Data<Function>;
    protected watch?: Data<Watch>;
    readonly updated?: () => void;
    readonly updating?: () => void;
    constructor(data: ChevereData, el: HTMLElement);
    parseData(data: Data<any>): Data<any>;
    parseMethods(): void;
}
