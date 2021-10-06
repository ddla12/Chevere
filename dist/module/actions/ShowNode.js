import { Helper, Patterns } from "../utils/index.js";
import { ChevereAction } from "./ActionNode";
export class ShowNode extends ChevereAction {
    constructor(data) {
        super(data);
        this.display = getComputedStyle(this.element).display;
        this.ifAttrIsEmpty(this.attr);
        this.readAttribute(() => {
            if ((!Patterns.isBoolean.test(this.attr.values.original) &&
                !Patterns.isLogicalExpression.test(this.attr.values.original)) ||
                [...this.forVars.keys()].some((v) => !this.attr.values.original.includes(v)))
                throw new SyntaxError("data-show attribute only accept booleans");
        });
    }
    refresh() {
        this.element.style.display = !this.attr.values.current()
            ? "none"
            : this.display;
    }
    setAction() {
        this.attr.values.current = () => Helper.parser({
            expr: this.attr.values.original,
            node: this.parent,
            args: this.forVars
        });
        this.refresh();
    }
}
