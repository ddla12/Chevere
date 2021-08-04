import { ChevereNode } from "@chevere";
import { InputModel } from "@interfaces";
import { Helper } from "@helpers";

/**
 * The class for those inputs elements that have the `data-model` attribute
 *  @class
 */
export class ModelNode implements InputModel {
    element: HTMLTextAreaElement | HTMLInputElement;
    parent: ChevereNode;
    variable: string;

    constructor(input: InputModel) {
        this.parent = input.parent;
        this.element = input.element as HTMLInputElement;

        //Search if the indicated variable of the data-model attribute exists in the scope
        this.variable = this.getVariable();

        //Set the default value
        this.element.value = this.parent.data[this.variable].value.toString();

        //Add the listener
        this.element.addEventListener("input", () => {
            this.syncText();
        });
    }

    assignText(value: any) {
        this.element.value = value.toString();
    }

    syncText() {
        this.parent.data[this.variable].value = this.element.value.toString();
    }

    getVariable(): string {
        let attr = this.element.getAttribute("data-model")!;

        Helper.checkForErrorInVariable(attr);

        let variable = Object.keys(this.parent.data).find(
            (data) => data == attr,
        );

        if (!variable)
            throw new ReferenceError(
                `There's no a '${attr}' variable in the data-attached scope`,
            );

        return variable;
    }
}