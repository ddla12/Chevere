import { ChevereAction } from "./ActionNode";
import { Attribute, ChevereChild, LoopFragment, Data } from "@interfaces";
export declare class LoopNode extends ChevereAction<Attribute> {
    readonly variables: Data<string>;
    readonly templates: LoopFragment;
    constructor(data: ChevereChild<Attribute>);
    refreshAttribute(): void;
    parseAttribute(): void;
}
