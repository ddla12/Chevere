import { ChevereNode } from "@chevere";
import { InputModel } from "@interfaces";
import { Helper } from "@helpers";

/**
 * The class for those inputs elements that have the `data-model` attribute
 *  @class
 */
export class ModelNode implements InputModel {
    element: HTMLInputElement;
    parent: ChevereNode;
    variable: string;

    constructor(input: InputModel) {
        ({ parent: this.parent, element: this.element } = input);

        //Search if the indicated variable of the data-model attribute exists in the scope
        this.variable = this.getVariable();

        this.assignText(this.parent.data[this.variable].value.toString());

        //Add the listener
        this.element.addEventListener("input", this.syncText.bind(this));
    }

    /**
     * If input is neither type 'radio' nor type 'checkbox', sets its value according to the variable
     * @param {any} value The value
     */
    assignText(value: any): void {
        this.element.value = String(value);
    }

    syncText(): void {
        if(this.element.type == "checkbox") {
            const related = [...this.parent.element.querySelectorAll(
                `input[type="checkbox"][data-model="${this.element.getAttribute("data-model")}"]`
            )].filter((e) => e != this.element) as HTMLInputElement[];

            if(related.length) {
                this.parent.data[this.variable].value = (related.some((e) => (e.checked == true) && (e != this.element)))
                    ? related.filter((e) => e.checked == true).map((e) => e.value)
                    : ((this.element.checked) ? this.element.value : "");
            } else {
                this.parent.data[this.variable].value = (this.element.value == "on")
                    ? String(this.element.checked)
                    : (this.element.checked) ? this.element.value : "";
            }
        } else {
            this.parent.data[this.variable].value = String(this.element.value);
        }

    }

    /**
     * Find the variable that was indicated in the 'data-model' attribute 
     * @returns The variable to model
     */
    getVariable(): string {
        let attr = this.element.getAttribute("data-model")!;

        Helper.checkForErrorInVariable(attr);

        let variable = Object.keys(this.parent.data).find((data) => data == attr);

        if (!variable)
            throw new ReferenceError(
                `There's no a '${attr}' variable in the data-attached scope`,
            );

        return variable;
    }
}