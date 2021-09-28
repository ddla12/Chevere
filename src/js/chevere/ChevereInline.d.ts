import { Chevere } from "@chevere";
import { Data } from "@interfaces";
export declare class ChevereInline extends Chevere {
    data?: Data<any>;
    constructor(el: HTMLElement);
    parseData(data: Data<any>): Data<any>;
}
