import { ChevereAction } from "./ActionNode";
import { Attribute, ChevereChild, LoopFragment, Data } from "../@types.js";
export declare class LoopNode extends ChevereAction<Attribute> {
    readonly variables: Data<string>;
    readonly templates: LoopFragment;
    readonly pos: number;
    constructor(data: ChevereChild<Attribute>);
    refreshAttribute(): void;
    parseAttribute(): void;
}
