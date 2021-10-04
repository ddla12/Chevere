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
    methods?: Data<Function> = {};

    constructor(el: HTMLElement) {
        super(el);

        const obj = Object.entries(
            Helper.parser<object>({
                expr: this.element.dataset.inline || "{}",
            }),
        );

        //Make the data reactive if it isn't undefined
        this.data = this.parseData(
            obj.reduce(
                (prev, [key, val]) => ({
                    ...prev,
                    ...(typeof val != "function" && { [key]: val }),
                }),
                {},
            ),
        );

        this.methods = this.parseMethods({
            object: obj.reduce(
                (prev, [key, val]) => ({
                    ...prev,
                    ...(typeof val == "function" && { [key]: val }),
                }),
                {},
            ),
        });

        this.checkForActionsAndChilds();
        this.findRefs();

        Object.seal(this);
    }

    parseData(data: Data<any>): Data<any> {
        return Helper.reactive({
            object: data,
            afterSet: (_, name) => {
                this.updateRelated(name!);
            },
        });
    }
}
