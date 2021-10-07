import { ChevereNode } from "./chevere/index.js";
export declare type Data<T> = Record<string, T>;
export declare type Helper = Data<Function>;
export declare type initFunc = ((...rest: any[]) => void | Promise<void>) | undefined;
export declare type Args = Map<string, any>;
export declare type ChevereNodeList = ChevereDataNode[];
export declare type Attributes = Attribute | Attribute[] | undefined;
export declare type Watch = ((value?: any, oldValue?: any) => void) | undefined;
export declare type Pattern = Data<RegExp>;
export declare type ReactiveCallback = (target?: Data<any>, name?: string, value?: any) => void;
export interface BindForEach {
    filter: (attr: BindableAttr) => boolean;
    callback: (attr: BindableAttr) => void;
}
export interface Parse {
    expr: string;
    args?: Args;
    node?: ChevereNode;
}
export interface Reactive<T extends object> {
    object: T;
    beforeSet?: ReactiveCallback;
    afterSet?: ReactiveCallback;
}
export interface Attribute {
    readonly attribute: string;
    values: {
        readonly original: string;
        current?: () => any;
    };
}
export interface EventCallback {
    $event: Event;
    $el: HTMLElement;
    expr: string;
    node: ChevereNode;
    args: Args;
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
    $element: Element;
    parent: ChevereNode;
    Child: ActionDynamic<Attributes>;
}
export interface DataOn {
    parent: ChevereNode;
    attribute: string;
    Child: ActionDynamic<Attribute[]>;
    rescan: boolean;
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
    readonly name?: string;
    data: Data<any>;
    init?: initFunc;
    methods?: Data<Function>;
    watch?: Data<Watch>;
    readonly beforeUpdating?: () => void;
    readonly updated?: () => void;
}
export interface ChevereDataNode {
    el: HTMLElement;
    attr: string;
}
export interface ChevereWindow {
    search(...data: ChevereNodeData[]): void;
    make(data: ChevereNodeData, ...element: HTMLElement[]): void;
    searchInlines(): void;
}
export interface ChevereChild<T = Attributes> {
    $element: HTMLElement;
    parent: ChevereNode;
    attr?: T;
}
