import { BindNode, EventNode, LoopNode, ModelNode, ShowNode, TextNode, } from "@actions";
import { Helper } from "@helpers";
/**
 * The main Chevere class, all Chevere components must implement it
 * @class
 * @abstract
 */
export class Chevere {
    /**
     * Create a Chevere instance with an HTMLElement, then set it an id
     * @param element A element with 'data-attached/inline' attribute
     */
    constructor(element) {
        //All the childs order by attribute
        this.childs = {
            "data-on": [],
            "data-text": [],
            "data-model": [],
            "data-for": [],
            "data-show": [],
            "data-ref": [],
            "data-bind": [],
        };
        this.element = element;
        this.id = this.setId();
        this.element.dataset.id = this.id;
    }
    /**
     * Generate a valid id for the element
     * @returns A valid id
     */
    setId() {
        return Math.random().toString(32).substr(2);
    }
    /**
     * Find and set the $refs of the component
     */
    findRefs() {
        this.refs = [...this.element.querySelectorAll("*[data-ref]")].reduce((props, el) => {
            //If the attribute is empty
            if (!el.dataset.ref)
                throw new SyntaxError("data-ref attribute cannot be empty");
            //If there are repeated 'data-ref' values
            if (Object.keys({ ...props }).some((p) => p == el.dataset.ref))
                throw new SyntaxError("It seems like there are repeated 'data-ref' values, check your 'data-ref' attributes");
            return {
                ...props,
                [el.dataset.ref]: el,
            };
        }, {});
    }
    /**
     * Update all child nodes by a data reference, and attribute
     * @param attr The name of the group to refresh
     * @param name The name of the data property to filter the childs
     */
    refreshChilds(attr, name) {
        this.childs[attr].filter((node) => node.attr?.values.original.includes(name)).forEach((node) => {
            node.setAction();
        });
    }
    /**
     * Emit a event in the window scope
     * @param data A valid event data
     */
    $emit(data) {
        window.dispatchEvent(new CustomEvent(data.name, {
            detail: data.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        }));
    }
    /**
     * Push into 'this.childs' arrays by attribute
     * @param data The list of related nodes
     */
    setChilds(data) {
        data.nodes.forEach((node) => {
            this.childs[data.type].push(node);
        });
    }
    checkForActionsAndChilds() {
        //For now, nested components is not supported
        if (this.element.querySelectorAll("*[data-inline], *[data-attached]")
            .length)
            throw Error(`Child components is an unsupported feature, sorry about that`);
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
                selector: "input[data-model], select[data-model], textarea[data-model]",
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
    $emitSelf(data) {
        this.childs["data-on"].filter((node) => node.attr.some((attrs) => attrs.attribute.includes(data.name))).forEach((node) => node.element.dispatchEvent(new CustomEvent(data.name, {
            detail: data.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })));
    }
    /**
     * Update all child nodes data
     * @param name A data property name
     */
    updateRelated(name) {
        ["data-show", "data-text"].forEach((attr) => this.refreshChilds(attr, name));
        this.childs["data-model"].filter((node) => node.variable == name).forEach((node) => node.bindData());
        this.childs["data-bind"].forEach((child) => child.setAction());
    }
}
//# sourceMappingURL=Chevere.js.map