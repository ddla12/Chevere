import { ChevereAction } from "./ActionNode";
import { Patterns } from "@helpers";
/**
 * The inputs/textarea with 'data-model' attribute
 * @extends {ChevereAction<Attribute>}
 */
export class ModelNode extends ChevereAction {
    constructor(data) {
        super(data);
        this.variable = this.attr.values.original.replace("this.data.", "");
        this.inputType = this.element.type;
        this.inputType == "checkbox" &&
            (this.related = [
                ...this.parent.element.querySelectorAll(`input[type='checkbox'][data-model='this.data.${this.variable}']`),
            ].filter((e) => e != this.element));
        this.ifAttrIsEmpty(this.attr);
        this.parseAttribute();
    }
    /**
     * If input is not neither 'radio' nor 'checkbox', set its value
     */
    bindData() {
        if (!["radio", "checkbox"].includes(this.inputType))
            this.element.value = String(this.parent.data[this.variable]);
    }
    setAction() {
        this.parent.data[this.variable] =
            this.inputType != "checkbox"
                ? this.element.value
                : //Input type checkbox has an special deal
                    !this.related?.length
                        ? //If there are not related checkbox, bind a boolean value
                            this.element.checked
                        : //else, push to array
                            [...this.related, this.element]
                                .filter((c) => c.checked)
                                .map((c) => c.value)
                                .join(",");
    }
    refreshAttribute() {
        this.element.addEventListener("input", this.setAction.bind(this));
        this.bindData();
    }
    parseAttribute() {
        try {
            if (!this.attr?.values.original.match(Patterns.$data))
                throw new SyntaxError("The 'data-model' attribute only accept a property reference as value");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=ModelNode.js.map