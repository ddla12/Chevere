import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";

export class EventNode extends ChevereAction<Attribute[]> {
    constructor(data: ChevereChild<Attribute[]>) {
        super(data);

        this.attr?.some((attr) => this.ifAttrIsEmpty(attr));

        this.parseAttribute();
    }

    refreshAttribute(): void {

    }

    parseAttribute(): void {

    }
}