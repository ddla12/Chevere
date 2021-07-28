import { ChevereData, ChevereNode } from "./Chevere";

//#region Types
export type Types = string|number|boolean;

export type Patterns = [string, RegExp][];

export type RelatedElements = NodeListOf<Element>[]|undefined;

export type DataType = { [prop: string]: any, };

export type MethodType = { [method: string]: Function, };

export type ChildMethodType = MethodType|DataType|undefined;
//#endregion

//#region Enums
export enum ChevereTypes {
    "boolean",
    "number",
    "string"
};
//#endregion

//#region Interfaces
export interface Action {
    elem: Element,
    type?: string,
    action?: string,
};

export interface Relation {
    element: Element,
    type: string
};

export interface ListOfRelation {
    [type: string]: Relation[]|undefined
};

export interface ClickEvent {
    el: Element,
    action?: string,
    data: ChevereObject,
    nodes: Relation[]
};

export interface Pattern {
    [name: string]: {
        [action: string]: RegExp
    }
};

export interface TryParse {
    patterns: { [action: string]: RegExp; }, 
    str: string,
    type: string
};

export interface ParsedData {
    action?: string,
    name?: string,
    type?: Types,
};

export interface ChevereObject {
    name: string,
    value: string|number|boolean,
    type: string|number|boolean
};

export interface ChevereElement {
    id: string,
    element: Element,
    data: ChevereComponent,
    _actions?: Action[],
    childs?: ChevereChilds[],
};

export interface Data {
    [type: string]: string[]
};

export interface ChevereChilds {
    id: string,
    type: string,
    action: string,
    variable: string,
    element: Element,
    relations: string[]
};

export interface ChevereComponent {
    name: string,
    data: DataType,
    methods?: MethodType,
};

export interface ChevereEvent {
    type: string, 
    el: Element, 
    actions: any[],
};

export interface CheverexChild {
    element: Element,
    parent: ChevereNode,
    data: ChildMethodType,
}

export interface Variable {
    _variable?: any,
}

export interface InputModel extends CheverexChild, Variable {
    attached?: NodeListOf<Element>,
    name?: string
};

export interface Click extends CheverexChild {
    _action?: Function,
    _arguments?: any[],
};

export interface TextRelation extends CheverexChild, Variable {};

export interface ChevereWindow {
    findItsData(attr :string, data: ChevereData[]): ChevereData, 
    start(...data: ChevereData[]): void 
}

export interface Selectors {
    [group: string]:NodeListOf<Element>
}
//#endregion