import { Attribute, ChevereChild } from "../@types.js";
import { ChevereAction } from "./ActionNode";
export declare class ShowNode extends ChevereAction<Attribute> {
    readonly display: string;
    constructor(data: ChevereChild<Attribute>);
    refresh(): void;
    setAction(): void;
}
