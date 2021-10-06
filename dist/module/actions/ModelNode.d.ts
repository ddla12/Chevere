import { Attribute, ChevereChild } from "../@types.js";
import { ChevereAction } from "./ActionNode";
export declare class ModelNode extends ChevereAction<Attribute> {
    readonly variable: string;
    readonly inputType: string;
    readonly related?: HTMLInputElement[];
    constructor(data: ChevereChild<Attribute>);
    bindData(): void;
    refresh(): void;
    setAction(): void;
}
