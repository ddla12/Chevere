import { Chevere } from "./index.js";
import { Helper } from "../utils/index.js";
export class ChevereInline extends Chevere {
    constructor(el) {
        super(Helper.parser({
            expr: el.dataset.inline || "{}",
        }), el);
    }
}
