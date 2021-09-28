import { Data } from "@interfaces";
import { ChevereData } from "./ChevereData";
import { Chevere } from "./Chevere";
/**
 * Components with the 'data-attached' attribute
 * @extends Chevere
 * @implements {ChevereElement}
 */
export declare class ChevereNode extends Chevere {
    #private;
    name: string;
    data: Data<any>;
    methods?: Data<Function>;
    updated?: () => void;
    updating?: () => void;
    constructor(data: ChevereData, el: HTMLElement);
    parseData(data: Data<any>): Data<any>;
    /**
     * Make the methods reactive
     */
    parseMethods(): void;
}
