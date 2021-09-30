import { ChevereChild, Attribute } from "@types";
import { Chevere } from "@chevere";
export declare abstract class ChevereAction<Attributes> {
    element: HTMLElement;
    parent: Chevere;
    attr?: Attributes;
    constructor(data: ChevereChild<Attributes>);
    protected abstract parseAttribute(): void;
    abstract refreshAttribute(): void;
    setAction(): void;
    protected ifAttrIsEmpty(attr: Attribute): void;
}
