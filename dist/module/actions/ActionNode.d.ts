import { ChevereChild, Attribute, Args } from "../@types.js";
import { ChevereNode } from "../chevere/index.js";
export declare abstract class ChevereAction<Attributes> {
    element: HTMLElement;
    parent: ChevereNode;
    attr?: Attributes;
    forVars?: Args;
    readonly readAttribute: (callback: () => void) => void;
    constructor(data: ChevereChild<Attributes>);
    abstract refresh(): void;
    protected abstract setAction(): void;
    protected ifAttrIsEmpty(attr: Attribute): void;
}
