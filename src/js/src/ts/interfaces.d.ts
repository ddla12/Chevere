import { ChevereNode, ChevereData, Chevere } from "@chevere";
export declare type Helper = {
    [func: string]: Function;
};
export declare type Data<T> = {
    [name: string]: T;
};
export declare type initFunc = ((...rest: any[]) => void | Promise<void>) | undefined;
export declare type Args = Map<string, any>;
export declare type ChevereNodeList = ChevereDataNode[];
export declare type Attributes = Attribute | Attribute[] | undefined;
export declare type BindType = {
    [name: string]: BindData;
};
export declare type Watch = ((value: any, oldValue?: any) => void) | undefined;
export interface Attribute {
    readonly attribute: string;
    values: {
        readonly original: string;
        current?: (() => any);
    };
}
export interface EventCallback {
    $event: Event;
    expr: string;
    node: Chevere;
}
export interface BindableAttr extends Attribute {
    readonly bindAttr: string;
    readonly bindValue?: string;
    readonly type: string;
    predicate?: () => void;
}
export interface ActionDynamic<Attributes> {
    new (data: ChevereChild<Attributes>): ChevereChild<Attributes>;
}
export interface FindChilds<Attributes> {
    selector: string;
    attribute: string;
    element: Element;
    parent: ChevereNode;
    Child: ActionDynamic<Attributes>;
}
export interface Relation {
    type: string;
    nodes: ChevereChild<Attributes>[];
}
export interface DataOn {
    parent: ChevereNode;
    attribute: string;
    Child: ActionDynamic<Attribute[]>;
}
export interface LoopFragment {
    readonly content: DocumentFragment;
    readonly fragment: DocumentFragment;
}
export interface BindData {
    readonly original: string;
    current: string;
    callback: () => string | object;
}
export interface Dispatch {
    readonly name: string;
    readonly detail?: object;
}
export interface ChevereNodeData {
    readonly name: string;
    data: Data<any>;
    init?: initFunc;
    methods?: Data<Function>;
    watch?: Data<Watch>;
    updating?: () => void;
    updated?: () => void;
}
export interface ChevereDataNode {
    el: HTMLElement;
    attr: string;
}
export interface ChevereElement extends ChevereNodeData {
    name: string;
    data: Data<object>;
    id: string;
    methods?: Data<Function>;
    element: HTMLElement;
    refs?: Data<HTMLElement>;
}
export interface ChevereWindow {
    nodes: Chevere[];
    findItsData(attr: string, ...data: ChevereData[]): ChevereData;
    start(...data: ChevereData[]): void;
    data(data: ChevereNodeData): ChevereData;
}
export interface ChevereChild<T = Attributes> {
    element: HTMLElement;
    parent: ChevereNode;
    attr?: T;
}
export interface Pattern {
    [attr: string]: {
        [pattern: string]: RegExp;
    };
}
export interface Parse {
    expr: string;
    args?: Args;
    node?: ChevereNode;
}
