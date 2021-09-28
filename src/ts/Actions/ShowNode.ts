import { Helper, Patterns } from "@helpers";
import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";

export class ShowNode extends ChevereAction<Attribute> {
    /**
     * The default display of the element
     */
    readonly display: string;

    constructor(data: ChevereChild<Attribute>) {
        super(data);

        this.display = getComputedStyle(this.element).display;

        this.ifAttrIsEmpty(this.attr!);
        this.parseAttribute();
    }

    setAction(): void {
        this.element.style.display = !this.attr!.values.current!()
            ? "none"
            : this.display!;
    }

    refreshAttribute(): void {
        this.attr!.values.current = (): boolean =>
            Helper.parser<boolean>({
                expr: this.attr!.values.original,
                node: this.parent,
            });

        this.setAction();
    }

    parseAttribute(): void {
        try {
            if (
                !Patterns.isBoolean.test(this.attr!.values.original) &&
                !Patterns.isLogicalExpression.test(this.attr!.values.original)
            )
                throw new SyntaxError(
                    "data-show attribute only accept booleans",
                );

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    }
}
