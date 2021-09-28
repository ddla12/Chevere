import { ChevereChild, Attribute } from "@interfaces";
import { ChevereNode } from "@chevere";
export declare abstract class ChevereAction<Attributes> {
    element: HTMLElement;
    parent: ChevereNode;
    attr?: Attributes;
    constructor(data: ChevereChild<Attributes>);
    protected abstract parseAttribute(): void;
    abstract refreshAttribute(): void;
    setAction(): void;
    protected ifAttrIsEmpty(attr: Attribute): void;
}
