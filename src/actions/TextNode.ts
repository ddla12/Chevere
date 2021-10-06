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
        this.readAttribute(() => {
            if (
                Patterns.isObject.test(this.attr?.values.original!) ||
                Patterns.methodSyntax.test(this.attr?.values.original!)
            )
                throw new SyntaxError(
                    "The 'data-text' attribute only accept strings concatenation, template literals, " +
                        "and a variable as reference",
                );
        });
    }

    refresh(): void {
        this.$element.textContent = this.attr!.values.current!();
    }

    setAction(): void {
        this.attr!.values.current = () =>
            Helper.parser<string>({
                expr: this.attr?.values.original!,
                node: this.parent,
                args: this.forVars
            });

        this.refresh();
    }
}
