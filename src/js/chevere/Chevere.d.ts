import { Attributes, ChevereChild, Data, Dispatch, Relation } from "@interfaces";
/**
 * The main Chevere class, all Chevere components must implement it
 * @class
 * @abstract
 */
export declare abstract class Chevere {
    id: string;
    element: HTMLElement;
    refs?: Data<HTMLElement>;
    childs?: Data<ChevereChild<Attributes>[]>;
    abstract data?: Data<any>;
    /**
     * Create a Chevere instance with an HTMLElement, then set it an id
     * @param element A element with 'data-attached/inline' attribute
     */
    constructor(element: HTMLElement);
    /**
     * Make the data reactive, setting a Proxy, ChevereInline doesn't have
     * the same Proxy as ChevereNode
     * @param data The reactive data
     * @abstract
     */
    abstract parseData(data: Data<any>): Data<any>;
    /**
     * Generate a valid id for the element
     * @returns A valid id
     */
    setId(): string;
    /**
     * Find and set the $refs of the component
     */
    findRefs(): void;
    /**
     * Update all child nodes by a data reference, and attribute
     * @param attr The name of the group to refresh
     * @param name The name of the data property to filter the childs
     */
    refreshChilds(attr: string, name: string): void;
    /**
     * Emit a event in the window scope
     * @param data A valid event data
     */
    $emit(data: Dispatch): void;
    /**
     * Push into 'this.childs' arrays by attribute
     * @param data The list of related nodes
     */
    setChilds(data: Relation): void;
    checkForActionsAndChilds(): void;
    /**
     * Emit an event in the component scope
     * @param data A valid event data
     */
    $emitSelf(data: Dispatch): void;
    /**
     * Update all child nodes data
     * @param name A data property name
     */
    updateRelated(name: string): void;
}
