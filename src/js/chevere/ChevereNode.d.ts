import { ChevereElement, Data } from "@interfaces";
import { ChevereData } from "./ChevereData";
import { Chevere } from "./Chevere";
export declare class ChevereNode extends Chevere implements ChevereElement {
    #private;
    name: string;
    data: Data<any>;
    methods?: Data<Function>;
    updated?: () => void;
    updating?: () => void;
    constructor(data: ChevereData, el: HTMLElement);
    /**
     * Parse all the data, they need getter and a setter
     * @param data The primitive data
     */
    parseData(data: Data<any>): Data<any>;
    parseMethods(): void;
}
