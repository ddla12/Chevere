import { RegExpFactory } from "@helpers";
import {
    FindChilds,
    Parse,
    Attribute,
    DataOn,
    EventCallback,
    ChevereChild,
    Reactive,
} from "@types";

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
    getElementsBy(data: FindChilds<Attribute>): ChevereChild<Attribute>[] {
        const nodes = [...data.$element.querySelectorAll(data.selector)];

        return nodes.map(
            (node) =>
                new data.Child({
                    $element: node as HTMLElement,
                    parent: data.parent,
                    attr: {
                        attribute: data.attribute,
                        values: {
                            original: node.getAttribute(data.attribute)!,
                        },
                    },
                }),
        );
    },
    /**
     * Parse a javascript expression passed in a string, with or without 'this' and arguments
     * @param data
     * @returns Parsed data
     */
    parser<T>(data: Parse): T {
        return new Function(
            [...(data.args?.keys() || "")].join(","),
            `return ${data.expr}`,
        ).bind(data.node)(...[...(data.args?.values() || "")]);
    },
    /**
     * Search for elements with 'data-on/bind' attribute
     * @param data
     * @returns A list of ActionNodes<Attribute[]> related to the component
     */
    getElementsByDataOn(data: DataOn): ChevereChild<Attribute[]>[] {
        const regexp = RegExpFactory.bindOrOn(data.attribute),
            nodes = [...data.parent.$element.querySelectorAll((!data.rescan) ? "*" : "*[data-key]")].filter(
                (el) =>
                    [...el.attributes]
                        .map((attr) => attr.name)
                        .some((attr) => regexp.test(attr)),
            );

        return nodes.map(
            (node) =>
                new data.Child({
                    $element: node as HTMLElement,
                    parent: data.parent,
                    attr: [...node.attributes]
                        .map((attr) => attr.name)
                        .filter((attr) => regexp.test(attr))
                        .map((attr) => ({
                            attribute: attr,
                            values: {
                                original: node.getAttribute(attr)!,
                            },
                        })),
                }),
        );
    },
    /**
     * The callback that will be called in all EventNodes
     * @param data
     * @returns A callback with the proper 'this' and '$event'/'$el' parameters
     */
    eventCallback(data: EventCallback): () => void {
        return new Function(
            `$event, $el, ${[...data.args.keys()].join(",")}`, data.expr
            ).apply(
            data.node,
            [
                data.$event,
                data.$el,
                ...data.args.values()
            ]
        );
    },
    /**
     * Make data Reactive
     */
    reactive<T extends object>(data: Reactive<T>): T {
        return new Proxy(data.object, {
            get: (target, name, receiver) =>
                Reflect.get(target, name, receiver),
            set: (target, name, value, receiver) => {
                data.beforeSet && data.beforeSet(target, name as string, value);

                Reflect.set(target, name, value, receiver);

                data.afterSet && data.afterSet(target, name as string, value);

                return true;
            },
        });
    },
    /**
     * Generate a valid id for the element
     * @returns A valid id
     */
    setId(): string {
        return Math.random().toString(32).substr(2);
    },
};
