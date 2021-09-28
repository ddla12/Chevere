import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";
export declare class ModelNode extends ChevereAction<Attribute> {
    readonly variable: string;
    readonly inputType: string;
    readonly related?: HTMLInputElement[];
    constructor(data: ChevereChild<Attribute>);
    bindData(): void;
    setAction(): void;
    refreshAttribute(): void;
    parseAttribute(): void;
}
