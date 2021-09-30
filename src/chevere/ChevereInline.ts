import { Chevere } from "@chevere";
import { Helper } from "@helpers";
import { Data } from "@types";

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
        return new Proxy(data, {
            get: (target, name, receiver) => Reflect.get(target, name, receiver),
            set: (target, name, value, receiver) => {
                Reflect.set(target, name, value, receiver);

                this.updateRelated(name as string);

                return true;
            },
        });
    }
}
