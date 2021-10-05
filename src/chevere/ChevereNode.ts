import { Chevere } from "./Chevere";
import { ChevereNodeData } from "@types";
/**
 * Components with the 'data-attached' attribute
 * @extends Chevere
 */
export class ChevereNode extends Chevere {
    constructor(data: ChevereNodeData, el: HTMLElement) {
        super(data, el);
    }
}
