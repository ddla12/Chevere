//#region Types
export type Types = string|number|boolean;
export type Patterns = [string, RegExp][];
//#endregion

//#region Enums
export enum CheverexTypes {
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
    variable?: string,
    relation?: Relation[]
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
    data: CheverexObject,
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

export interface CheverexObject {
    name: string,
    value: string|number|boolean,
    type: string|number|boolean
};

export interface CheverexElement {
    id: string,
    element: Element,
    data: CheverexObject[],
    actions?: Action[],
    childs?: CheverexChilds[],
};

export interface Data {
    [type: string]: string[]
};

export interface CheverexChilds {
    id: string,
    type: string,
    action: string,
    variable: string,
    element: Element,
    relations: string[]
};
//#endregion