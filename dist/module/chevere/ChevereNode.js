import { BindNode, EventNode, LoopNode, ModelNode, ShowNode, TextNode, } from "../actions/index.js";
import { Helper, Patterns } from "../utils/index.js";
export class ChevereNode {
    constructor(data, element) {
        this.data = {};
        ({
            name: this.name,
            watch: this.watch,
            init: this.init,
            updated: this.updated,
            updating: this.updating,
        } = data);
        this.element = element;
        if (this.element.dataset.inline && this.element.dataset.attached) {
            throw new Error("A component cannot have both 'data-' attributes ('inline', 'attached')");
        }
        this.id = this.element.dataset.id = Helper.setId();
        (data.data) && (this.data = this.parseData(data.data));
        (data.methods) && (this.methods = this.parseMethods(data.methods));
        (this.watch) &&
            Object.keys(this.watch).some((func) => {
                if (!this.data[func])
                    throw new ReferenceError(`You're trying to watch an undefined property '${func}'`);
            });
        this.refs = this.findRefs();
        if (this.init == undefined && Patterns.arguments.test(this.element.dataset.init))
            throw new EvalError(`The ${this.name || "Some"} components don't have an init() function, therefore they do not accept any parameters`);
        if (this.init)
            this.executeInit();
        this.checkForActionsAndChilds();
        Object.seal(this);
    }
    executeInit() {
        let args = Helper.parser({ expr: "[" + this.element.dataset.init + "]" });
        return (this.init instanceof Promise)
            ? (async () => await this.init(...args))()
            : this.init(...args);
    }
    findRefs() {
        return [...this.element.querySelectorAll("*[data-ref]")].reduce((props, el) => {
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
            node.refresh();
        });
    }
    checkForActionsAndChilds() {
        if (this.element.querySelectorAll("*[data-inline], *[data-attached]")
            .length)
            throw Error(`Child components is an unsupported feature, sorry about that`);
        this.childs = {
            ["data-for"]: Helper.getElementsBy({
                attribute: "data-for",
                element: this.element,
                parent: this,
                selector: "template[data-for]",
                Child: LoopNode,
            }),
            ["data-text"]: Helper.getElementsBy({
                attribute: "data-text",
                element: this.element,
                parent: this,
                selector: "*[data-text]",
                Child: TextNode,
            }),
            ["data-show"]: Helper.getElementsBy({
                attribute: "data-show",
                element: this.element,
                parent: this,
                selector: "*[data-show]",
                Child: ShowNode,
            }),
            ["data-model"]: Helper.getElementsBy({
                attribute: "data-model",
                element: this.element,
                parent: this,
                selector: "input[data-model], select[data-model], textarea[data-model]",
                Child: ModelNode,
            }),
            ["data-on"]: Helper.getElementsByDataOn({
                attribute: "on",
                Child: EventNode,
                parent: this,
                rescan: false
            }),
            ["data-bind"]: Helper.getElementsByDataOn({
                attribute: "bind",
                Child: BindNode,
                parent: this,
                rescan: false
            }),
        };
    }
    $emitSelf(data) {
        this.childs["data-on"].filter((node) => node.attr.some((attrs) => attrs.attribute.includes(data.name))).forEach((node) => node.element.dispatchEvent(new CustomEvent(data.name, {
            detail: data.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })));
    }
    $emit(data) {
        window.dispatchEvent(new CustomEvent(data.name, {
            detail: data.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        }));
    }
    reScan() {
        this.refs = this.findRefs();
        const newSimpleChilds = (attr, Child) => [
            ...this.childs[`data-${attr}`],
            ...Helper.getElementsBy({
                attribute: `data-${attr}`,
                element: this.element,
                parent: this,
                selector: `*[data-${attr}][data-key]`,
                Child: Child,
            }),
        ];
        const newComplexChilds = (attr, Child) => [
            ...this.childs[`data-${attr}`],
            ...Helper.getElementsByDataOn({
                attribute: attr,
                Child: Child,
                parent: this,
                rescan: true,
            })
        ];
        [
            this.childs["data-text"],
            this.childs["data-show"],
            this.childs["data-on"],
            this.childs["data-bind"],
        ] = [
            newSimpleChilds("text", TextNode),
            newSimpleChilds("show", ShowNode),
            newComplexChilds("on", EventNode),
            newComplexChilds("bind", BindNode)
        ];
    }
    ;
    updateRelated(name) {
        this.childs["data-for"]
            .filter((child) => child.variables.parent.includes(name))
            .forEach((child) => child.refresh());
        ["data-show", "data-text"].forEach((attr) => this.refreshChilds(attr, name));
        this.childs["data-model"].filter((node) => node.variable == name).forEach((node) => node.bindData());
        this.childs["data-bind"].forEach((child) => child.refresh());
    }
    parseMethods(data) {
        return Object.values(data).reduce((rest, func) => ({
            ...rest,
            [func.name]: new Proxy(func, {
                apply: (target, _, args) => {
                    (this.updating) && this.updating();
                    const result = (target instanceof Promise)
                        ? (async () => await target.apply(this, [...args]))()
                        : target.apply(this, [...args]);
                    (this.updated) && this.updated();
                    return result;
                },
            }),
        }), {});
    }
    parseData(data) {
        return Helper.reactive({
            object: data,
            beforeSet: (target, name, value) => {
                this.updating && this.updating();
                this.watch &&
                    this.watch[name]?.apply(this, [
                        value,
                        target[name],
                    ]);
            },
            afterSet: (_, name) => {
                this.updateRelated(name);
                this.updated && this.updated();
            },
        });
    }
}
