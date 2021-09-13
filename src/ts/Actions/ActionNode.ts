import { ChevereChild, Attribute } from "@interfaces";
import { ChevereNode } from "@chevere";

export abstract class ChevereAction<Attributes> {
    element : Element;
    parent  : ChevereNode;
    attr?   : Attributes;
    
    constructor(data: ChevereChild<Attributes>) {
        ({ 
            element : this.element, 
            parent  : this.parent,
            attr    : this.attr
        } = data);
    }

    protected abstract parseAttribute(): void;
    abstract refreshAttribute(): void;

    protected ifAttrIsEmpty(attr: Attribute): void {
        if(!attr.values.original)
            throw new SyntaxError(`The '${attr.attribute}' attribute cannot be empty`)
    }
}