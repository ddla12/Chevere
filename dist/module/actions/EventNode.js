import { Helper, Patterns } from "../utils/index.js";
import { ChevereAction } from "./ActionNode";
export class EventNode extends ChevereAction {
    constructor(data) {
        super(data);
        this.attr?.some((attr) => this.ifAttrIsEmpty(attr));
        this.parseAttribute();
    }
    refreshAttribute() {
        let eventNames = this.attr.map((attr) => attr.attribute.replace(Patterns.bindAndOn, "").replace(/\..*/, ""));
        this.attr.forEach((attr, i) => {
            const modifier = attr.attribute.replace(/^.*\./, "");
            (modifier != "window" ? this.element : window).addEventListener(eventNames[i], (e) => {
                Helper.eventCallback({
                    $event: e,
                    expr: attr.values.original.includes("$emitSelf")
                        ? attr.values.original
                        : `$event.stopPropagation();${attr.values.original}`,
                    node: this.parent,
                    $el: this.element,
                });
            });
        });
    }
    parseAttribute() {
        try {
            if (this.attr.some((attr) => !Patterns.methodSyntax.test(attr.values.original) &&
                !Patterns.isVariableAssign.test(attr.values.original)))
                throw new SyntaxError("A 'data-on' attribute only accepts a method or a assignment as value");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
