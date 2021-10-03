import { Chevere } from "./index.js";
import { Helper } from "../utils/index.js";
export class ChevereInline extends Chevere {
    constructor(el) {
        super(el);
        this.data = {};
        this.methods = {};
        const obj = Object.entries(Helper.parser({
            expr: this.element.dataset.inline || "{}",
        }));
        this.data = this.parseData(obj.reduce((prev, [key, val]) => ({ ...prev, ...(typeof val != "function" && { [key]: val }) }), {}));
        this.methods = this.parseMethods({
            object: obj.reduce((prev, [key, val]) => ({ ...prev, ...(typeof val == "function" && { [key]: val }) }), {})
        });
        this.checkForActionsAndChilds();
        this.findRefs();
        Object.seal(this);
    }
    parseData(data) {
        return Helper.reactive({
            object: data,
            afterSet: (_, name) => {
                this.updateRelated(name);
            }
        });
    }
}
