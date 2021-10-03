import { Chevere } from "./index.js";
import { Data } from "../@types.js";
export declare class ChevereInline extends Chevere {
    data?: Data<any>;
    methods?: Data<Function>;
    constructor(el: HTMLElement);
    parseData(data: Data<any>): Data<any>;
}
