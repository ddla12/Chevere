import { ChevereChild, Attribute, Args } from "@types";
import { ChevereNode } from "@chevere";
import { Helper } from "@helpers";

/**
 * The main class of the child nodes
 * @abstract
 * @class
 */
export abstract class ChevereAction<Attributes> {
    element : HTMLElement;
    parent  : ChevereNode;
    attr?   : Attributes;
    forVars?: Args;
    /**
     * Check for syntax error in attribute(s)
     */
    readonly readAttribute = (callback: () => void) => {
        try {
            callback();
            this.setAction();
        } catch (error) {
            console.error(error);
        }
    };

    constructor(data: ChevereChild<Attributes>) {
        ({
            element: this.element,
            parent: this.parent,
            attr: this.attr,
        } = data);

        this.forVars = new Map(
            [...Object.entries(Helper.parser({ 
                expr: this.element.dataset.forRef || "{}", 
                node: this.parent 
            })) || []]
        );
    }

    /**
     * Method called when the component is updated
     * @abstract
     */
    abstract refresh(): void;

    /**
     * Apply the proper action by the attribute
     */
    protected abstract setAction(): void;

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
