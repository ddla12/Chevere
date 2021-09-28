import { ChevereChild, Attribute } from "@interfaces";
import { Chevere } from "@chevere";
/**
 * The main class of the child nodes
 * @abstract
 * @class
 */
export declare abstract class ChevereAction<Attributes> {
    element: HTMLElement;
    parent: Chevere;
    attr?: Attributes;
    constructor(data: ChevereChild<Attributes>);
    /**
     * Check for syntax error in attribute(s)
     * @abstract
     */
    protected abstract parseAttribute(): void;
    /**
     * Apply the proper action by the attribute
     * @abstract
     */
    abstract refreshAttribute(): void;
    /**
     * Method called when the component is updated
     */
    setAction(): void;
    /**
     * Attributes cannot be empty
     * @param attr
     */
    protected ifAttrIsEmpty(attr: Attribute): void;
}
