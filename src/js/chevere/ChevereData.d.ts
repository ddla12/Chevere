import { ChevereNodeData, Data, initFunc, Watch } from "@interfaces";
/**
 *  The class with the data that will be passed to ChevereNode instances
 *  @class
 *  @implements {ChevereNodeData}
 */
export declare class ChevereData implements ChevereNodeData {
    readonly name: string;
    data: Data<any>;
    methods?: Data<Function>;
    init: initFunc;
    watch?: Data<Watch>;
    updated?: () => void;
    updating?: () => void;
    constructor(data: ChevereNodeData);
    /**
     * Execute the init function, it is in the ChevereData scope, so $refs are undefined
     * @param args if the 'data-attached' attribute has arguments
     */
    initFunc(args?: string): Promise<void>;
}
