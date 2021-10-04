export class ChevereAction {
    constructor(data) {
        ({
            element: this.element,
            parent: this.parent,
            attr: this.attr,
        } = data);
    }
    setAction() {}
    ifAttrIsEmpty(attr) {
        if (!attr.values.original)
            throw new SyntaxError(
                `The '${attr.attribute}' attribute cannot be empty`,
            );
    }
}
