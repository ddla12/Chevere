import { ChevereNodeData, Data, initFunc, Watch } from "../@types.js";
export declare class ChevereData implements ChevereNodeData {
    readonly name: string;
    data: Data<any>;
    methods?: Data<Function>;
    init: initFunc;
    watch?: Data<Watch>;
    readonly updated?: () => void;
    readonly updating?: () => void;
    constructor(data: ChevereNodeData);
    initFunc(args?: string): Promise<void>;
}
