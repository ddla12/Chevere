import ChevereNode from "./chevere/ChevereNode";
import ChevereData from "./chevere/ChevereData";

//#region Types
export type DataType = { [prop: string]: any };

export type MethodType = { [method: string]: Function };

export type Child = { [type: string]: any[] };

export type ParsedArgs = undefined|string[];

export type EventElements = [Element, string, string][]|undefined;
//#endregion

//#region Interfaces
export interface InputModel extends CheverexChild {
    variable?: string;
}

export interface EventChild extends CheverexChild {
    event: string,
    attrVal: string
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

export interface FindsEvents {
    element: Element,
    dataId: string,
};

export interface ChevereElement extends ChevereNodeData {
    element: Element;
    childs?: Child;
}

export interface Init {
    init: Function;
    args?: ArgumentsObject;
}

export interface MainData {
    [name: string]: ParsedData;
}

export interface ParsedData {
    nombre: string;
    _value: any;
    value: any;
}

export interface ArgumentsObject {
    [arg: string]: any,
};

export interface CompareArguments {
    htmlArgs: ParsedArgs, 
    methodArgs: ParsedArgs,
    method: string,
    component: string,
};

export interface ArgsErrors {
    args: string[], 
    name: string, 
    method: string
};

export interface ChevereEvent {
    elem: HTMLElement | Element;
    type: string;
    action: Function;
    args?: {}
};

export interface LoopElement {
    element: HTMLTemplateElement,
    parent: ChevereNode,
    variable?: ParsedData,
    expressions?: string[]
};

export interface findProp {
    obj: any,
    key: any,
    pos: number,
    nested: number,
};

export interface ParsedFor {
    variable?: ParsedData,
    expressions?: string[],
}

export interface InlineParser {
    patterns: {
        [attr: string]: {
            [pattern: string]: RegExp
        }
    },
    parseDataTextAttr(attr: string, node: ChevereNode): ParsedText,
    parseDataForAttr(attr: string, node: ChevereNode): ParsedFor 
};

export interface ParsedText {
    variable: ParsedData,
    value?: any
}
//#endregion
