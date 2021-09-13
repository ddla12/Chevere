import { Attribute, Attributes, ChevereChild, ChevereElement, Data, Relation } from "@interfaces";
import { ChevereData } from "./ChevereData";
import { Helper } from "@helpers";
import { ChevereAction, EventNode, ShowNode, TextNode } from "@actions";

export class ChevereNode implements ChevereElement {
    name    : string;
    data    : Data<object>;
    id      : string;
    methods?: Data<Function>;
    element : Element;
    refs?   : Data<HTMLElement>;
    #childs? : Data<ChevereChild<Attributes>[]> = {
        "event"     : [],
        "data-text" : [],
        "data-model": [],
        "data-for"  : [],
        "data-show" : [],
        "data-ref"  : [],
        "data-bind" : [],
    };

    constructor(data: ChevereData, el: Element) {
        ({ name: this.name, methods: this.methods, } = data)

        this.data = this.parseData(data.data);

        /**
         * Get the parent `div` and give it a value for the data-id attribute
         */
        this.element = el;
        this.id = this.setId();
        this.element.setAttribute("data-id", this.id);

        /**
         *  Get the events and actions of the component
         */
        this.checkForActionsAndChilds();

        this.findRefs();
    }

    setId(): string {
        return Math.random().toString(32).substr(2);
    }

    findRefs(): void {
        this.refs = [...this.element.querySelectorAll("*[data-ref]")]
            .reduce((props, el) => {
                if(!el.getAttribute("data-ref"))
                    throw new SyntaxError("data-ref attribute cannot be empty");

                if(Object.keys({...props}).some((p) => p == el.getAttribute("data-ref")!))
                    throw new SyntaxError("It seems like there are repeated 'data-ref' values, check your 'data-ref' attributes")

                return {
                    ...props,
                    [el.getAttribute("data-ref")!]: el,
                }
            }, {});
    }

    refreshChilds(attr: string, name: string): void {
        this.#childs![attr].filter(
            (node) => ((node as ChevereChild<Attribute>).attr?.values.original.includes(name))
        ).forEach((node) => {
            (node as ChevereAction<Attribute>).refreshAttribute();
        });
    }
    /**
     * Parse all the data, they need getter and a setter
     * @param data The primitive data
     */
    parseData(data: Data<any>): Data<any> {
        const self = this;

        return new Proxy(data, {
            get(target, name, receiver) {
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
            
                ["data-show", "data-text"].forEach((attr) => self.refreshChilds(attr, (name as string)));

                return Reflect.set(target, name, value, receiver);
            }
        });
    }

    setChilds(data: Relation) {
        data.nodes.forEach((node) => {
            this.#childs![data.type].push(node);
        });
    }
    /**
     * Find all the childrens that have an action and data
     */
    checkForActionsAndChilds(): void {

            const childs  = [
                Helper.getElementsBy({
                    attribute: "data-text",
                    element: this.element,
                    parent: this,
                    selector: "*[data-text]",
                    child: TextNode
                }),
                Helper.getElementsBy({
                    attribute: "data-show",
                    element: this.element,
                    parent: this,
                    selector: "*[data-show]",
                    child: ShowNode
                }),
            ];

            childs.forEach((child) => (child.nodes.length) && this.setChilds(child));
    }
}