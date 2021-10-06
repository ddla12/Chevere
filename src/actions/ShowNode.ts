import { Helper, Patterns } from "@helpers";
import { Attribute, ChevereChild } from "@types";
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
        this.readAttribute(() => {
            if (
                (!Patterns.isBoolean.test(this.attr!.values.original) &&
                !Patterns.isLogicalExpression.test(this.attr!.values.original)) || 
                [...this.forVars!.keys()].some((v) => !this.attr!.values.original.includes(v))
            )
                throw new SyntaxError(
                    "data-show attribute only accept booleans",
                );
        });
    }

    refresh(): void {
        this.element.style.display = !this.attr!.values.current!()
            ? "none"
            : this.display!;
    }

    setAction(): void {
        this.attr!.values.current = (): boolean =>
            Helper.parser<boolean>({
                expr: this.attr!.values.original,
                node: this.parent,
                args: this.forVars
            });

        this.refresh();
    }
}
