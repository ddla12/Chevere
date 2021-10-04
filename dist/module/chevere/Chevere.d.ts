import {
    Attributes,
    ChevereChild,
    Data,
    Dispatch,
    Reactive,
    Relation,
} from "../@types.js";
export declare abstract class Chevere {
    readonly id: string;
    readonly element: HTMLElement;
    refs?: Data<HTMLElement>;
    childs?: Data<ChevereChild<Attributes>[]>;
    methods?: Data<Function>;
    abstract readonly data?: Data<any>;
    constructor(element: HTMLElement);
    abstract parseData(data: Data<any>): Data<any>;
    setId(): string;
    findRefs(): void;
    refreshChilds(attr: string, name: string): void;
    $emit(data: Dispatch): void;
    setChilds(data: Relation): void;
    checkForActionsAndChilds(): void;
    $emitSelf(data: Dispatch): void;
    updateRelated(name: string): void;
    parseMethods(data: Reactive<Data<Function>>): Data<Function>;
}
