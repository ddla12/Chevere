import { ChevereNode } from "./ChevereNode";
import { ChevereNodeData } from "@types";
/**
 * Components with the 'data-attached' attribute
 * @extends Chevere
 */
export class ChevereAttached extends ChevereNode {
    constructor(data: ChevereNodeData, el: HTMLElement) {
        super(data, el);
    }
}
