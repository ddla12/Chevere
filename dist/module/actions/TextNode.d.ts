import { Attribute, ChevereChild } from "../@types.js";
import { ChevereAction } from "./ActionNode";
export declare class TextNode extends ChevereAction<Attribute> {
    constructor(data: ChevereChild<Attribute>);
    setAction(): void;
    refreshAttribute(): void;
    parseAttribute(): void;
}
