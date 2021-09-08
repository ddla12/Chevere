import { ChevereNode, ChevereData } from "@chevere";

//#region Types
export type DataType = { [prop: string]: any };

export type MethodType = { [method: string]: Function };

export type Bindable = { [name: string]: string};

export type Child = { [type: string]: any[] };

export type Args = Map<string, any>|undefined;

export type Arguments = { [args: string]: ParsedArgs};

export type ParsedArgs = undefined|string[];

export type EventElements = [Element, string, string][]|undefined;

export type CheverexDataNode = { elem: Element, dataAttr: string|null };

export type CheverexNodeList = CheverexDataNode[];
//#endregion

//#region Interfaces

//Bind interfaces
export interface BindAttr {
    readonly name: string,
    readonly exists: boolean,
    readonly value: string
};

export interface BindChild {
    element: HTMLElement|HTMLInputElement,
    parent: ChevereNode,
    attribute: ExpAttribute,
    variables?: string[],
};

export interface InputModel extends CheverexChild {
    element: HTMLInputElement,
    variable?: string;
}

export interface MethodInfo {
    readonly typeOfMethod: string,
    readonly method: Function
};

export interface ExpAttribute {
    readonly attribute: string,
    readonly modifier: string,
    values: {
        readonly original: string,
        current: string
    },
    parsed?: any,
};

export interface MethodData {
    readonly typeOfMethod: string,
    readonly name: string,
    function: {
        readonly original: Function,
        parsed?: Function,
    },
    args?: Args
};

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
    bind?: Bindable;
}

export interface FindsEvents {
    element: Element,
    dataId: string,
};

export interface ChevereElement extends ChevereNodeData {
    element: Element,
    childs?: Child,
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

export interface ShowChild {
    element : HTMLElement;
    parent  : ChevereNode;
    variable?: ParsedData;
    value?: any;
};

export interface ParsedShow {
    variable: ParsedData,
    value: any
};

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

export interface Attribute {
    attr: string, 
    node: ChevereNode
};

export interface InlineParser {
    escape(str: string): string,
    parser(expr: any): any,
    parentEscape(parent: ParsedData): any
    parseArgs(args: string[], data: ChevereNode, typeOfMethod: string): any[],
    parsedDataShowAttr(data: Attribute): ParsedShow
    parseDataTextAttr(data: Attribute): ParsedText,
    parseDataForAttr(data: Attribute): ParsedFor 
};

export interface Pattern {
    [attr: string]: {
        [pattern: string]: RegExp,
    },
};

export interface ParsedText {
    variable: ParsedData,
    value?: any
}
//#endregion
