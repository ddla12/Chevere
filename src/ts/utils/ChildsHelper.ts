import { BindChild, EventElements } from "@interfaces";
import { ChevereNode } from "@chevere";
import { Patterns } from "@helpers";

export const ChildsHelper = {
    getElementsByDataOnAttr(element: Element): EventElements {
        let nodes: EventElements = [];

        //Get all childs of the element
        const childs: NodeListOf<Element> = element.querySelectorAll("*");

        //Push to `nodes` all elements with the 'data-on' or '@on' attribute
        for(let child of childs) {
            for(let attr of child.attributes) {
                if(attr.name.startsWith("data-on")) 
                    nodes.push([child, attr.name.split(":")[1], attr.nodeValue!]);
                else if(attr.name.startsWith("@on")) 
                    nodes.push([child, attr.name.replace("@on", "").toLowerCase(), attr.nodeValue!])
            }
        }

        return (nodes.length == 0) ? undefined : nodes;
    },
    getElementsByDataBind(element: Element, node: ChevereNode): BindChild[] {
        return [...element.querySelectorAll("*")].filter((e) => 
            [...e.attributes].some((attr) => Patterns.bind.attr.test(attr.name))
        ).map((element) => {
            let attr: string = [...element.attributes].map((attr) => attr.name).find((attr) => Patterns.bind.attr.test(attr))!;
            
            let modifier = Patterns.bind.string.test(element.getAttribute(attr)!) 
                ? "string"
                : Patterns.bind.object.test(element.getAttribute(attr)!) ? "object"
                : "";

            return { 
                element: element as HTMLElement,
                parent: node,
                attribute: {
                    attribute: attr,
                    modifier: modifier,
                    values: {
                        original: element.getAttribute(attr)!,
                        current: element.getAttribute(attr)!,
                    }
                }
            };
        });
    },
    getElementsByDataTextAttr(element: Element): NodeListOf<Element> {
        return element.querySelectorAll("*[data-text]");
    },
    getElementsByDataModelAttr(element: Element): NodeListOf<Element> {
        return element.querySelectorAll("input[data-model], textarea[data-model], select[data-model]");
    },
    getElementsByDataFor(element: Element): NodeListOf<HTMLTemplateElement> {
        return element.querySelectorAll("template[data-for]");
    },
    getElementsByDataShow(element: Element): NodeListOf<Element> {
        return element.querySelectorAll("*[data-show]");
    },
    getElementsByDataRef(element: Element): NodeListOf<Element> {
        return element.querySelectorAll("*[data-ref]");
    }
};