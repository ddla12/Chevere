import { ChevereAction } from "./ActionNode";
import { Helper, Patterns } from "../utils/index.js";
export class TextNode extends ChevereAction {
    constructor(data) {
        super(data);
        this.ifAttrIsEmpty(this.attr);
        this.readAttribute(() => {
            if (Patterns.isObject.test(this.attr?.values.original) ||
                Patterns.methodSyntax.test(this.attr?.values.original))
                throw new SyntaxError("The 'data-text' attribute only accept strings concatenation, template literals, " +
                    "and a variable as reference");
        });
    }
    refresh() {
        this.element.textContent = this.attr.values.current();
    }
    setAction() {
        this.attr.values.current = () => Helper.parser({
            expr: this.attr?.values.original,
            node: this.parent,
            args: this.forVars
        });
        this.refresh();
    }
}
