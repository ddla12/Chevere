import { FindChilds, Parse, Attribute, DataOn, EventCallback, ChevereChild, Reactive } from "../@types.js";
export declare const Helper: {
    getElementsBy(data: FindChilds<Attribute>): ChevereChild<Attribute>[];
    parser<T>(data: Parse): T;
    getElementsByDataOn(data: DataOn): ChevereChild<Attribute[]>[];
    eventCallback(data: EventCallback): () => void;
    reactive<T_1 extends object>(data: Reactive<T_1>): T_1;
    setId(): string;
};
