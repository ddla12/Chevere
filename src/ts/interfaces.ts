import { ChevereData, ChevereNode } from "./Chevere";

//#region Types
export type DataType = { [prop: string]: any };

export type MethodType = { [method: string]: Function };

export type Child = { [type: string]: any[] };
//#endregion

//#region Interfaces
export interface InputModel extends CheverexChild {
    variable?: string;
}

export interface Click extends CheverexChild {
    _action?: Function;
}

export interface TextRelation extends CheverexChild {}

export interface Selectors {
    [group: string]: NodeListOf<Element>;
}
//#endregion

//#region Cheverex
export interface ChevereChilds {
    id: string;
    type: string;
    action: string;
    variable: string;
    element: Element;
    relations: string[];
}

export interface CheverexChild {
    element: Element;
    parent: ChevereNode;
    method?: Function;
}

export interface ChevereWindow {
    nodes: ChevereNode[];
    findItsData(attr: string, data: ChevereData[]): ChevereData;
    start(...data: ChevereData[]): void;
    data(data: ChevereNodeData): ChevereData;
}

export interface ChevereNodeData {
    name: string;
    data: DataType;
    init?: Function;
    methods?: MethodType;
}

export interface ChevereElement extends ChevereNodeData {
    element: Element;
    childs?: Child;
}

export interface Init {
    init: Function;
    args?: object;
}

export interface MainData {
    [name: string]: ParsedData;
}

export interface ParsedData {
    nombre: string;
    _value: any;
    value: any;
}

export interface ChevereEvent {
    elem: HTMLElement | Element;
    type: string;
    action: Function;
}
//#endregion
