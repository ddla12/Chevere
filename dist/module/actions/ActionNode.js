import { Helper } from "../utils/index.js";
export class ChevereAction {
    constructor(data) {
        this.readAttribute = (callback) => {
            try {
                callback();
                this.setAction();
            }
            catch (error) {
                console.error(error);
            }
        };
        ({
            $element: this.$element,
            parent: this.parent,
            attr: this.attr,
        } = data);
        this.forVars = new Map([...Object.entries(Helper.parser({
                expr: this.$element.dataset.forRef || "{}",
                node: this.parent
            })) || []]);
    }
    ifAttrIsEmpty(attr) {
        if (!attr.values.original)
            throw new SyntaxError(`The '${attr.attribute}' attribute cannot be empty`);
    }
}
