import { Attributes, ChevereChild, Data, Dispatch, Relation } from "@interfaces";
export declare abstract class Chevere {
    id: string;
    element: HTMLElement;
    refs?: Data<HTMLElement>;
    childs?: Data<ChevereChild<Attributes>[]>;
    abstract data?: Data<any>;
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
}
