import { Chevere } from "@chevere";
import { Helper } from "@helpers";
import { ChevereNodeData } from "@types";

/**
 * All components defined with the 'data-inline' attribute
 * @class
 * @extends {Chevere}
 */
export class ChevereInline extends Chevere {
    constructor(el: HTMLElement) {
        super(
            Helper.parser<object>({
                expr: el.dataset.inline || "{}",
            }) as ChevereNodeData,
            el
        );
    }
}
