import { ChevereAction } from "./ActionNode";
import { Attribute, BindableAttr, BindForEach, ChevereChild } from "../@types.js";
export declare class BindNode extends ChevereAction<Attribute[]> {
    attr: BindableAttr[];
    constructor(data: ChevereChild<Attribute[]>);
    refresh(): void;
    attributeForEach(data: BindForEach): void;
    setBooleanAttributes(): void;
    setAttributes(): void;
    setAction(): void;
}
