import { Chevere } from "@chevere";
import { Data } from "@interfaces";
export declare class ChevereInline extends Chevere {
    _attributes: Data<boolean>;
    constructor(el: HTMLElement);
    set attributes(attributes: string[]);
    actions(): void;
}
