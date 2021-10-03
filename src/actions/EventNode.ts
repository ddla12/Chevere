import { Helper, Patterns } from "@helpers";
import { Attribute, ChevereChild } from "@types";
import { ChevereAction } from "./ActionNode";

/**
 * Child nodes with 'data-on' attribute
 * @extends ChevereAction<Attribute[]>
 */
export class EventNode extends ChevereAction<Attribute[]> {
    constructor(data: ChevereChild<Attribute[]>) {
        super(data);

        this.attr?.some((attr) => this.ifAttrIsEmpty(attr));

        this.parseAttribute();
    }

    refreshAttribute(): void {
        //Get all event names defined in the attributes
        let eventNames = this.attr!.map((attr) =>
            attr.attribute.replace(Patterns.bindAndOn, "").replace(/\..*/, ""),
        );

        this.attr!.forEach((attr, i) => {
            //.self or .window modifier
            const modifier: string = attr.attribute.replace(/^.*\./, "");

            //Set the event in the proper scope
            (modifier != "window" ? this.element : window).addEventListener(
                eventNames[i],
                (e) => {
                    Helper.eventCallback({
                        $event: e,
                        expr: attr.values.original.includes("$emitSelf")
                            ? attr.values.original
                            : `$event.stopPropagation();${attr.values.original}`,
                        node: this.parent,
                        $el: this.element
                    });
                },
            );
        });
    }

    parseAttribute(): void {
        try {
            if (
                this.attr!.some(
                    (attr) =>
                        !Patterns.methodSyntax.test(attr.values.original) &&
                        !Patterns.isVariableAssign.test(attr.values.original),
                )
            )
                throw new SyntaxError(
                    "A 'data-on' attribute only accepts a method or a assignment as value",
                );

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    }
}
