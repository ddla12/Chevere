import { Chevere } from "@chevere";
import { Helper } from "@helpers";
/**
 * All components defined with the 'data-inline' attribute
 * @class
 * @extends {Chevere}
 */
export class ChevereInline extends Chevere {
    constructor(el) {
        super(el);
        this.data = {};
        //Make the data reactive if it isn't undefined
        this.data = this.parseData(Helper.parser({
            expr: this.element.dataset.inline || "{}",
        }));
        this.checkForActionsAndChilds();
        this.findRefs();
        Object.seal(this);
    }
    parseData(data) {
        const self = this;
        return new Proxy(data, {
            get(target, name, receiver) {
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                Reflect.set(target, name, value, receiver);
                self.updateRelated(name);
                return true;
            },
        });
    }
}
//# sourceMappingURL=ChevereInline.js.map