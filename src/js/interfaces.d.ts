import { ChevereData, Chevere } from "@chevere";
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
export declare type Watch = ((value: any, oldValue?: any) => void) | undefined;
export declare type Pattern = Data<RegExp>;
/**
 * The parser function argument
 */
export interface Parse {
    /**
     * The expression that will be parse
     */
    expr: string;
    /**
     * The arguments to apply to the callback
     */
    args?: Args;
    /**
     * 'This' scope
     */
    node?: Chevere;
}
export interface Attribute {
    /**
     * The real attribute, with or without 'data-' prefix
     */
    readonly attribute: string;
    values: {
        /**
         * The value placed on the DOM
         */
        readonly original: string;
        /**
         * The value after reactivity (It isn't in the attribute)
         */
        current?: () => any;
    };
}
export interface EventCallback {
    /**
     * Event data
     */
    $event: Event;
    /**
     * The expresion to be evaluate
     */
    expr: string;
    /**
     * This scope
     */
    node: Chevere;
}
export interface BindableAttr extends Attribute {
    /**
     * The attribute to bind
     */
    readonly bindAttr: string;
    /**
     * The value of the attribute
     */
    readonly bindValue?: string;
    /**
     * If the attribute value is an object, template literal or a variable reference
     */
    readonly type: string;
    /**
     * The callback to be call on each refresh
     */
    predicate?: () => void;
}
export interface ActionDynamic<Attributes> {
    new (data: ChevereChild<Attributes>): ChevereChild<Attributes>;
}
export interface FindChilds<Attributes> {
    /**
     * The 'querySelector' value
     */
    selector: string;
    /**
     * The 'data-' attribute
     */
    attribute: string;
    /**
     * The component element
     */
    element: Element;
    /**
     * The Chevere component
     */
    parent: Chevere;
    /**
     * The child node class
     */
    Child: ActionDynamic<Attributes>;
}
export interface Relation {
    /**
     * Related attribute
     */
    type: string;
    /**
     *  List of childs
     */
    nodes: ChevereChild<Attributes>[];
}
export interface DataOn {
    /**
     * Chevere component
     */
    parent: Chevere;
    /**
     * 'data-bind' or 'data-on',
     */
    attribute: string;
    /**
     * List of childs
     */
    Child: ActionDynamic<Attribute[]>;
}
export interface LoopFragment {
    /**
     * Content of the template
     */
    readonly content: DocumentFragment;
    /**
     * Fragment where the LoopNode is
     */
    readonly fragment: DocumentFragment;
}
export interface BindData {
    /**
     * Original bind value
     */
    readonly original: string;
    /**
     * The bind value after callback() is called
     */
    current: string;
    /**
     * Callback that refresh the bind value
     */
    callback: () => string | object;
}
export interface Dispatch {
    /**
     * Name of the event
     */
    readonly name: string;
    /**
     * Details of the event
     */
    readonly detail?: object;
}
export interface ChevereNodeData {
    /**
     * Name of the component
     */
    readonly name: string;
    /**
     * Component data
     */
    data: Data<any>;
    /**
     * Init function of the data
     */
    init?: initFunc;
    /**
     * Component methods
     */
    methods?: Data<Function>;
    /**
     * Watch component methods
     */
    watch?: Data<Watch>;
    /**
     * Function to be call before an update
     */
    updating?: () => void;
    /**
     * Function to be call after an update
     */
    updated?: () => void;
}
/**
 * Node data found on the DOM
 */
export interface ChevereDataNode {
    el: HTMLElement;
    attr: string;
}
export interface ChevereWindow {
    findItsData(attr: string, ...data: ChevereData[]): ChevereData;
    start(...data: ChevereData[]): void;
    data(data: ChevereNodeData): ChevereData;
}
export interface ChevereChild<T = Attributes> {
    element: HTMLElement;
    parent: Chevere;
    attr?: T;
}
