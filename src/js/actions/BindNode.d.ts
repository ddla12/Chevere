import { ChevereAction } from "./ActionNode";
import { Attribute, BindableAttr, ChevereChild } from "@interfaces";
/**
 * Child nodes with 'data-bind' attribute
 * @extends ChevereAction<Attribute>
 */
export declare class BindNode extends ChevereAction<Attribute[]> {
    attr: BindableAttr[];
    constructor(data: ChevereChild<Attribute[]>);
    setAction(): void;
    refreshAttribute(): void;
    parseAttribute(): void;
}
