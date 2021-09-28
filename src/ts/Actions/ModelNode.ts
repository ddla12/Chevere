import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";
import { Patterns } from "@helpers";

export class ModelNode extends ChevereAction<Attribute> { 
    readonly variable: string;
    readonly inputType: string;
    readonly related?: HTMLInputElement[];

    constructor(data: ChevereChild<Attribute>) {
        super(data);

        this.variable = this.attr!.values.original.replace("this.data.", "");
        this.inputType = (this.element as HTMLInputElement).type;

        (this.inputType == "checkbox") && (this.related = ([...this.parent.element
            .querySelectorAll(`input[type='checkbox'][data-model='this.data.${this.variable}']`)] as HTMLInputElement[])
            .filter((e) => e != this.element));

        this.ifAttrIsEmpty(this.attr!);
        this.parseAttribute();
    }

    bindData(): void {
        if(!["radio", "checkbox"].includes(this.inputType))
            (this.element as HTMLInputElement).value = String(this.parent.data![this.variable]);
    }

    setAction(): void {
        this.parent.data![this.variable] = (this.inputType != "checkbox")
            ? (this.element as HTMLInputElement).value
            : ((!this.related?.length)
                ? (this.element as HTMLInputElement).checked
                : [...this.related!, (this.element as HTMLInputElement)]
                    .filter((c) => c.checked)
                    .map((c) => c.value)
                    .join(","));
    };

    refreshAttribute(): void {
        this.element.addEventListener("input", this.setAction.bind(this));

        this.bindData();
    }

    parseAttribute(): void {
        try {
            if(!this.attr?.values.original!.match(Patterns.global.$data))
                throw new SyntaxError("The 'data-model' attribute only accept a property reference as value");

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    }
}