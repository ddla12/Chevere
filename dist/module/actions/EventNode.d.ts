import { Attribute, ChevereChild } from "../@types.js";
import { ChevereAction } from "./ActionNode";
export declare class EventNode extends ChevereAction<Attribute[]> {
    constructor(data: ChevereChild<Attribute[]>);
    refresh(): void;
    setAction(): void;
}
