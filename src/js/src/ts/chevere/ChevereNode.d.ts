import { ChevereElement, Data, Dispatch, Relation } from "@interfaces";
import { ChevereData } from "./ChevereData";
import { Chevere } from "./Chevere";
export declare class ChevereNode extends Chevere implements ChevereElement {
    #private;
    name: string;
    data: Data<any>;
    methods?: Data<Function>;
    refs?: Data<HTMLElement>;
    updated?: () => void;
    updating?: () => void;
    constructor(data: ChevereData, el: HTMLElement);
    findRefs(): void;
    refreshChilds(attr: string, name: string): void;
    /**
     * Parse all the data, they need getter and a setter
     * @param data The primitive data
     */
    parseData(data: Data<any>): Data<any>;
    parseMethods(): void;
    setChilds(data: Relation): void;
    /**
     * Find all the childrens that have an action and data
     */
    checkForActionsAndChilds(): void;
    $emitSelf(data: Dispatch): void;
}
