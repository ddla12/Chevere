import { ChevereNode, ChevereData, Chevere } from "@chevere";
//#region Types
export type Helper = { [func: string]: Function };

export type Data<T> = { [name: string]: T };

export type initFunc = ((...rest: any[]) => void|Promise<void>) | undefined;

export type Args = Map<string, any>;

export type ChevereNodeList = ChevereDataNode[];

export type Attributes = Attribute|Attribute[]|undefined;

export type BindType = { [name: string]: BindData };

export type Watch = ((value: any, oldValue?: any) => void) | undefined;
//#endregion

export interface Attribute {
    readonly attribute: string,
    values: {
        readonly original: string,
        current?: (() => any)
    }
}

export interface EventCallback {
    $event: Event,
    expr: string,
    node: Chevere
}

export interface BindableAttr extends Attribute {
    readonly bindAttr: string,
    readonly bindValue?: string,
    readonly type: string,
    predicate?: () => void,
}

export interface ActionDynamic<Attributes> {
    new (data: ChevereChild<Attributes>): ChevereChild<Attributes>,
}

export interface FindChilds<Attributes> {
    selector: string,
    attribute: string,
    element: Element,
    parent: ChevereNode,
    Child: ActionDynamic<Attributes>
}

export interface Relation {
    type: string,
    nodes: ChevereChild<Attributes>[]
}

export interface DataOn {
    parent: ChevereNode, 
    attribute: string,
    Child: ActionDynamic<Attribute[]>
}

export interface LoopFragment {
    readonly content: DocumentFragment,
    readonly fragment: DocumentFragment
}

export interface BindData {
    readonly original   : string,
    current             : string,
    callback            : () => string|object
}

export interface Dispatch {
    readonly name: string,
    readonly detail?: object, 
}
//#endregion
//#region Chevere
export interface ChevereNodeData {
    readonly name: string,
    data        : Data<any>,
    init?       : initFunc,
    methods?    : Data<Function>,
    watch?      : Data<Watch>,
    updating?   : () => void,
    updated?    : () => void
}

export interface ChevereDataNode { 
    el: HTMLElement,
    attr: string
}

export interface ChevereElement extends ChevereNodeData {
    name    : string,
    data    : Data<object>,
    id      : string,
    methods?: Data<Function>,
    element : HTMLElement,
    refs?:  Data<HTMLElement>,
}

export interface ChevereWindow {
    nodes: Chevere[],
    findItsData(attr: string, ...data: ChevereData[]): ChevereData,
    start(...data: ChevereData[]): void,
    data(data: ChevereNodeData): ChevereData,
}

export interface ChevereChild<T = Attributes> {
    element : HTMLElement,
    parent  : ChevereNode,
    attr?   : T,
}

//#endregion

//#region Parser
export interface Pattern {
    [attr: string]: {
        [pattern: string]: RegExp,
    },
};

export interface Parse {
    expr: string,
    args?: Args,
    node?: ChevereNode
}
//#endregion