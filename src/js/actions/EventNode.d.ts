import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";
/**
 * Child nodes with 'data-on' attribute
 * @extends ChevereAction<Attribute[]>
 */
export declare class EventNode extends ChevereAction<Attribute[]> {
    constructor(data: ChevereChild<Attribute[]>);
    refreshAttribute(): void;
    parseAttribute(): void;
}
