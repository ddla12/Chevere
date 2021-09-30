import { Attribute, ChevereChild } from "@types";
import { ChevereAction } from "./ActionNode";
export declare class EventNode extends ChevereAction<Attribute[]> {
    constructor(data: ChevereChild<Attribute[]>);
    refreshAttribute(): void;
    parseAttribute(): void;
}
