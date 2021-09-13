import { Helper, Patterns } from "@helpers";
import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";

export class ShowNode extends ChevereAction<Attribute> {
    constructor(data: ChevereChild<Attribute>) {
        super(data);

        this.ifAttrIsEmpty(this.attr!);
        this.parseAttribute();
    }

    refreshAttribute(): void {
        this.attr!.values.current = Helper.parser<Boolean>({
            expr: this.attr!.values.original,
            node: this.parent
        });

        (this.element as HTMLElement).hidden = !(this.attr!.values.current);
    }

    parseAttribute(): void {
        try {
            if((!Patterns.attr.isBoolean.test(this.attr!.values.original)) 
            && (!Patterns.attr.isLogicalExpression.test(this.attr!.values.original)))
                throw new SyntaxError("data-show attribute only accept booleans");

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    };
};