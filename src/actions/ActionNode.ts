import { ChevereChild, Attribute } from "@types";
import { Chevere } from "@chevere";

/**
 * The main class of the child nodes
 * @abstract
 * @class
 */
export abstract class ChevereAction<Attributes> {
    element: HTMLElement;
    parent: Chevere;
    attr?: Attributes;

    constructor(data: ChevereChild<Attributes>) {
        ({
            element: this.element,
            parent: this.parent,
            attr: this.attr,
        } = data);
    }

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
    setAction(): void {}

    /**
     * Attributes cannot be empty
     * @param attr
     */
    protected ifAttrIsEmpty(attr: Attribute): void {
        if (!attr.values.original)
            throw new SyntaxError(
                `The '${attr.attribute}' attribute cannot be empty`,
            );
    }
}
