import { BindNode, ModelNode } from "@actions";
import { Chevere } from "@chevere";
import { Helper } from "@helpers";
import { Data } from "@interfaces";

/**
 * All components defined with the 'data-inline' attribute
 * @class
 * @extends {Chevere}
 */
export class ChevereInline extends Chevere {
    data?: Data<any> = {};

    constructor(el: HTMLElement) {
        super(el);

        //Make the data reactive if it isn't undefined
        this.data = this.parseData(
            Helper.parser<object>({
                expr: this.element.dataset.inline || "{}",
            }),
        );

        this.checkForActionsAndChilds();
        this.findRefs();

        Object.seal(this);
    }

    parseData(data: Data<any>): Data<any> {
        const self = this;

        return new Proxy(data, {
            get(target, name, receiver) {
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                Reflect.set(target, name, value, receiver);

                self.updateRelated(name as string);

                return true;
            },
        });
    }
}
