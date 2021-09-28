import { Helper, Patterns } from "@helpers";
import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";

export class EventNode extends ChevereAction<Attribute[]> {
    constructor(data: ChevereChild<Attribute[]>) {
        super(data);

        this.attr?.some((attr) => this.ifAttrIsEmpty(attr));

        this.parseAttribute();
    }

    refreshAttribute(): void {
        let eventNames = this.attr!.map((attr) => attr.attribute
            .replace(Patterns.attr.bindAndOn, "")
            .replace(/\..*/, ""));

        this.attr!.forEach((attr, i) => {
            const modifier: string = attr.attribute.replace(/^.*\./, "");

            ((modifier != "window") ? this.element : window).addEventListener(eventNames[i], (e) => {
                Helper.eventCallback({ 
                    $event: e, 
                    expr: ((attr.values.original.includes("$emitSelf")) 
                        ? attr.values.original
                        : `$event.stopPropagation();${attr.values.original}`
                    ), 
                    node: this.parent 
                });
            });
        });
    }

    parseAttribute(): void {
        try {
            if(this.attr!.some((attr) => 
                (!Patterns.attr.isMethod.test(attr.values.original)
                && !Patterns.attr.isVariableAssign.test(attr.values.original))))
                throw new SyntaxError("A 'data-on' attribute only accepts a method or a assignment as value");

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    }
}