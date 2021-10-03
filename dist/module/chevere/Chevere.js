import { BindNode, EventNode, LoopNode, ModelNode, ShowNode, TextNode, } from "../actions/index.js";
import { Helper } from "../utils/index.js";
export class Chevere {
    constructor(element) {
        this.childs = {
            "data-on": [],
            "data-text": [],
            "data-model": [],
            "data-for": [],
            "data-show": [],
            "data-bind": [],
        };
        this.element = element;
        this.id = this.element.dataset.id = this.setId();
    }
    setId() {
        return Math.random().toString(32).substr(2);
    }
    findRefs() {
        this.refs = [...this.element.querySelectorAll("*[data-ref]")].reduce((props, el) => {
            if (!el.dataset.ref)
                throw new SyntaxError("data-ref attribute cannot be empty");
            if (Object.keys({ ...props }).some((p) => p == el.dataset.ref))
                throw new SyntaxError("It seems like there are repeated 'data-ref' values, check your 'data-ref' attributes");
            return {
                ...props,
                [el.dataset.ref]: el,
            };
        }, {});
    }
    refreshChilds(attr, name) {
        this.childs[attr].filter((node) => node.attr?.values.original.includes(name)).forEach((node) => {
            node.setAction();
        });
    }
    $emit(data) {
        window.dispatchEvent(new CustomEvent(data.name, {
            detail: data.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        }));
    }
    setChilds(data) {
        data.nodes.forEach((node) => {
            this.childs[data.type].push(node);
        });
    }
    checkForActionsAndChilds() {
        if (this.element.querySelectorAll("*[data-inline], *[data-attached]")
            .length)
            throw Error(`Child components is an unsupported feature, sorry about that`);
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
        childs.forEach((child) => (child.nodes.length) && this.setChilds(child));
    }
    $emitSelf(data) {
        this.childs["data-on"].filter((node) => node.attr.some((attrs) => attrs.attribute.includes(data.name))).forEach((node) => node.element.dispatchEvent(new CustomEvent(data.name, {
            detail: data.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })));
    }
    updateRelated(name) {
        ["data-show", "data-text"].forEach((attr) => this.refreshChilds(attr, name));
        this.childs["data-model"].filter((node) => node.variable == name).forEach((node) => node.bindData());
        this.childs["data-bind"].forEach((child) => child.setAction());
    }
    parseMethods(data) {
        return Object.values(data.object).reduce((rest, func) => ({
            ...rest,
            [func.name]: new Proxy(func, {
                apply: (target, _, args) => {
                    (data.beforeSet) && data.beforeSet();
                    const result = target.apply(this, [...args]);
                    (data.afterSet) && data.afterSet();
                    return result;
                }
            })
        }), {});
    }
}
