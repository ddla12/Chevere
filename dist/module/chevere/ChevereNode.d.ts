import { Attributes, ChevereChild, ChevereNodeData, Data, Dispatch, initFunc, Watch } from "../@types.js";
export declare abstract class ChevereNode {
    readonly name?: string;
    readonly id: string;
    readonly $element: HTMLElement;
    init?: initFunc;
    updated?: () => void;
    beforeUpdating?: () => void;
    data?: Data<any>;
    $refs?: Data<HTMLElement>;
    childs?: Data<ChevereChild<Attributes>[]>;
    methods?: Data<Function>;
    protected watch?: Data<Watch>;
    constructor(data: ChevereNodeData, element: HTMLElement);
    executeInit(): void | Promise<void>;
    findRefs(): Data<HTMLElement>;
    refreshChilds(attr: string, name: string): void;
    checkForActionsAndChilds(): void;
    $emitSelf(data: Dispatch): void;
    $emit(data: Dispatch): void;
    reScan(): void;
    updateRelated(name: string): void;
    parseMethods(data: Data<Function>): Data<Function>;
    parseData(data: Data<any>): Data<any>;
}
