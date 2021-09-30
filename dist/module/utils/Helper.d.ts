import { FindChilds, Relation, Parse, Attribute, DataOn, EventCallback } from "@types";
export declare const Helper: {
    getElementsBy(data: FindChilds<Attribute>): Relation;
    parser<T>(data: Parse): T;
    getElementsByDataOn(data: DataOn): Relation;
    eventCallback(data: EventCallback): () => void;
};
