import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";
/**
 * Nodes with data-text attribute
 * @extends ChevereAction<Attribute>
 */
export declare class TextNode extends ChevereAction<Attribute> {
    constructor(data: ChevereChild<Attribute>);
    setAction(): void;
    refreshAttribute(): void;
    parseAttribute(): void;
}
