/**
 * The main class of the child nodes
 * @abstract
 * @class
 */
export class ChevereAction {
    constructor(data) {
        ({
            element: this.element,
            parent: this.parent,
            attr: this.attr,
        } = data);
    }
    /**
     * Method called when the component is updated
     */
    setAction() { }
    /**
     * Attributes cannot be empty
     * @param attr
     */
    ifAttrIsEmpty(attr) {
        if (!attr.values.original)
            throw new SyntaxError(`The '${attr.attribute}' attribute cannot be empty`);
    }
}
//# sourceMappingURL=ActionNode.js.map