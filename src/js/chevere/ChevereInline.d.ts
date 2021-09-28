import { Chevere } from "@chevere";
import { Data } from "@interfaces";
/**
 * All components defined with the 'data-inline' attribute
 * @class
 * @extends {Chevere}
 */
export declare class ChevereInline extends Chevere {
    data?: Data<any>;
    constructor(el: HTMLElement);
    parseData(data: Data<any>): Data<any>;
}
