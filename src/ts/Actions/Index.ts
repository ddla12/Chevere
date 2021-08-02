import ChevereNode from "../chevere/ChevereNode";
import { TextRelation, InputModel } from "../interfaces";
import { Helper } from "../utils/Helper";

export class TextAction implements TextRelation {
    element: Element;
    parent: ChevereNode;
    _variable?: any;

    constructor(data: TextRelation) {
        this.element = data.element;
        this.element.setAttribute("data-id", Helper.setDataId(10));

        this.parent = data.parent;

        this.variable = this.element.getAttribute("data-text")!;

        this.element.textContent = this._variable.value;
    }

    setText(value: any) {
        this.element.textContent = value.toString();
    }

    set variable(attr: string) {
        Helper.checkForErrorInVariable(attr);

        const arrAttr: string = attr.split(".").splice(1).join(".");

        const customObjAttr = attr.replace(/\..*/, ``);

        let parentVar = Object.keys(this.parent.data).find(
            (d) => d == customObjAttr,
        );

        if (!parentVar)
            throw new ReferenceError(
                `The variable or method named '${parentVar}' wasn't found on the data-attached scope`,
            );

        if (arrAttr === "") this._variable = this.parent.data[parentVar];
        else {
            let arr: string[] = arrAttr.split(".");
            let last: string = arr[arr.length - 1];
            let length: number = arr.length - 1;

            //Find the nested property by recursivity
            function findProperty(
                obj: any,
                key: any,
                pos: number,
                nested: number,
            ): any {
                if (nested == length) {
                    if (obj.hasOwnProperty(key)) return obj[key];
                    else
                        throw new ReferenceError(
                            `There's no a '${key}' property in the '${obj}' property,  the ${parentVar}`,
                        );
                } else {
                    return findProperty(
                        obj[arr[pos]],
                        last,
                        pos + 1,
                        nested + 1,
                    );
                }
            }

            let exists = findProperty(
                this.parent.data[parentVar].value,
                last,
                0,
                0,
            );

            console.log(exists);
            if (!exists)
                throw new ReferenceError(
                    `The property named '${arrAttr}' wasn't found on the '${parentVar}' data`,
                );

            this._variable = exists;
        }
    }
}

/**
 * The class for those inputs elements that have the `data-model` attribute
 *  @class
 */
export class InputAction implements InputModel {
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