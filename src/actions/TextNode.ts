import { Attribute, ChevereChild } from "@types";
import { ChevereAction } from "./ActionNode";
import { Helper, Patterns } from "@helpers";

/**
 * Nodes with data-text attribute
 * @extends ChevereAction<Attribute>
 */
export class TextNode extends ChevereAction<Attribute> {
    constructor(data: ChevereChild<Attribute>) {
        super(data);

        this.ifAttrIsEmpty(this.attr!);
        this.parseAttribute();
    }

    setAction(): void {
        this.element.textContent = this.attr!.values.current!();
    }

    refreshAttribute(): void {
        this.attr!.values.current = () =>
            Helper.parser<string>({
                expr: this.attr?.values.original!,
                node: this.parent,
            });

        this.setAction();
    }

    parseAttribute(): void {
        try {
            if (
                Patterns.isObject.test(this.attr?.values.original!) ||
                Patterns.methodSyntax.test(this.attr?.values.original!)
            )
                throw new SyntaxError(
                    "The 'data-text' attribute only accept strings concatenation, template literals, " +
                        "and a variable as reference",
                );

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    }
}
