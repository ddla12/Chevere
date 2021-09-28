import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";
import { Patterns } from "@helpers";

/**
 * The inputs/textarea with 'data-model' attribute
 * @extends {ChevereAction<Attribute>}
 */
export class ModelNode extends ChevereAction<Attribute> {
    /**
     * The variable to bind
     */
    readonly variable: string;
    /**
     * The type of input
     */
    readonly inputType: string;
    /**
     * Array with ModelNodes with the same variable
     */
    readonly related?: HTMLInputElement[];

    constructor(data: ChevereChild<Attribute>) {
        super(data);

        this.variable = this.attr!.values.original.replace("this.data.", "");
        this.inputType = (this.element as HTMLInputElement).type;

        this.inputType == "checkbox" &&
            (this.related = (
                [
                    ...this.parent.element.querySelectorAll(
                        `input[type='checkbox'][data-model='this.data.${this.variable}']`,
                    ),
                ] as HTMLInputElement[]
            ).filter((e) => e != this.element));

        this.ifAttrIsEmpty(this.attr!);
        this.parseAttribute();
    }

    /**
     * If input is not neither 'radio' nor 'checkbox', set its value
     */
    bindData(): void {
        if (!["radio", "checkbox"].includes(this.inputType))
            (this.element as HTMLInputElement).value = String(
                this.parent.data![this.variable],
            );
    }

    setAction(): void {
        this.parent.data![this.variable] =
            this.inputType != "checkbox"
                ? (this.element as HTMLInputElement).value
                : //Input type checkbox has an special deal
                !this.related?.length
                ? //If there are not related checkbox, bind a boolean value
                  (this.element as HTMLInputElement).checked
                : //else, push to array
                  [...this.related!, this.element as HTMLInputElement]
                      .filter((c) => c.checked)
                      .map((c) => c.value)
                      .join(",");
    }

    refreshAttribute(): void {
        this.element.addEventListener("input", this.setAction.bind(this));

        this.bindData();
    }

    parseAttribute(): void {
        try {
            if (!this.attr?.values.original!.match(Patterns.$data))
                throw new SyntaxError(
                    "The 'data-model' attribute only accept a property reference as value",
                );

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    }
}
