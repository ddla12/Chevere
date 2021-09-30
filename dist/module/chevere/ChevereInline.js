import { Chevere } from "@chevere";
import { Helper } from "@helpers";
export class ChevereInline extends Chevere {
    constructor(el) {
        super(el);
        this.data = {};
        this.data = this.parseData(Helper.parser({
            expr: this.element.dataset.inline || "{}",
        }));
        this.checkForActionsAndChilds();
        this.findRefs();
        Object.seal(this);
    }
    parseData(data) {
        return new Proxy(data, {
            get: (target, name, receiver) => Reflect.get(target, name, receiver),
            set: (target, name, value, receiver) => {
                Reflect.set(target, name, value, receiver);
                this.updateRelated(name);
                return true;
            },
        });
    }
}
