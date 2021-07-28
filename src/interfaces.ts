import { ChevereData, ChevereNode } from "./Chevere";

//#region Types
export type Types = string|number|boolean;

export type Patterns = [string, RegExp][];

export type RelatedElements = NodeListOf<Element>[]|undefined;

export type DataType = { [prop: string]: any, };

export type MethodType = { [method: string]: Function, };

export type Child = { [type: string]: any[] };
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
    instance: Actions,
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

export interface Data {
    [type: string]: string[]
};

export interface InputModel extends CheverexChild {
    variable?: string,
};

export interface Click extends CheverexChild {
    _action?: Function,
};

export interface TextRelation extends CheverexChild {};

export interface Selectors {
    [group: string]:NodeListOf<Element>
}
//#endregion

//#region Cheverex
export interface ChevereChilds {
    id: string,
    type: string,
    action: string,
    variable: string,
    element: Element,
    relations: string[]
};

export interface CheverexChild {
    element: Element,
    parent: ChevereNode,
    method?: Function,
}

export interface ChevereWindow {
    findItsData(attr :string, data: ChevereData[]): ChevereData, 
    start(...data: ChevereData[]): void 
}

export interface ChevereNodeData {
    name: string,
    data: DataType,
    methods?: MethodType,
};

export interface ChevereElement extends ChevereNodeData {
    element: Element,
    _actions?: Action[],
    childs?: Child,
};

export interface MainData {
    [name: string]: ParsedData
};

export interface ParsedData {
    nombre: string,
    _value: any,
    value: any
};

export interface ChevereEvent {
    elem: HTMLElement|Element, 
    type: string, 
    action: Function
};
//#endregion////