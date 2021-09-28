import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";
export declare class ShowNode extends ChevereAction<Attribute> {
    readonly display?: string;
    constructor(data: ChevereChild<Attribute>);
    setAction(): void;
    refreshAttribute(): void;
    parseAttribute(): void;
}
