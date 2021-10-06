import { ChevereNode } from "./index.js";
import { Helper } from "../utils/index.js";
export class ChevereInline extends ChevereNode {
    constructor(el) {
        super(Helper.parser({
            expr: el.dataset.inline || "{}",
        }), el);
    }
}
