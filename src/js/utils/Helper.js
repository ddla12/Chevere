import { RegExpFactory } from "@helpers";
/**
 * The global Helper object, used to find childs, parse data and create callbacks
 */
export const Helper = {
    /**
     * Search for related 'data-text', 'data-model', 'data-show' and 'data-for'
     * nodes in the component scope
     * @param data
     * @returns A list of ActionNode<Attribute> related to the component
     */
    getElementsBy(data) {
        const nodes = [...data.element.querySelectorAll(data.selector)];
        return {
            type: data.attribute,
            nodes: nodes.map((node) => new data.Child({
                element: node,
                parent: data.parent,
                attr: {
                    attribute: data.attribute,
                    values: {
                        original: node.getAttribute(data.attribute),
                    },
                },
            })),
        };
    },
    /**
     * Parse a javascript expression passed in a string, with or without 'this' and arguments
     * @param data
     * @returns Parsed data
     */
    parser(data) {
        return new Function([...(data.args?.keys() || "")].join(","), `return ${data.expr}`).bind(data.node)(...[...(data.args?.values() || "")]);
    },
    /**
     * Search for elements with 'data-on/bind' attribute
     * @param data
     * @returns A list of ActionNodes<Attribute[]> related to the component
     */
    getElementsByDataOn(data) {
        const regexp = RegExpFactory.bindOrOn(data.attribute), nodes = [...data.parent.element.querySelectorAll("*")].filter((el) => [...el.attributes]
            .map((attr) => attr.name)
            .some((attr) => regexp.test(attr)));
        return {
            type: `data-${data.attribute}`,
            nodes: nodes.map((node) => new data.Child({
                element: node,
                parent: data.parent,
                attr: [...node.attributes]
                    .map((attr) => attr.name)
                    .filter((attr) => regexp.test(attr))
                    .map((attr) => ({
                    attribute: attr,
                    values: {
                        original: node.getAttribute(attr),
                    },
                })),
            })),
        };
    },
    /**
     * The callback that will be called in all EventNodes
     * @param data
     * @returns A callback with the proper 'this' and '$event'/'$el' parameters
     */
    eventCallback(data) {
        return new Function("$event, $el", data.expr).bind(data.node, data.$event, data.node.element)();
    },
};
//# sourceMappingURL=Helper.js.map