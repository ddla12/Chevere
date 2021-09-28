import { ChevereAction } from "./ActionNode";
import { Attribute, ChevereChild, LoopFragment, Data } from "@interfaces";
export declare class LoopNode extends ChevereAction<Attribute> {
    /**
     * Component variable and loop variable
     */
    readonly variables: Data<string>;
    /**
     * Template content and fragment
     */
    readonly templates: LoopFragment;
    constructor(data: ChevereChild<Attribute>);
    refreshAttribute(): void;
    parseAttribute(): void;
}
