import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";
export declare class EventNode extends ChevereAction<Attribute[]> {
    constructor(data: ChevereChild<Attribute[]>);
    refreshAttribute(): void;
    parseAttribute(): void;
}
