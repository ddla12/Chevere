import { Attribute, ChevereChild } from "@interfaces";
import { ChevereAction } from "./ActionNode";
/**
 * The inputs/textarea with 'data-model' attribute
 * @extends {ChevereAction<Attribute>}
 */
export declare class ModelNode extends ChevereAction<Attribute> {
    /**
     * The variable to bind
     */
    readonly variable: string;
    /**
     * The type of input
     */
    readonly inputType: string;
    /**
     * Array with ModelNodes with the same variable
     */
    readonly related?: HTMLInputElement[];
    constructor(data: ChevereChild<Attribute>);
    /**
     * If input is not neither 'radio' nor 'checkbox', set its value
     */
    bindData(): void;
    setAction(): void;
    refreshAttribute(): void;
    parseAttribute(): void;
}
