import { RegExpFactory } from "@helpers";
import { FindChilds, Relation, Parse, Attribute, DataOn, EventCallback } from "@interfaces";

export const Helper = {
    getElementsBy(data: FindChilds<Attribute>): Relation {
        const nodes = [...data.element.querySelectorAll(data.selector)];
    
        return {
            type: data.attribute,
            nodes: nodes.map((node) => new data.Child({
                element: node as HTMLElement,
                parent: data.parent,
                attr: {
                    attribute: data.attribute,
                    values: {
                        original: node.getAttribute(data.attribute)!
                    }
                }
            }))
        };
    },
    parser<T>(data: Parse): T {
        return new Function(
            [...(data.args?.keys() || "")].join(","), 
            `return ${data.expr}`
        ).bind(data.node)(...[...(data.args?.values() || "")]);
    },
    getElementsByDataOn(data: DataOn): Relation {
        const regexp = RegExpFactory.bindOrOn(data.attribute),
            nodes = [...data.parent.element.querySelectorAll("*")]
            .filter((el) => [...el.attributes]
                .map((attr) => attr.name)
                .some((attr) => regexp.test(attr)));

        return {
            type: `data-${data.attribute}`,
            nodes: nodes.map((node) => new data.Child({
                element: node as HTMLElement,
                parent: data.parent,
                attr: [...node.attributes]
                    .map((attr) => attr.name)
                    .filter(attr => regexp.test(attr))
                    .map((attr) => ({
                        attribute: attr,
                        values: {
                            original: node.getAttribute(attr)!
                        }
                    }))
            })),
        };
    },
    eventCallback(data: EventCallback): (() => void) {
        return new Function("$event, $el", data.expr).bind(data.node, data.$event, data.node.element)()
    }
};