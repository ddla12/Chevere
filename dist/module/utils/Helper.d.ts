import {
    FindChilds,
    Relation,
    Parse,
    Attribute,
    DataOn,
    EventCallback,
    Reactive,
} from "../@types.js";
export declare const Helper: {
    getElementsBy(data: FindChilds<Attribute>): Relation;
    parser<T>(data: Parse): T;
    getElementsByDataOn(data: DataOn): Relation;
    eventCallback(data: EventCallback): () => void;
    reactive<T_1 extends object>(data: Reactive<T_1>): T_1;
};
