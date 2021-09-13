import { ChevereNode, ChevereData } from "@chevere";
//#region Types
export type Helper = { [func: string]: Function };

export type Data<T> = { [name: string]: T };

export type initFunc = ((...rest: any[]) => void) | undefined;

export type Args = Map<string, any>;

export type ChevereNodeList = ChevereDataNode[];

export type Attributes = Attribute|Attribute[];

//#endregion

//#region Utils
export interface Attribute {
    readonly attribute: string,
    values: {
        readonly original: string,
        current?: any
    }
}

export interface ActionDynamic<Attributes> {
    new (data: ChevereChild<Attributes>): ChevereChild<Attributes>,
}

export interface FindChilds<Attributes> {
    selector: string,
    attribute: string,
    element: Element,
    parent: ChevereNode,
    child: ActionDynamic<Attributes>
}

export interface Relation {
    type: string,
    nodes: ChevereChild<Attributes>[]
}

export interface DataOn {
    parent: ChevereNode, 
    attribute: string,
    child: ActionDynamic<Attribute[]>
}


//#endregion
//#region Chevere
export interface ChevereNodeData {
    readonly name: string;
    data: Data<any>;
    init?: initFunc,
    methods?: Data<Function>;
    bind?: Data<string|object>;
}

export interface ChevereDataNode { 
    el: Element,
    attr: string
}

export interface ChevereElement extends ChevereNodeData {
    name    : string,
    data    : Data<object>,
    id      : string,
    methods?: Data<Function>,
    element : Element,
    refs?:  Data<HTMLElement>,
}

export interface ChevereWindow {
    nodes: ChevereNode[],
    findItsData(attr: string, ...data: ChevereData[]): ChevereData,
    start(...data: ChevereData[]): void,
    data(data: ChevereNodeData): ChevereData,
}

export interface ChevereChild<T = Attributes> {
    element : Element,
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