import { ChevereAction } from "./ActionNode";
import { Helper, Patterns } from "@helpers";
/**
 * Nodes with data-text attribute
 * @extends ChevereAction<Attribute>
 */
export class TextNode extends ChevereAction {
    constructor(data) {
        super(data);
        this.ifAttrIsEmpty(this.attr);
        this.parseAttribute();
    }
    setAction() {
        this.element.textContent = this.attr.values.current();
    }
    refreshAttribute() {
        this.attr.values.current = () => Helper.parser({
            expr: this.attr?.values.original,
            node: this.parent,
        });
        this.setAction();
    }
    parseAttribute() {
        try {
            if (Patterns.isObject.test(this.attr?.values.original) ||
                Patterns.methodSyntax.test(this.attr?.values.original))
                throw new SyntaxError("The 'data-text' attribute only accept strings concatenation, and a variable as reference");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=TextNode.js.map