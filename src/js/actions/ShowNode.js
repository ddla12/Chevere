import { Helper, Patterns } from "@helpers";
import { ChevereAction } from "./ActionNode";
export class ShowNode extends ChevereAction {
    constructor(data) {
        super(data);
        this.display = getComputedStyle(this.element).display;
        this.ifAttrIsEmpty(this.attr);
        this.parseAttribute();
    }
    setAction() {
        this.element.style.display = !this.attr.values.current()
            ? "none"
            : this.display;
    }
    refreshAttribute() {
        this.attr.values.current = () => Helper.parser({
            expr: this.attr.values.original,
            node: this.parent,
        });
        this.setAction();
    }
    parseAttribute() {
        try {
            if (!Patterns.isBoolean.test(this.attr.values.original) &&
                !Patterns.isLogicalExpression.test(this.attr.values.original))
                throw new SyntaxError("data-show attribute only accept booleans");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=ShowNode.js.map