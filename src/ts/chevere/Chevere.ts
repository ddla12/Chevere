import {
    BindNode,
    ChevereAction,
    EventNode,
    LoopNode,
    ModelNode,
    ShowNode,
    TextNode,
} from "@actions";
import { Helper } from "@helpers";
import {
    Attribute,
    Attributes,
    ChevereChild,
    Data,
    Dispatch,
    Relation,
} from "@interfaces";

/**
 * The main Chevere class, all Chevere components must implement it
 * @class
 * @abstract
 */
export abstract class Chevere {
    id: string;
    element: HTMLElement;
    refs?: Data<HTMLElement>;
    //All the childs order by attribute
    childs?: Data<ChevereChild<Attributes>[]> = {
        "data-on": [],
        "data-text": [],
        "data-model": [],
        "data-for": [],
        "data-show": [],
        "data-ref": [],
        "data-bind": [],
    };
    //ChevereInline can have an undefined data
    abstract data?: Data<any>;

    /**
     * Create a Chevere instance with an HTMLElement, then set it an id
     * @param element A element with 'data-attached/inline' attribute
     */
    constructor(element: HTMLElement) {
        this.element = element;
        this.id = this.setId();
        this.element.dataset.id = this.id;
    }

    /**
     * Make the data reactive, setting a Proxy, ChevereInline doesn't have
     * the same Proxy as ChevereNode
     * @param data The reactive data
     * @abstract
     */
    abstract parseData(data: Data<any>): Data<any>;

    /**
     * Generate a valid id for the element
     * @returns A valid id
     */
    setId(): string {
        return Math.random().toString(32).substr(2);
    }

    /**
     * Find and set the $refs of the component
     */
    findRefs(): void {
        this.refs = (
            [...this.element.querySelectorAll("*[data-ref]")] as HTMLElement[]
        ).reduce((props, el) => {
            //If the attribute is empty
            if (!el.dataset.ref)
                throw new SyntaxError("data-ref attribute cannot be empty");

            //If there are repeated 'data-ref' values
            if (Object.keys({ ...props }).some((p) => p == el.dataset.ref!))
                throw new SyntaxError(
                    "It seems like there are repeated 'data-ref' values, check your 'data-ref' attributes",
                );

            return {
                ...props,
                [el.dataset.ref!]: el,
            };
        }, {});
    }

    /**
     * Update all child nodes by a data reference, and attribute
     * @param attr The name of the group to refresh
     * @param name The name of the data property to filter the childs
     */
    refreshChilds(attr: string, name: string): void {
        this.childs![attr].filter((node) =>
            (node as ChevereChild<Attribute>).attr?.values.original.includes(
                name,
            ),
        ).forEach((node) => {
            (node as ChevereAction<Attribute>).setAction();
        });
    }

    /**
     * Emit a event in the window scope
     * @param data A valid event data
     */
    $emit(data: Dispatch): void {
        window.dispatchEvent(
            new CustomEvent(data.name, {
                detail: data.detail,
                bubbles: true,
                composed: true,
                cancelable: true,
            }),
        );
    }

    /**
     * Push into 'this.childs' arrays by attribute
     * @param data The list of related nodes
     */
    setChilds(data: Relation) {
        data.nodes.forEach((node) => {
            this.childs![data.type].push(node);
        });
    }

    checkForActionsAndChilds(): void {
        //For now, nested components is not supported
        if (
            this.element.querySelectorAll("*[data-inline], *[data-attached]")
                .length
        )
            throw Error(
                `Child components is an unsupported feature, sorry about that`,
            );

        //An array of all child nodes order by attribute
        const childs = [
            Helper.getElementsBy({
                attribute: "data-for",
                element: this.element,
                parent: this,
                selector: "template[data-for]",
                Child: LoopNode,
            }),
            Helper.getElementsBy({
                attribute: "data-text",
                element: this.element,
                parent: this,
                selector: "*[data-text]",
                Child: TextNode,
            }),
            Helper.getElementsBy({
                attribute: "data-show",
                element: this.element,
                parent: this,
                selector: "*[data-show]",
                Child: ShowNode,
            }),
            Helper.getElementsBy({
                attribute: "data-model",
                element: this.element,
                parent: this,
                selector:
                    "input[data-model], select[data-model], textarea[data-model]",
                Child: ModelNode,
            }),
            Helper.getElementsByDataOn({
                attribute: "on",
                Child: EventNode,
                parent: this,
            }),
            Helper.getElementsByDataOn({
                attribute: "bind",
                Child: BindNode,
                parent: this,
            }),
        ];

        //Set childs by attribute group
        childs.forEach((child) => child.nodes.length && this.setChilds(child));
    }

    /**
     * Emit an event in the component scope
     * @param data A valid event data
     */
    $emitSelf(data: Dispatch): void {
        this.childs!["data-on"].filter((node) =>
            (node as EventNode).attr!.some((attrs) =>
                attrs.attribute.includes(data.name),
            ),
        ).forEach((node) =>
            node.element.dispatchEvent(
                new CustomEvent(data.name, {
                    detail: data.detail,
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                }),
            ),
        );
    }

    /**
     * Update all child nodes data
     * @param name A data property name
     */
    updateRelated(name: string): void {
        ["data-show", "data-text"].forEach((attr) =>
            this.refreshChilds(attr, name as string),
        );

        this.childs!["data-model"].filter(
            (node) => (node as ModelNode).variable == name,
        ).forEach((node) => (node as ModelNode).bindData());

        this.childs!["data-bind"].forEach((child) =>
            (child as BindNode).setAction(),
        );
    }
}
