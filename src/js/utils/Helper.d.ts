import { FindChilds, Relation, Parse, Attribute, DataOn, EventCallback } from "@interfaces";
/**
 * The global Helper object, used to find childs, parse data and create callbacks
 */
export declare const Helper: {
    /**
     * Search for related 'data-text', 'data-model', 'data-show' and 'data-for'
     * nodes in the component scope
     * @param data
     * @returns A list of ActionNode<Attribute> related to the component
     */
    getElementsBy(data: FindChilds<Attribute>): Relation;
    /**
     * Parse a javascript expression passed in a string, with or without 'this' and arguments
     * @param data
     * @returns Parsed data
     */
    parser<T>(data: Parse): T;
    /**
     * Search for elements with 'data-on/bind' attribute
     * @param data
     * @returns A list of ActionNodes<Attribute[]> related to the component
     */
    getElementsByDataOn(data: DataOn): Relation;
    /**
     * The callback that will be called in all EventNodes
     * @param data
     * @returns A callback with the proper 'this' and '$event'/'$el' parameters
     */
    eventCallback(data: EventCallback): () => void;
};
