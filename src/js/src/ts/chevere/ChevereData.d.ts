import { ChevereNodeData, Data, initFunc, Watch } from "@interfaces";
/**
 *  The class that users create their components
 *  @class
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
    initFunc(args?: string): Promise<void>;
}
