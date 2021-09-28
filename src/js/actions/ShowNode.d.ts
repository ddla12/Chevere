import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";
export declare class ShowNode extends ChevereAction<Attribute> {
    /**
     * The default display of the element
     */
    readonly display: string;
    constructor(data: ChevereChild<Attribute>);
    setAction(): void;
    refreshAttribute(): void;
    parseAttribute(): void;
}
