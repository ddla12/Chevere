/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ts/actions/ActionNode.ts":
/*!**************************************!*\
  !*** ./src/ts/actions/ActionNode.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChevereAction = void 0;
class ChevereAction {
    constructor(data) {
        ({
            element: this.element,
            parent: this.parent,
            attr: this.attr
        } = data);
    }
    setAction() { }
    ;
    ifAttrIsEmpty(attr) {
        if (!attr.values.original)
            throw new SyntaxError(`The '${attr.attribute}' attribute cannot be empty`);
    }
}
exports.ChevereAction = ChevereAction;


/***/ }),

/***/ "./src/ts/actions/BindNode.ts":
/*!************************************!*\
  !*** ./src/ts/actions/BindNode.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BindNode = void 0;
const ActionNode_1 = __webpack_require__(/*! ./ActionNode */ "./src/ts/actions/ActionNode.ts");
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class BindNode extends ActionNode_1.ChevereAction {
    constructor(data) {
        super(data);
        data.attr.some((attr) => this.ifAttrIsEmpty(attr));
        this.attr = data.attr.map((attr) => ({
            attribute: attr.attribute,
            values: {
                original: attr.values.original,
            },
            bindAttr: attr.attribute.replace(_helpers_1.Patterns.attr.bindAndOn, ""),
            bindValue: this.element.dataset[attr.attribute.replace(_helpers_1.Patterns.attr.bindAndOn, "")] || "",
            type: (_helpers_1.Patterns.attr.isString.test(attr.values.original)) ? "string"
                : (_helpers_1.Patterns.attr.isObject.test(attr.values.original)) ? "object"
                    : "variable"
        }));
        this.parseAttribute();
    }
    setAction() {
        this.attr.forEach((attr) => attr.predicate());
    }
    refreshAttribute() {
        this.attr.filter((attr) => ["style", "class"].includes(attr.bindAttr))
            .forEach((attr) => {
            let i = this.attr.indexOf(attr);
            this.attr[i].values.current = () => _helpers_1.Helper.parser({
                expr: this.attr[i].values.original,
                node: this.parent
            });
        });
        const [Style, Class] = [
            this.attr.findIndex((attr) => attr.bindAttr == "style"),
            this.attr.findIndex((attr) => attr.bindAttr == "class"),
        ];
        (this.attr[Style]) && (this.attr[Style].predicate = () => (["string", "variable"].includes(this.attr[Style].type))
            ? (this.element.style.cssText = this.attr[Style].values.current() + this.attr[Style].bindValue)
            : Object.assign(this.element.style, this.attr[Style].values.current()));
        (this.attr[Class]) && (this.attr[Class].predicate = () => this.element.className = (["string", "variable"].includes(this.attr[Class].type))
            ? this.attr[Class].values.current() + " "
            : (Object.entries(this.attr[Class].values.current())
                .filter(([, value]) => value)
                .map(([key]) => key)
                .join(" ") + " ")
                + this.attr[Class].bindValue);
        this.attr.filter((attr) => !["style", "class"].includes(attr.bindAttr))
            .forEach((attr) => {
            if (_helpers_1.Patterns.attr.isObject.test(attr.values.original))
                throw new SyntaxError(`Only 'style' and 'class' attribute accepts an object as value /
                    any other atttribute can only receive either a variable or a template string`);
            let i = this.attr.indexOf(attr);
            this.attr[i].values.current = () => _helpers_1.Helper.parser({
                expr: this.attr[i].values.original,
                node: this.parent
            });
            attr.predicate = () => this.element.setAttribute(attr.bindAttr, attr.values.current());
        });
        this.setAction();
    }
    parseAttribute() {
        try {
            if (this.attr.some((attr) => (!_helpers_1.Patterns.attr.isString.test(attr.values.original) &&
                !_helpers_1.Patterns.attr.isObject.test(attr.values.original))))
                throw new SyntaxError("A 'data-bind' attribute only accepts an object or a template string as value");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.BindNode = BindNode;


/***/ }),

/***/ "./src/ts/actions/EventNode.ts":
/*!*************************************!*\
  !*** ./src/ts/actions/EventNode.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventNode = void 0;
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
const ActionNode_1 = __webpack_require__(/*! ./ActionNode */ "./src/ts/actions/ActionNode.ts");
class EventNode extends ActionNode_1.ChevereAction {
    constructor(data) {
        super(data);
        this.attr?.some((attr) => this.ifAttrIsEmpty(attr));
        this.parseAttribute();
    }
    refreshAttribute() {
        let eventNames = this.attr.map((attr) => attr.attribute
            .replace(_helpers_1.Patterns.attr.bindAndOn, "")
            .replace(/\..*/, ""));
        this.attr.forEach((attr, i) => {
            const modifier = attr.attribute.replace(/^.*\./, "");
            ((modifier != "window") ? this.element : window).addEventListener(eventNames[i], (e) => {
                _helpers_1.Helper.eventCallback({
                    $event: e,
                    expr: ((attr.values.original.includes("$emitSelf"))
                        ? attr.values.original
                        : `$event.stopPropagation();${attr.values.original}`),
                    node: this.parent
                });
            });
        });
    }
    parseAttribute() {
        try {
            if (this.attr.some((attr) => (!_helpers_1.Patterns.attr.isMethod.test(attr.values.original)
                && !_helpers_1.Patterns.attr.isVariableAssign.test(attr.values.original))))
                throw new SyntaxError("A 'data-on' attribute only accepts a method or a assignment as value");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.EventNode = EventNode;


/***/ }),

/***/ "./src/ts/actions/LoopNode.ts":
/*!************************************!*\
  !*** ./src/ts/actions/LoopNode.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoopNode = void 0;
const ActionNode_1 = __webpack_require__(/*! ./ActionNode */ "./src/ts/actions/ActionNode.ts");
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class LoopNode extends ActionNode_1.ChevereAction {
    constructor(data) {
        super(data);
        this.variables = {
            loop: this.element.dataset.for.match(/^\w+/)[0],
            parent: this.element.dataset.for.match(_helpers_1.Patterns.attr.forParent)[0].replace("this.data.", "")
        };
        this.templates = {
            content: this.element.content,
            fragment: document.createDocumentFragment()
        };
        if (this.templates.content.querySelectorAll(":scope > *").length != 1)
            throw new Error("A template with 'data-for' attribute can only have one direct child");
        this.parseAttribute();
    }
    refreshAttribute() {
        if (!(this.parent.data[this.variables.parent] instanceof Array)) {
            throw new TypeError(`Cannot execute a for loop with the '${this.variables.parent}' variable,` +
                `it must be an array`);
        }
        this.parent.data[this.variables.parent].forEach((_, i) => {
            const childs = [...this.templates.content.querySelectorAll("*")], toReplace = {
                before: `this.data.${this.variables.parent}[${i - 1}]`,
                current: `this.data.${this.variables.parent}[${i}]`
            };
            childs.forEach((child) => {
                [...child.attributes]
                    .filter((a) => a.textContent.includes((i == 0) ? this.variables.loop : toReplace.before))
                    .forEach((a) => {
                    a.textContent = a.textContent.replace(((i == 0)
                        ? _helpers_1.RegExpFactory.loop(this.variables.loop)
                        : toReplace.before), toReplace.current);
                });
            });
            this.templates.fragment.append(document.importNode(this.templates.content, true));
        });
        this.parent.element.append(this.templates.fragment);
    }
    parseAttribute() {
        try {
            if ((!_helpers_1.Patterns.attr.for.test(this.attr.values.original)))
                throw new SyntaxError("data-for attribute must follow the pattern 'var in vars'");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.LoopNode = LoopNode;


/***/ }),

/***/ "./src/ts/actions/ModelNode.ts":
/*!*************************************!*\
  !*** ./src/ts/actions/ModelNode.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ModelNode = void 0;
const ActionNode_1 = __webpack_require__(/*! ./ActionNode */ "./src/ts/actions/ActionNode.ts");
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class ModelNode extends ActionNode_1.ChevereAction {
    constructor(data) {
        super(data);
        this.variable = this.attr.values.original.replace("this.data.", "");
        this.inputType = this.element.type;
        (this.inputType == "checkbox") && (this.related = [...this.parent.element
                .querySelectorAll(`input[type='checkbox'][data-model='this.data.${this.variable}']`)]
            .filter((e) => e != this.element));
        this.ifAttrIsEmpty(this.attr);
        this.parseAttribute();
    }
    bindData() {
        if (!["radio", "checkbox"].includes(this.inputType))
            this.element.value = String(this.parent.data[this.variable]);
    }
    setAction() {
        this.parent.data[this.variable] = (this.inputType != "checkbox")
            ? this.element.value
            : ((!this.related?.length)
                ? this.element.checked
                : [...this.related, this.element]
                    .filter((c) => c.checked)
                    .map((c) => c.value)
                    .join(","));
    }
    ;
    refreshAttribute() {
        this.element.addEventListener("input", this.setAction.bind(this));
        this.bindData();
    }
    parseAttribute() {
        try {
            if (!this.attr?.values.original.match(_helpers_1.Patterns.global.$data))
                throw new SyntaxError("The 'data-model' attribute only accept a property reference as value");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.ModelNode = ModelNode;


/***/ }),

/***/ "./src/ts/actions/ShowNode.ts":
/*!************************************!*\
  !*** ./src/ts/actions/ShowNode.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShowNode = void 0;
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
const ActionNode_1 = __webpack_require__(/*! ./ActionNode */ "./src/ts/actions/ActionNode.ts");
class ShowNode extends ActionNode_1.ChevereAction {
    constructor(data) {
        super(data);
        this.display = getComputedStyle(this.element).display;
        this.ifAttrIsEmpty(this.attr);
        this.parseAttribute();
    }
    setAction() {
        this.element.style.display = !(this.attr.values.current())
            ? "none"
            : this.display;
    }
    refreshAttribute() {
        this.attr.values.current = () => _helpers_1.Helper.parser({
            expr: this.attr.values.original,
            node: this.parent
        });
        this.setAction();
    }
    parseAttribute() {
        try {
            if ((!_helpers_1.Patterns.attr.isBoolean.test(this.attr.values.original))
                && (!_helpers_1.Patterns.attr.isLogicalExpression.test(this.attr.values.original)))
                throw new SyntaxError("data-show attribute only accept booleans");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
    ;
}
exports.ShowNode = ShowNode;
;


/***/ }),

/***/ "./src/ts/actions/TextNode.ts":
/*!************************************!*\
  !*** ./src/ts/actions/TextNode.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextNode = void 0;
const ActionNode_1 = __webpack_require__(/*! ./ActionNode */ "./src/ts/actions/ActionNode.ts");
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class TextNode extends ActionNode_1.ChevereAction {
    constructor(data) {
        super(data);
        this.ifAttrIsEmpty(this.attr);
        this.parseAttribute();
    }
    setAction() {
        this.element.textContent = this.attr.values.current();
    }
    refreshAttribute() {
        this.attr.values.current = () => _helpers_1.Helper.parser({
            expr: this.attr?.values.original,
            node: this.parent,
        });
        this.setAction();
    }
    parseAttribute() {
        try {
            if ((_helpers_1.Patterns.attr.isObject.test(this.attr?.values.original))
                || (_helpers_1.Patterns.attr.isMethod.test(this.attr?.values.original)))
                throw new SyntaxError("The 'data-text' attribute only accept strings concatenation, and a variable as reference");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.TextNode = TextNode;


/***/ }),

/***/ "./src/ts/actions/index.ts":
/*!*********************************!*\
  !*** ./src/ts/actions/index.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./EventNode */ "./src/ts/actions/EventNode.ts"), exports);
__exportStar(__webpack_require__(/*! ./LoopNode */ "./src/ts/actions/LoopNode.ts"), exports);
__exportStar(__webpack_require__(/*! ./ModelNode */ "./src/ts/actions/ModelNode.ts"), exports);
__exportStar(__webpack_require__(/*! ./TextNode */ "./src/ts/actions/TextNode.ts"), exports);
__exportStar(__webpack_require__(/*! ./ShowNode */ "./src/ts/actions/ShowNode.ts"), exports);
__exportStar(__webpack_require__(/*! ./BindNode */ "./src/ts/actions/BindNode.ts"), exports);
__exportStar(__webpack_require__(/*! ./ActionNode */ "./src/ts/actions/ActionNode.ts"), exports);


/***/ }),

/***/ "./src/ts/chevere/Chevere.ts":
/*!***********************************!*\
  !*** ./src/ts/chevere/Chevere.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Chevere = void 0;
class Chevere {
    constructor(element) {
        this.element = element;
        this.id = this.setId();
        this.element.dataset.id = this.id;
    }
    setId() {
        return Math.random().toString(32).substr(2);
    }
    $emit(data) {
        window.dispatchEvent(new CustomEvent(data.name, {
            detail: data.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        }));
    }
}
exports.Chevere = Chevere;


/***/ }),

/***/ "./src/ts/chevere/ChevereData.ts":
/*!***************************************!*\
  !*** ./src/ts/chevere/ChevereData.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChevereData = void 0;
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
/**
 *  The class that users create their components
 *  @class
 */
class ChevereData {
    constructor(data) {
        ({
            name: this.name,
            data: this.data,
            methods: this.methods,
            init: this.init,
            watch: this.watch,
            updated: this.updated,
            updating: this.updating
        } = data);
        (this.watch) && Object.keys(this.watch).some((func) => {
            if (!this.data[func])
                throw new ReferenceError(`You're trying to watch an undefined property '${func}'`);
        });
        Object.freeze(this);
    }
    async initFunc(args) {
        let parsedArgs = (args)
            ? (args?.split(",").map((a) => _helpers_1.Helper.parser({ expr: a })))
            : [];
        await this.init(...parsedArgs || "");
    }
}
exports.ChevereData = ChevereData;


/***/ }),

/***/ "./src/ts/chevere/ChevereInline.ts":
/*!*****************************************!*\
  !*** ./src/ts/chevere/ChevereInline.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChevereInline = void 0;
const _chevere_1 = __webpack_require__(/*! @chevere */ "./src/ts/chevere/index.ts");
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class ChevereInline extends _chevere_1.Chevere {
    constructor(el) {
        super(el);
        this._attributes = {};
        this.attributes = ["data-text", "data-show"];
        this.actions();
        Object.freeze(this);
    }
    set attributes(attributes) {
        this._attributes = Object.fromEntries(attributes.map((attr) => [
            attr,
            Boolean(this.element.dataset[attr.replace("data-", "")])
        ]).filter((v) => Boolean(v[1])));
        ["data-on", "data-bind"].forEach((data) => {
            this._attributes[data] = [...this.element.attributes]
                .map((a) => a.name)
                .some((a) => _helpers_1.RegExpFactory.bindOrOn(data.replace("data-", "")).test(a));
        });
    }
    actions() {
        this.element.textContent += (this.element.dataset.text) && (_helpers_1.Helper.parser({
            expr: this.element.dataset.text
        })) || "";
        this.element.style.display = (this.element.dataset.show) && (_helpers_1.Helper.parser({ expr: this.element.dataset.show })
            ? getComputedStyle(this.element).display
            : "none") || getComputedStyle(this.element).display;
        const findDynamicAttrs = (attr) => Object.fromEntries(new Set([...this.element.attributes]
            .map((a) => a.name)
            .filter((a) => _helpers_1.RegExpFactory.bindOrOn(attr).test(a))
            .map((a) => [
            a.replace(_helpers_1.RegExpFactory.bindOrOn(attr), ""),
            this.element.getAttribute(a)
        ])));
        if (this._attributes["data-on"]) {
            const events = findDynamicAttrs("on");
            Object.entries(events).forEach(([ev, ex]) => {
                if (!_helpers_1.Patterns.attr.isMethod.test(ex)) {
                    throw new SyntaxError("On inline components, 'data-on' attributes only accepts" +
                        " methods as value");
                }
                this.element.addEventListener(ev, (e) => {
                    _helpers_1.Helper.eventCallback({
                        expr: ex,
                        node: this,
                        $event: e
                    });
                });
            });
        }
        if (this._attributes["data-bind"]) {
            const binds = findDynamicAttrs("bind");
            if ("style" in binds)
                Object.assign(this.element.style, (() => {
                    const value = _helpers_1.Helper.parser({ expr: binds.style });
                    return (typeof value == "string")
                        ? Object.fromEntries(value.split(";").map((r) => r.split(":").filter((v) => v)))
                        : value;
                })());
            if ("class" in binds)
                this.element.className = (() => {
                    const value = _helpers_1.Helper.parser({ expr: binds.class });
                    return ((typeof value != "string")
                        ? Object.entries(value)
                            .filter(([_, c]) => _helpers_1.Helper.parser({ expr: c }))
                            .map(([c]) => c)
                            .join(" ")
                        : value) + (this.element.className || "");
                })();
            Object.keys(binds)
                .filter((a) => ["style", "class"].includes(a))
                .forEach((attr) => this.element.setAttribute(attr, _helpers_1.Helper.parser({ expr: binds[attr] })));
        }
    }
}
exports.ChevereInline = ChevereInline;


/***/ }),

/***/ "./src/ts/chevere/ChevereNode.ts":
/*!***************************************!*\
  !*** ./src/ts/chevere/ChevereNode.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ChevereNode_childs, _ChevereNode_watch;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChevereNode = void 0;
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
const _actions_1 = __webpack_require__(/*! @actions */ "./src/ts/actions/index.ts");
const Chevere_1 = __webpack_require__(/*! ./Chevere */ "./src/ts/chevere/Chevere.ts");
class ChevereNode extends Chevere_1.Chevere {
    constructor(data, el) {
        var _a;
        super(el);
        _ChevereNode_childs.set(this, {
            "data-on": [],
            "data-text": [],
            "data-model": [],
            "data-for": [],
            "data-show": [],
            "data-ref": [],
            "data-bind": [],
        });
        _ChevereNode_watch.set(this, void 0);
        (_a = this, {
            name: this.name,
            methods: this.methods,
            watch: ({ set value(_b) { __classPrivateFieldSet(_a, _ChevereNode_watch, _b, "f"); } }).value,
            updated: this.updated,
            updating: this.updating,
        } = data);
        this.data = this.parseData(data.data);
        (this.methods) && this.parseMethods();
        /**
         *  Get the events and actions of the component
         */
        this.checkForActionsAndChilds();
        this.findRefs();
        Object.freeze(this);
    }
    findRefs() {
        this.refs = [...this.element.querySelectorAll("*[data-ref]")]
            .reduce((props, el) => {
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
        __classPrivateFieldGet(this, _ChevereNode_childs, "f")[attr].filter((node) => (node.attr?.values.original.includes(name))).forEach((node) => {
            node.setAction();
        });
    }
    /**
     * Parse all the data, they need getter and a setter
     * @param data The primitive data
     */
    parseData(data) {
        const self = this;
        return new Proxy(data, {
            get(target, name, receiver) {
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                (self.updating) && self.updating();
                (__classPrivateFieldGet(self, _ChevereNode_watch, "f"))
                    && __classPrivateFieldGet(self, _ChevereNode_watch, "f")[name]?.apply(self, [value, target[name]]);
                Reflect.set(target, name, value, receiver);
                ["data-show", "data-text"].forEach((attr) => self.refreshChilds(attr, name));
                __classPrivateFieldGet(self, _ChevereNode_childs, "f")["data-model"].filter((node) => node.variable == name)
                    .forEach((node) => node.bindData());
                __classPrivateFieldGet(self, _ChevereNode_childs, "f")["data-bind"].forEach((child) => child.setAction());
                (self.updated) && self.updated();
                return true;
            }
        });
    }
    parseMethods() {
        const self = this;
        this.methods = Object.values(this.methods)
            .reduce((rest, func) => ({
            ...rest,
            [func.name]: new Proxy(func, {
                apply(target, _, args) {
                    (self.updating) && self.updating();
                    target.apply(self, [...args]);
                    (self.updated) && self.updated();
                }
            })
        }), {});
    }
    setChilds(data) {
        data.nodes.forEach((node) => {
            __classPrivateFieldGet(this, _ChevereNode_childs, "f")[data.type].push(node);
        });
    }
    /**
     * Find all the childrens that have an action and data
     */
    checkForActionsAndChilds() {
        if (this.element.querySelectorAll("*[data-inline], *[data-attached]").length)
            throw Error(`Child components is an unsupported feature, sorry about that`);
        const childs = [
            _helpers_1.Helper.getElementsBy({
                attribute: "data-for",
                element: this.element,
                parent: this,
                selector: "template[data-for]",
                Child: _actions_1.LoopNode
            }),
            _helpers_1.Helper.getElementsBy({
                attribute: "data-text",
                element: this.element,
                parent: this,
                selector: "*[data-text]",
                Child: _actions_1.TextNode
            }),
            _helpers_1.Helper.getElementsBy({
                attribute: "data-show",
                element: this.element,
                parent: this,
                selector: "*[data-show]",
                Child: _actions_1.ShowNode
            }),
            _helpers_1.Helper.getElementsBy({
                attribute: "data-model",
                element: this.element,
                parent: this,
                selector: "input[data-model], select[data-model], textarea[data-model]",
                Child: _actions_1.ModelNode
            }),
            _helpers_1.Helper.getElementsByDataOn({
                attribute: "on",
                Child: _actions_1.EventNode,
                parent: this
            }),
            _helpers_1.Helper.getElementsByDataOn({
                attribute: "bind",
                Child: _actions_1.BindNode,
                parent: this
            })
        ];
        childs.forEach((child) => (child.nodes.length) && this.setChilds(child));
    }
    $emitSelf(data) {
        __classPrivateFieldGet(this, _ChevereNode_childs, "f")["data-on"]
            .filter((node) => node.attr
            .some((attrs) => attrs.attribute.includes(data.name))).forEach((node) => node.element.dispatchEvent(new CustomEvent(data.name, {
            detail: data.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })));
    }
}
exports.ChevereNode = ChevereNode;
_ChevereNode_childs = new WeakMap(), _ChevereNode_watch = new WeakMap();


/***/ }),

/***/ "./src/ts/chevere/index.ts":
/*!*********************************!*\
  !*** ./src/ts/chevere/index.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./ChevereData */ "./src/ts/chevere/ChevereData.ts"), exports);
__exportStar(__webpack_require__(/*! ./ChevereNode */ "./src/ts/chevere/ChevereNode.ts"), exports);
__exportStar(__webpack_require__(/*! ./Chevere */ "./src/ts/chevere/Chevere.ts"), exports);
__exportStar(__webpack_require__(/*! ./ChevereInline */ "./src/ts/chevere/ChevereInline.ts"), exports);


/***/ }),

/***/ "./src/ts/utils/Helper.ts":
/*!********************************!*\
  !*** ./src/ts/utils/Helper.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Helper = void 0;
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
exports.Helper = {
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
                        original: node.getAttribute(data.attribute)
                    }
                }
            }))
        };
    },
    parser(data) {
        return new Function([...(data.args?.keys() || "")].join(","), `return ${data.expr}`).bind(data.node)(...[...(data.args?.values() || "")]);
    },
    getElementsByDataOn(data) {
        const regexp = _helpers_1.RegExpFactory.bindOrOn(data.attribute), nodes = [...data.parent.element.querySelectorAll("*")]
            .filter((el) => [...el.attributes]
            .map((attr) => attr.name)
            .some((attr) => regexp.test(attr)));
        return {
            type: `data-${data.attribute}`,
            nodes: nodes.map((node) => new data.Child({
                element: node,
                parent: data.parent,
                attr: [...node.attributes]
                    .map((attr) => attr.name)
                    .filter(attr => regexp.test(attr))
                    .map((attr) => ({
                    attribute: attr,
                    values: {
                        original: node.getAttribute(attr)
                    }
                }))
            })),
        };
    },
    eventCallback(data) {
        return new Function("$event, $el", data.expr).bind(data.node, data.$event, data.node.element)();
    }
};


/***/ }),

/***/ "./src/ts/utils/Patterns.ts":
/*!**********************************!*\
  !*** ./src/ts/utils/Patterns.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Patterns = exports.RegExpFactory = void 0;
exports.RegExpFactory = {
    loop: (variable) => new RegExp(String.raw `^${variable}|(?<=\[)${variable}(?=\])|(?!\,)${variable}(?=\,)|(?<=\:(\s+)?)${variable}|(?<=\,|\()${variable}`, "g"),
    $this: (prop) => new RegExp(String.raw `^this\.${prop}\.[a-zA-Z]`, "g"),
    bindOrOn: (val) => new RegExp(String.raw `^data-${val}:|@${val}`)
};
const commonRegexp = {
    $this: exports.RegExpFactory.$this("data"),
    words: "[a-zA-Z]+",
    methods: String.raw `^this\.(methods|\$emit|\$emitSelf)\.[a-zA-Z]+`,
    bool: String.raw `^(\!)?(true|false|this\.data\.\w+)`,
};
exports.Patterns = {
    global: {
        getName: new RegExp(commonRegexp.words),
        $data: commonRegexp.$this,
        arguments: /(?<=\().*(?=\))/g,
    },
    variables: {
        equality: /(<|>|!)?={1,3}/g,
        value: /(?<=\=).*(?=\;)/g,
    },
    attr: {
        isMagic: /^(\$magics)/,
        methodName: new RegExp(commonRegexp.methods),
        isMethod: /^.+\(.*\)(\;)?$/,
        isLogicalExpression: new RegExp(String.raw `${commonRegexp.bool}(\s+)?(\||&|=|!=|(>|<)(=)?)`),
        isVariableAssign: /^this\.data\.\w+(\s)?(\?\?||\+|\-|\*|\/|\%|\*\*|<<?|>>(>)?|\|(\|)?||\&(\&)?|\^)?=/,
        isString: /^(\`).*\1$/,
        isObject: /^\{.*\}$/,
        isBoolean: new RegExp(`${commonRegexp.bool}$`),
        methodSyntax: /(^\w+$)|(^\w+\((.*)?\)$)/,
        bindAndOn: /^(data-(on|bind):|@(on|bind))/,
        bind: /^(data-)/,
        for: /^\w+(\s+)in(\s+)this\.data\.\w+/,
        forParent: /this\..*/g,
    },
};


/***/ }),

/***/ "./src/ts/utils/index.ts":
/*!*******************************!*\
  !*** ./src/ts/utils/index.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./Helper */ "./src/ts/utils/Helper.ts"), exports);
__exportStar(__webpack_require__(/*! ./Patterns */ "./src/ts/utils/Patterns.ts"), exports);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*************************!*\
  !*** ./src/ts/index.ts ***!
  \*************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const _chevere_1 = __webpack_require__(/*! @chevere */ "./src/ts/chevere/index.ts");
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
const Chevere = {
    nodes: [],
    /**
     * Find a ChevereData by the value of the 'data-attached' attribute
     * @param {string} attr
     * @param {ChevereData[]} data
     * @returns The data ready for instance a NodeListOf<Element>
     */
    findItsData(attr, ...data) {
        let search = data.find((d) => d.name == attr.trim().replace(/\(.*/, ""));
        if (!search)
            throw new ReferenceError(`'${attr}' couldn't be found in any of your declared components`);
        return search;
    },
    /**
     * Search for Chevere Nodes at the site
     * @param data All the Chevere components
     */
    start(...data) {
        const elements = [...document.querySelectorAll("div[data-attached]")]
            .map((element) => ({ el: element, attr: element.dataset.attached }));
        //Create a ChevereNode for each data-attached
        elements.forEach(async (el) => {
            const node = this.findItsData(el.attr, ...data);
            if (!_helpers_1.Patterns.attr.methodSyntax.test(el.attr))
                throw new SyntaxError(`There are syntax error in the 'data-attached' attribute, unrecognized expression "${el.attr}"`);
            if ((node.init == undefined) && (_helpers_1.Patterns.global.arguments.test(el.attr)))
                throw new EvalError(`The ${node.name} components don't have an init() function, therefore they do not accept any parameters`);
            if (node.init != undefined) {
                await (async () => {
                    return (_helpers_1.Patterns.global.arguments.test(el.attr))
                        ? node.initFunc(el.attr.match(_helpers_1.Patterns.global.arguments).join(","))
                        : node.initFunc();
                })();
            }
            this.nodes.push(new _chevere_1.ChevereNode(node, el.el));
        });
        this.nodes.push(...[...document.querySelectorAll("*[data-inline]")].map((e) => new _chevere_1.ChevereInline(e)));
    },
    data(data) {
        return new _chevere_1.ChevereData(data);
    },
};
window.Chevere = Chevere;

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FDSCxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvQWN0aW9uTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvQmluZE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL0V2ZW50Tm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvTG9vcE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL01vZGVsTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvU2hvd05vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL1RleHROb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvQ2hldmVyZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvQ2hldmVyZURhdGEudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9jaGV2ZXJlL0NoZXZlcmVJbmxpbmUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9jaGV2ZXJlL0NoZXZlcmVOb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvY2hldmVyZS9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL3V0aWxzL0hlbHBlci50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL3V0aWxzL1BhdHRlcm5zLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoZXZlcmVDaGlsZCwgQXR0cmlidXRlIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENoZXZlcmVOb2RlIH0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2hldmVyZUFjdGlvbjxBdHRyaWJ1dGVzPiB7XHJcbiAgICBlbGVtZW50IDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwYXJlbnQgIDogQ2hldmVyZU5vZGU7XHJcbiAgICBhdHRyPyAgIDogQXR0cmlidXRlcztcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZUNoaWxkPEF0dHJpYnV0ZXM+KSB7XHJcbiAgICAgICAgKHsgXHJcbiAgICAgICAgICAgIGVsZW1lbnQgOiB0aGlzLmVsZW1lbnQsIFxyXG4gICAgICAgICAgICBwYXJlbnQgIDogdGhpcy5wYXJlbnQsXHJcbiAgICAgICAgICAgIGF0dHIgICAgOiB0aGlzLmF0dHJcclxuICAgICAgICB9ID0gZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IHBhcnNlQXR0cmlidXRlKCk6IHZvaWQ7XHJcbiAgICBhYnN0cmFjdCByZWZyZXNoQXR0cmlidXRlKCk6IHZvaWQ7XHJcblxyXG4gICAgc2V0QWN0aW9uKCk6IHZvaWQge307XHJcblxyXG4gICAgcHJvdGVjdGVkIGlmQXR0cklzRW1wdHkoYXR0cjogQXR0cmlidXRlKTogdm9pZCB7XHJcbiAgICAgICAgaWYoIWF0dHIudmFsdWVzLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFRoZSAnJHthdHRyLmF0dHJpYnV0ZX0nIGF0dHJpYnV0ZSBjYW5ub3QgYmUgZW1wdHlgKVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZUFjdGlvbiB9IGZyb20gXCIuL0FjdGlvbk5vZGVcIjtcclxuaW1wb3J0IHsgQXR0cmlidXRlLCBCaW5kYWJsZUF0dHIsIENoZXZlcmVDaGlsZCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBIZWxwZXIsIFBhdHRlcm5zIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQmluZE5vZGUgZXh0ZW5kcyBDaGV2ZXJlQWN0aW9uPEF0dHJpYnV0ZVtdPiB7XHJcbiAgICBhdHRyOiBCaW5kYWJsZUF0dHJbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlQ2hpbGQ8QXR0cmlidXRlW10+KSB7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIGRhdGEuYXR0ciEuc29tZSgoYXR0cikgPT4gdGhpcy5pZkF0dHJJc0VtcHR5KGF0dHIpKTtcclxuICAgIFxyXG4gICAgICAgIHRoaXMuYXR0ciA9IGRhdGEuYXR0ciEubWFwKChhdHRyKSA9PiAoe1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGU6IGF0dHIuYXR0cmlidXRlLFxyXG4gICAgICAgICAgICB2YWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBhdHRyLnZhbHVlcy5vcmlnaW5hbCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmluZEF0dHI6IGF0dHIuYXR0cmlidXRlLnJlcGxhY2UoUGF0dGVybnMuYXR0ci5iaW5kQW5kT24sIFwiXCIpLFxyXG4gICAgICAgICAgICBiaW5kVmFsdWU6IHRoaXMuZWxlbWVudC5kYXRhc2V0W2F0dHIuYXR0cmlidXRlLnJlcGxhY2UoUGF0dGVybnMuYXR0ci5iaW5kQW5kT24sIFwiXCIpXSB8fCBcIlwiLFxyXG4gICAgICAgICAgICB0eXBlOiAoUGF0dGVybnMuYXR0ci5pc1N0cmluZy50ZXN0KGF0dHIudmFsdWVzLm9yaWdpbmFsKSkgPyBcInN0cmluZ1wiXHJcbiAgICAgICAgICAgICAgICA6IChQYXR0ZXJucy5hdHRyLmlzT2JqZWN0LnRlc3QoYXR0ci52YWx1ZXMub3JpZ2luYWwpKSA/IFwib2JqZWN0XCJcclxuICAgICAgICAgICAgICAgIDogXCJ2YXJpYWJsZVwiXHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICB0aGlzLnBhcnNlQXR0cmlidXRlKCk7XHJcbiAgICB9XHJcbiBcclxuICAgIHNldEFjdGlvbigpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmF0dHIuZm9yRWFjaCgoYXR0cikgPT4gYXR0ci5wcmVkaWNhdGUhKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZnJlc2hBdHRyaWJ1dGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hdHRyLmZpbHRlcigoYXR0cikgPT4gW1wic3R5bGVcIiwgXCJjbGFzc1wiXS5pbmNsdWRlcyhhdHRyLmJpbmRBdHRyKSlcclxuICAgICAgICAgICAgLmZvckVhY2goKGF0dHIpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpID0gdGhpcy5hdHRyLmluZGV4T2YoYXR0cik7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuYXR0cltpXS52YWx1ZXMuY3VycmVudCA9ICgpID0+IEhlbHBlci5wYXJzZXI8c3RyaW5nfG9iamVjdD4oe1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cHI6IHRoaXMuYXR0cltpXS52YWx1ZXMub3JpZ2luYWwsXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZTogdGhpcy5wYXJlbnRcclxuICAgICAgICAgICAgICAgIH0pOyBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IFtTdHlsZSwgQ2xhc3NdID0gW1xyXG4gICAgICAgICAgICB0aGlzLmF0dHIuZmluZEluZGV4KChhdHRyKSA9PiBhdHRyLmJpbmRBdHRyID09IFwic3R5bGVcIiksXHJcbiAgICAgICAgICAgIHRoaXMuYXR0ci5maW5kSW5kZXgoKGF0dHIpID0+IGF0dHIuYmluZEF0dHIgPT0gXCJjbGFzc1wiKSxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAodGhpcy5hdHRyW1N0eWxlXSkgJiYgKHRoaXMuYXR0cltTdHlsZV0ucHJlZGljYXRlID0gKCkgPT4gXHJcbiAgICAgICAgICAgIChbXCJzdHJpbmdcIiwgXCJ2YXJpYWJsZVwiXS5pbmNsdWRlcyh0aGlzLmF0dHJbU3R5bGVdLnR5cGUpKVxyXG4gICAgICAgICAgICAgICAgPyAodGhpcy5lbGVtZW50LnN0eWxlLmNzc1RleHQgPSB0aGlzLmF0dHJbU3R5bGVdLnZhbHVlcy5jdXJyZW50ISgpICsgdGhpcy5hdHRyW1N0eWxlXS5iaW5kVmFsdWUhKVxyXG4gICAgICAgICAgICAgICAgOiBPYmplY3QuYXNzaWduKHRoaXMuZWxlbWVudC5zdHlsZSwgdGhpcy5hdHRyW1N0eWxlXS52YWx1ZXMuY3VycmVudCEoKSkpO1xyXG5cclxuICAgICAgICAodGhpcy5hdHRyW0NsYXNzXSkgJiYgKHRoaXMuYXR0cltDbGFzc10ucHJlZGljYXRlID0gKCkgPT4gXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPSAoW1wic3RyaW5nXCIsIFwidmFyaWFibGVcIl0uaW5jbHVkZXModGhpcy5hdHRyW0NsYXNzXS50eXBlKSlcclxuICAgICAgICAgICAgICAgID8gKHRoaXMuYXR0cltDbGFzc10udmFsdWVzLmN1cnJlbnQhKCkgYXMgc3RyaW5nKSArIFwiIFwiXHJcbiAgICAgICAgICAgICAgICA6IChPYmplY3QuZW50cmllcyh0aGlzLmF0dHJbQ2xhc3NdLnZhbHVlcy5jdXJyZW50ISgpIGFzIG9iamVjdClcclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChbLCB2YWx1ZV0pID0+IHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKFtrZXldKSA9PiBrZXkpXHJcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oXCIgXCIpICsgXCIgXCIpIFxyXG4gICAgICAgICAgICAgICAgKyB0aGlzLmF0dHJbQ2xhc3NdLmJpbmRWYWx1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0ci5maWx0ZXIoKGF0dHIpID0+ICFbXCJzdHlsZVwiLCBcImNsYXNzXCJdLmluY2x1ZGVzKGF0dHIuYmluZEF0dHIpKVxyXG4gICAgICAgICAgICAuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoUGF0dGVybnMuYXR0ci5pc09iamVjdC50ZXN0KGF0dHIudmFsdWVzLm9yaWdpbmFsKSlcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYE9ubHkgJ3N0eWxlJyBhbmQgJ2NsYXNzJyBhdHRyaWJ1dGUgYWNjZXB0cyBhbiBvYmplY3QgYXMgdmFsdWUgL1xyXG4gICAgICAgICAgICAgICAgICAgIGFueSBvdGhlciBhdHR0cmlidXRlIGNhbiBvbmx5IHJlY2VpdmUgZWl0aGVyIGEgdmFyaWFibGUgb3IgYSB0ZW1wbGF0ZSBzdHJpbmdgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IHRoaXMuYXR0ci5pbmRleE9mKGF0dHIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuYXR0cltpXS52YWx1ZXMuY3VycmVudCA9ICgpID0+IEhlbHBlci5wYXJzZXI8YW55Pih7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwcjogdGhpcy5hdHRyW2ldLnZhbHVlcy5vcmlnaW5hbCxcclxuICAgICAgICAgICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudFxyXG4gICAgICAgICAgICAgICAgfSk7IFxyXG5cclxuICAgICAgICAgICAgICAgIGF0dHIucHJlZGljYXRlID0gKCkgPT4gdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLmJpbmRBdHRyLCBhdHRyLnZhbHVlcy5jdXJyZW50ISgpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0QWN0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VBdHRyaWJ1dGUoKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYodGhpcy5hdHRyIS5zb21lKChhdHRyKSA9PiBcclxuICAgICAgICAgICAgKCFQYXR0ZXJucy5hdHRyLmlzU3RyaW5nLnRlc3QoYXR0ci52YWx1ZXMub3JpZ2luYWwpICYmXHJcbiAgICAgICAgICAgICAhUGF0dGVybnMuYXR0ci5pc09iamVjdC50ZXN0KGF0dHIudmFsdWVzLm9yaWdpbmFsKSkpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiQSAnZGF0YS1iaW5kJyBhdHRyaWJ1dGUgb25seSBhY2NlcHRzIGFuIG9iamVjdCBvciBhIHRlbXBsYXRlIHN0cmluZyBhcyB2YWx1ZVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaEF0dHJpYnV0ZSgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IEhlbHBlciwgUGF0dGVybnMgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuaW1wb3J0IHsgQXR0cmlidXRlLCBDaGV2ZXJlQ2hpbGQgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgQ2hldmVyZUFjdGlvbiB9IGZyb20gXCIuL0FjdGlvbk5vZGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudE5vZGUgZXh0ZW5kcyBDaGV2ZXJlQWN0aW9uPEF0dHJpYnV0ZVtdPiB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlQ2hpbGQ8QXR0cmlidXRlW10+KSB7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0cj8uc29tZSgoYXR0cikgPT4gdGhpcy5pZkF0dHJJc0VtcHR5KGF0dHIpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJzZUF0dHJpYnV0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZnJlc2hBdHRyaWJ1dGUoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGV2ZW50TmFtZXMgPSB0aGlzLmF0dHIhLm1hcCgoYXR0cikgPT4gYXR0ci5hdHRyaWJ1dGVcclxuICAgICAgICAgICAgLnJlcGxhY2UoUGF0dGVybnMuYXR0ci5iaW5kQW5kT24sIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC4uKi8sIFwiXCIpKTtcclxuXHJcbiAgICAgICAgdGhpcy5hdHRyIS5mb3JFYWNoKChhdHRyLCBpKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1vZGlmaWVyOiBzdHJpbmcgPSBhdHRyLmF0dHJpYnV0ZS5yZXBsYWNlKC9eLipcXC4vLCBcIlwiKTtcclxuXHJcbiAgICAgICAgICAgICgobW9kaWZpZXIgIT0gXCJ3aW5kb3dcIikgPyB0aGlzLmVsZW1lbnQgOiB3aW5kb3cpLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lc1tpXSwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIEhlbHBlci5ldmVudENhbGxiYWNrKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgJGV2ZW50OiBlLCBcclxuICAgICAgICAgICAgICAgICAgICBleHByOiAoKGF0dHIudmFsdWVzLm9yaWdpbmFsLmluY2x1ZGVzKFwiJGVtaXRTZWxmXCIpKSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBhdHRyLnZhbHVlcy5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7JHthdHRyLnZhbHVlcy5vcmlnaW5hbH1gXHJcbiAgICAgICAgICAgICAgICAgICAgKSwgXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZTogdGhpcy5wYXJlbnQgXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VBdHRyaWJ1dGUoKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYodGhpcy5hdHRyIS5zb21lKChhdHRyKSA9PiBcclxuICAgICAgICAgICAgICAgICghUGF0dGVybnMuYXR0ci5pc01ldGhvZC50ZXN0KGF0dHIudmFsdWVzLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgJiYgIVBhdHRlcm5zLmF0dHIuaXNWYXJpYWJsZUFzc2lnbi50ZXN0KGF0dHIudmFsdWVzLm9yaWdpbmFsKSkpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiQSAnZGF0YS1vbicgYXR0cmlidXRlIG9ubHkgYWNjZXB0cyBhIG1ldGhvZCBvciBhIGFzc2lnbm1lbnQgYXMgdmFsdWVcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGUoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBDaGV2ZXJlQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uTm9kZVwiO1xyXG5pbXBvcnQgeyBBdHRyaWJ1dGUsIENoZXZlcmVDaGlsZCwgTG9vcEZyYWdtZW50LCBEYXRhIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IFBhdHRlcm5zLCBSZWdFeHBGYWN0b3J5IH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTG9vcE5vZGUgZXh0ZW5kcyBDaGV2ZXJlQWN0aW9uPEF0dHJpYnV0ZT4ge1xyXG4gICAgcmVhZG9ubHkgdmFyaWFibGVzOiBEYXRhPHN0cmluZz47XHJcbiAgICByZWFkb25seSB0ZW1wbGF0ZXM6IExvb3BGcmFnbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlQ2hpbGQ8QXR0cmlidXRlPikge1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHtcclxuICAgICAgICAgICAgbG9vcDogdGhpcy5lbGVtZW50LmRhdGFzZXQuZm9yIS5tYXRjaCgvXlxcdysvKSFbMF0sXHJcbiAgICAgICAgICAgIHBhcmVudDogdGhpcy5lbGVtZW50LmRhdGFzZXQuZm9yIS5tYXRjaChQYXR0ZXJucy5hdHRyLmZvclBhcmVudCkhWzBdLnJlcGxhY2UoXCJ0aGlzLmRhdGEuXCIsIFwiXCIpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy50ZW1wbGF0ZXMgPSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQ6ICh0aGlzLmVsZW1lbnQgYXMgSFRNTFRlbXBsYXRlRWxlbWVudCkuY29udGVudCxcclxuICAgICAgICAgICAgZnJhZ21lbnQ6IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmKHRoaXMudGVtcGxhdGVzLmNvbnRlbnQucXVlcnlTZWxlY3RvckFsbChcIjpzY29wZSA+ICpcIikubGVuZ3RoICE9IDEpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkEgdGVtcGxhdGUgd2l0aCAnZGF0YS1mb3InIGF0dHJpYnV0ZSBjYW4gb25seSBoYXZlIG9uZSBkaXJlY3QgY2hpbGRcIik7XHJcblxyXG4gICAgICAgIHRoaXMucGFyc2VBdHRyaWJ1dGUoKTtcclxuICAgIH1cclxuXHJcbiAgICByZWZyZXNoQXR0cmlidXRlKCk6IHZvaWQge1xyXG4gICAgICAgIGlmKCEodGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlcy5wYXJlbnRdIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXHJcbiAgICAgICAgICAgIGBDYW5ub3QgZXhlY3V0ZSBhIGZvciBsb29wIHdpdGggdGhlICcke3RoaXMudmFyaWFibGVzLnBhcmVudH0nIHZhcmlhYmxlLGAgK1xyXG4gICAgICAgICAgICBgaXQgbXVzdCBiZSBhbiBhcnJheWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICh0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVzLnBhcmVudF0gYXMgYW55W10pLmZvckVhY2goKF8sIGkpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRzID0gWy4uLnRoaXMudGVtcGxhdGVzLmNvbnRlbnQucXVlcnlTZWxlY3RvckFsbChcIipcIildIGFzIEhUTUxFbGVtZW50W10sXHJcbiAgICAgICAgICAgICAgICB0b1JlcGxhY2UgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVmb3JlOiBgdGhpcy5kYXRhLiR7dGhpcy52YXJpYWJsZXMucGFyZW50fVske2kgLSAxfV1gLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGB0aGlzLmRhdGEuJHt0aGlzLnZhcmlhYmxlcy5wYXJlbnR9WyR7aX1dYFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNoaWxkcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgWy4uLmNoaWxkLmF0dHJpYnV0ZXNdXHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoYSkgPT4gYS50ZXh0Q29udGVudCEuaW5jbHVkZXMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChpID09IDApID8gdGhpcy52YXJpYWJsZXMubG9vcDogdG9SZXBsYWNlLmJlZm9yZVxyXG4gICAgICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYS50ZXh0Q29udGVudCEgPSBhLnRleHRDb250ZW50IS5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKChpID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBSZWdFeHBGYWN0b3J5Lmxvb3AodGhpcy52YXJpYWJsZXMubG9vcClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRvUmVwbGFjZS5iZWZvcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9SZXBsYWNlLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICBcclxuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGVzLmZyYWdtZW50LmFwcGVuZChkb2N1bWVudC5pbXBvcnROb2RlKHRoaXMudGVtcGxhdGVzLmNvbnRlbnQsIHRydWUpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kKHRoaXMudGVtcGxhdGVzLmZyYWdtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZUF0dHJpYnV0ZSgpOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZigoIVBhdHRlcm5zLmF0dHIuZm9yLnRlc3QodGhpcy5hdHRyIS52YWx1ZXMub3JpZ2luYWwpKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcImRhdGEtZm9yIGF0dHJpYnV0ZSBtdXN0IGZvbGxvdyB0aGUgcGF0dGVybiAndmFyIGluIHZhcnMnXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoQXR0cmlidXRlKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQXR0cmlidXRlLCBDaGV2ZXJlQ2hpbGQgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcbmltcG9ydCB7IENoZXZlcmVBY3Rpb24gfSBmcm9tIFwiLi9BY3Rpb25Ob2RlXCI7XG5pbXBvcnQgeyBQYXR0ZXJucyB9IGZyb20gXCJAaGVscGVyc1wiO1xuXG5leHBvcnQgY2xhc3MgTW9kZWxOb2RlIGV4dGVuZHMgQ2hldmVyZUFjdGlvbjxBdHRyaWJ1dGU+IHsgXG4gICAgcmVhZG9ubHkgdmFyaWFibGU6IHN0cmluZztcbiAgICByZWFkb25seSBpbnB1dFR5cGU6IHN0cmluZztcbiAgICByZWFkb25seSByZWxhdGVkPzogSFRNTElucHV0RWxlbWVudFtdO1xuXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZUNoaWxkPEF0dHJpYnV0ZT4pIHtcbiAgICAgICAgc3VwZXIoZGF0YSk7XG5cbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuYXR0ciEudmFsdWVzLm9yaWdpbmFsLnJlcGxhY2UoXCJ0aGlzLmRhdGEuXCIsIFwiXCIpO1xuICAgICAgICB0aGlzLmlucHV0VHlwZSA9ICh0aGlzLmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudCkudHlwZTtcblxuICAgICAgICAodGhpcy5pbnB1dFR5cGUgPT0gXCJjaGVja2JveFwiKSAmJiAodGhpcy5yZWxhdGVkID0gKFsuLi50aGlzLnBhcmVudC5lbGVtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChgaW5wdXRbdHlwZT0nY2hlY2tib3gnXVtkYXRhLW1vZGVsPSd0aGlzLmRhdGEuJHt0aGlzLnZhcmlhYmxlfSddYCldIGFzIEhUTUxJbnB1dEVsZW1lbnRbXSlcbiAgICAgICAgICAgIC5maWx0ZXIoKGUpID0+IGUgIT0gdGhpcy5lbGVtZW50KSk7XG5cbiAgICAgICAgdGhpcy5pZkF0dHJJc0VtcHR5KHRoaXMuYXR0ciEpO1xuICAgICAgICB0aGlzLnBhcnNlQXR0cmlidXRlKCk7XG4gICAgfVxuXG4gICAgYmluZERhdGEoKTogdm9pZCB7XG4gICAgICAgIGlmKCFbXCJyYWRpb1wiLCBcImNoZWNrYm94XCJdLmluY2x1ZGVzKHRoaXMuaW5wdXRUeXBlKSlcbiAgICAgICAgICAgICh0aGlzLmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUgPSBTdHJpbmcodGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXSk7XG4gICAgfVxuXG4gICAgc2V0QWN0aW9uKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdID0gKHRoaXMuaW5wdXRUeXBlICE9IFwiY2hlY2tib3hcIilcbiAgICAgICAgICAgID8gKHRoaXMuZWxlbWVudCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZVxuICAgICAgICAgICAgOiAoKCF0aGlzLnJlbGF0ZWQ/Lmxlbmd0aClcbiAgICAgICAgICAgICAgICA/ICh0aGlzLmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudCkuY2hlY2tlZFxuICAgICAgICAgICAgICAgIDogWy4uLnRoaXMucmVsYXRlZCEsICh0aGlzLmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudCldXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGMpID0+IGMuY2hlY2tlZClcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoYykgPT4gYy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oXCIsXCIpKTtcbiAgICB9O1xuXG4gICAgcmVmcmVzaEF0dHJpYnV0ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLnNldEFjdGlvbi5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLmJpbmREYXRhKCk7XG4gICAgfVxuXG4gICAgcGFyc2VBdHRyaWJ1dGUoKTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZighdGhpcy5hdHRyPy52YWx1ZXMub3JpZ2luYWwhLm1hdGNoKFBhdHRlcm5zLmdsb2JhbC4kZGF0YSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlICdkYXRhLW1vZGVsJyBhdHRyaWJ1dGUgb25seSBhY2NlcHQgYSBwcm9wZXJ0eSByZWZlcmVuY2UgYXMgdmFsdWVcIik7XG5cbiAgICAgICAgICAgIHRoaXMucmVmcmVzaEF0dHJpYnV0ZSgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG59IiwiaW1wb3J0IHsgSGVscGVyLCBQYXR0ZXJucyB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5pbXBvcnQgeyBBdHRyaWJ1dGUsIENoZXZlcmVDaGlsZCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBDaGV2ZXJlQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uTm9kZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNob3dOb2RlIGV4dGVuZHMgQ2hldmVyZUFjdGlvbjxBdHRyaWJ1dGU+IHtcclxuICAgIHJlYWRvbmx5IGRpc3BsYXk/OiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZUNoaWxkPEF0dHJpYnV0ZT4pIHtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsZW1lbnQpLmRpc3BsYXk7XHJcblxyXG4gICAgICAgIHRoaXMuaWZBdHRySXNFbXB0eSh0aGlzLmF0dHIhKTtcclxuICAgICAgICB0aGlzLnBhcnNlQXR0cmlidXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0QWN0aW9uKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gISh0aGlzLmF0dHIhLnZhbHVlcy5jdXJyZW50ISgpKSBcclxuICAgICAgICAgICAgPyBcIm5vbmVcIiBcclxuICAgICAgICAgICAgOiB0aGlzLmRpc3BsYXkhO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZnJlc2hBdHRyaWJ1dGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hdHRyIS52YWx1ZXMuY3VycmVudCA9ICgpOiBib29sZWFuID0+ICBIZWxwZXIucGFyc2VyPGJvb2xlYW4+KHtcclxuICAgICAgICAgICAgZXhwcjogdGhpcy5hdHRyIS52YWx1ZXMub3JpZ2luYWwsXHJcbiAgICAgICAgICAgIG5vZGU6IHRoaXMucGFyZW50XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0QWN0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VBdHRyaWJ1dGUoKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoKCFQYXR0ZXJucy5hdHRyLmlzQm9vbGVhbi50ZXN0KHRoaXMuYXR0ciEudmFsdWVzLm9yaWdpbmFsKSkgXHJcbiAgICAgICAgICAgICYmICghUGF0dGVybnMuYXR0ci5pc0xvZ2ljYWxFeHByZXNzaW9uLnRlc3QodGhpcy5hdHRyIS52YWx1ZXMub3JpZ2luYWwpKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcImRhdGEtc2hvdyBhdHRyaWJ1dGUgb25seSBhY2NlcHQgYm9vbGVhbnNcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGUoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59OyIsIlxyXG5pbXBvcnQgeyBBdHRyaWJ1dGUsIENoZXZlcmVDaGlsZCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBDaGV2ZXJlQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uTm9kZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIsIFBhdHRlcm5zIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGV4dE5vZGUgZXh0ZW5kcyBDaGV2ZXJlQWN0aW9uPEF0dHJpYnV0ZT4geyBcclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVDaGlsZDxBdHRyaWJ1dGU+KSB7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuaWZBdHRySXNFbXB0eSh0aGlzLmF0dHIhKTtcclxuICAgICAgICB0aGlzLnBhcnNlQXR0cmlidXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0QWN0aW9uKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuYXR0ciEudmFsdWVzLmN1cnJlbnQhKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlZnJlc2hBdHRyaWJ1dGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hdHRyIS52YWx1ZXMuY3VycmVudCA9ICgpID0+IEhlbHBlci5wYXJzZXI8c3RyaW5nPih7XHJcbiAgICAgICAgICAgIGV4cHI6IHRoaXMuYXR0cj8udmFsdWVzLm9yaWdpbmFsISxcclxuICAgICAgICAgICAgbm9kZTogdGhpcy5wYXJlbnQsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0QWN0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VBdHRyaWJ1dGUoKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoKFBhdHRlcm5zLmF0dHIuaXNPYmplY3QudGVzdCh0aGlzLmF0dHI/LnZhbHVlcy5vcmlnaW5hbCEpKSBcclxuICAgICAgICAgICAgfHwgKFBhdHRlcm5zLmF0dHIuaXNNZXRob2QudGVzdCh0aGlzLmF0dHI/LnZhbHVlcy5vcmlnaW5hbCEpKSkgXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJUaGUgJ2RhdGEtdGV4dCcgYXR0cmlidXRlIG9ubHkgYWNjZXB0IHN0cmluZ3MgY29uY2F0ZW5hdGlvbiwgYW5kIGEgdmFyaWFibGUgYXMgcmVmZXJlbmNlXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoQXR0cmlidXRlKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZXhwb3J0ICogZnJvbSBcIi4vRXZlbnROb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0xvb3BOb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL01vZGVsTm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9UZXh0Tm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9TaG93Tm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9CaW5kTm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9BY3Rpb25Ob2RlXCI7IiwiaW1wb3J0IHsgRGlzcGF0Y2ggfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDaGV2ZXJlIHtcclxuICAgIGlkICAgICAgOiBzdHJpbmc7XHJcbiAgICBlbGVtZW50IDogSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLnNldElkKCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdGFzZXQuaWQgPSB0aGlzLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHNldElkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzIpLnN1YnN0cigyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgJGVtaXQoZGF0YTogRGlzcGF0Y2gpOiB2b2lkIHtcclxuICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcclxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KGRhdGEubmFtZSwge1xyXG4gICAgICAgICAgICAgICAgZGV0YWlsICAgICAgOiBkYXRhLmRldGFpbCxcclxuICAgICAgICAgICAgICAgIGJ1YmJsZXMgICAgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNvbXBvc2VkICAgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGUgIDogdHJ1ZSxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZU5vZGVEYXRhLCBEYXRhLCBpbml0RnVuYywgV2F0Y2ggfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG4vKipcclxuICogIFRoZSBjbGFzcyB0aGF0IHVzZXJzIGNyZWF0ZSB0aGVpciBjb21wb25lbnRzXHJcbiAqICBAY2xhc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlRGF0YSBpbXBsZW1lbnRzIENoZXZlcmVOb2RlRGF0YSB7XHJcbiAgICByZWFkb25seSBuYW1lICAgOiBzdHJpbmc7XHJcbiAgICBkYXRhICAgICAgICAgICAgOiBEYXRhPGFueT47XHJcbiAgICBtZXRob2RzPyAgICAgICAgOiBEYXRhPEZ1bmN0aW9uPjtcclxuICAgIGluaXQgICAgICAgICAgICA6IGluaXRGdW5jO1xyXG4gICAgd2F0Y2g/ICAgICAgICAgIDogRGF0YTxXYXRjaD47XHJcbiAgICB1cGRhdGVkPyAgICAgICAgOiAoKSA9PiB2b2lkO1xyXG4gICAgdXBkYXRpbmc/ICAgICAgIDogKCkgPT4gdm9pZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlTm9kZURhdGEpIHtcclxuICAgICAgICAoeyBcclxuICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLCBcclxuICAgICAgICAgICAgZGF0YTogdGhpcy5kYXRhLCBcclxuICAgICAgICAgICAgbWV0aG9kczogdGhpcy5tZXRob2RzLCBcclxuICAgICAgICAgICAgaW5pdDogdGhpcy5pbml0LFxyXG4gICAgICAgICAgICB3YXRjaDogdGhpcy53YXRjaCxcclxuICAgICAgICAgICAgdXBkYXRlZDogdGhpcy51cGRhdGVkLFxyXG4gICAgICAgICAgICB1cGRhdGluZzogdGhpcy51cGRhdGluZ1xyXG4gICAgICAgIH0gPSBkYXRhKTtcclxuXHJcblxyXG4gICAgICAgICh0aGlzLndhdGNoKSAmJiBPYmplY3Qua2V5cyh0aGlzLndhdGNoISkuc29tZSgoZnVuYykgPT4ge1xyXG4gICAgICAgICAgICBpZighdGhpcy5kYXRhW2Z1bmNdKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBZb3UncmUgdHJ5aW5nIHRvIHdhdGNoIGFuIHVuZGVmaW5lZCBwcm9wZXJ0eSAnJHtmdW5jfSdgKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbml0RnVuYyhhcmdzPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgbGV0IHBhcnNlZEFyZ3M6IGFueVtdID0gKGFyZ3MpXHJcbiAgICAgICAgICAgID8gKGFyZ3M/LnNwbGl0KFwiLFwiKS5tYXAoKGEpID0+IEhlbHBlci5wYXJzZXIoeyBleHByOiBhIH0pKSlcclxuICAgICAgICAgICAgOiBbXTtcclxuXHJcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0ISguLi5wYXJzZWRBcmdzIHx8IFwiXCIpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZSB9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIsIFBhdHRlcm5zLCBSZWdFeHBGYWN0b3J5IH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcbmltcG9ydCB7IERhdGEgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlSW5saW5lIGV4dGVuZHMgQ2hldmVyZSB7XHJcbiAgICBfYXR0cmlidXRlczogRGF0YTxib29sZWFuPiA9IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsKTtcclxuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSBbXCJkYXRhLXRleHRcIiwgXCJkYXRhLXNob3dcIl07XHJcbiAgICAgICAgdGhpcy5hY3Rpb25zKCk7XHJcblxyXG4gICAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGF0dHJpYnV0ZXMoYXR0cmlidXRlczogc3RyaW5nW10pIHtcclxuICAgICAgICB0aGlzLl9hdHRyaWJ1dGVzID0gT2JqZWN0LmZyb21FbnRyaWVzKFxyXG4gICAgICAgICAgICBhdHRyaWJ1dGVzLm1hcCgoYXR0cikgPT4gW1xyXG4gICAgICAgICAgICAgICAgYXR0ciwgXHJcbiAgICAgICAgICAgICAgICBCb29sZWFuKHRoaXMuZWxlbWVudC5kYXRhc2V0W2F0dHIucmVwbGFjZShcImRhdGEtXCIsIFwiXCIpXSlcclxuICAgICAgICAgICAgXSkuZmlsdGVyKCh2KSA9PiBCb29sZWFuKHZbMV0pKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIFtcImRhdGEtb25cIiwgXCJkYXRhLWJpbmRcIl0uZm9yRWFjaCgoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9hdHRyaWJ1dGVzW2RhdGFdID0gWy4uLnRoaXMuZWxlbWVudC5hdHRyaWJ1dGVzXVxyXG4gICAgICAgICAgICAgICAgLm1hcCgoYSkgPT4gYS5uYW1lKVxyXG4gICAgICAgICAgICAgICAgLnNvbWUoKGEpID0+IFJlZ0V4cEZhY3RvcnkuYmluZE9yT24oZGF0YS5yZXBsYWNlKFwiZGF0YS1cIiwgXCJcIikpLnRlc3QoYSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFjdGlvbnMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ISArPSAodGhpcy5lbGVtZW50LmRhdGFzZXQudGV4dCkgJiYgKEhlbHBlci5wYXJzZXI8c3RyaW5nPih7XHJcbiAgICAgICAgICAgIGV4cHI6IHRoaXMuZWxlbWVudC5kYXRhc2V0LnRleHQhXHJcbiAgICAgICAgfSkpIHx8IFwiXCI7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gKHRoaXMuZWxlbWVudC5kYXRhc2V0LnNob3cpICYmIChcclxuICAgICAgICAgICAgSGVscGVyLnBhcnNlcjxib29sZWFuPih7IGV4cHI6IHRoaXMuZWxlbWVudC5kYXRhc2V0LnNob3chIH0pXHJcbiAgICAgICAgICAgICAgICA/IGdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICA6IFwibm9uZVwiXHJcbiAgICAgICAgICAgICkgfHwgZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsZW1lbnQpLmRpc3BsYXk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbmREeW5hbWljQXR0cnMgPSAoYXR0cjogc3RyaW5nKSA9PiBPYmplY3QuZnJvbUVudHJpZXMoXHJcbiAgICAgICAgICAgIG5ldyBTZXQoWy4uLnRoaXMuZWxlbWVudC5hdHRyaWJ1dGVzXVxyXG4gICAgICAgICAgICAgICAgLm1hcCgoYSkgPT4gYS5uYW1lKVxyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoYSkgPT4gUmVnRXhwRmFjdG9yeS5iaW5kT3JPbihhdHRyKS50ZXN0KGEpKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgoYSkgPT4gW1xyXG4gICAgICAgICAgICAgICAgICAgIGEucmVwbGFjZShSZWdFeHBGYWN0b3J5LmJpbmRPck9uKGF0dHIpLCBcIlwiKSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKGEpXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5fYXR0cmlidXRlc1tcImRhdGEtb25cIl0pIHtcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gZmluZER5bmFtaWNBdHRycyhcIm9uXCIpO1xyXG5cclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoZXZlbnRzKS5mb3JFYWNoKChbZXYsIGV4XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoIVBhdHRlcm5zLmF0dHIuaXNNZXRob2QudGVzdChleCEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk9uIGlubGluZSBjb21wb25lbnRzLCAnZGF0YS1vbicgYXR0cmlidXRlcyBvbmx5IGFjY2VwdHNcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIiBtZXRob2RzIGFzIHZhbHVlXCJcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5ldmVudENhbGxiYWNrKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcjogZXghLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQ6IGVcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5fYXR0cmlidXRlc1tcImRhdGEtYmluZFwiXSkge1xyXG4gICAgICAgICAgICBjb25zdCBiaW5kcyA9IGZpbmREeW5hbWljQXR0cnMoXCJiaW5kXCIpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoXCJzdHlsZVwiIGluIGJpbmRzKSBPYmplY3QuYXNzaWduKHRoaXMuZWxlbWVudC5zdHlsZSwgKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gSGVscGVyLnBhcnNlcjxzdHJpbmd8b2JqZWN0Pih7IGV4cHI6IGJpbmRzLnN0eWxlISB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PSBcInN0cmluZ1wiKSBcclxuICAgICAgICAgICAgICAgICAgICA/IE9iamVjdC5mcm9tRW50cmllcyh2YWx1ZS5zcGxpdChcIjtcIikubWFwKChyKSA9PiByLnNwbGl0KFwiOlwiKS5maWx0ZXIoKHYpID0+IHYpKSkgXHJcbiAgICAgICAgICAgICAgICAgICAgOiB2YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIH0pKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBpZihcImNsYXNzXCIgaW4gYmluZHMpIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPSAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBIZWxwZXIucGFyc2VyPHN0cmluZ3xvYmplY3Q+KHsgZXhwcjogYmluZHMuY2xhc3MhIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAoKHR5cGVvZiB2YWx1ZSAhPSBcInN0cmluZ1wiKSBcclxuICAgICAgICAgICAgICAgICAgICA/IE9iamVjdC5lbnRyaWVzKHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChbXywgY10pID0+IEhlbHBlci5wYXJzZXI8Ym9vbGVhbj4oeyBleHByOiBjIH0pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKChbY10pID0+IGMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKFwiIFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIDogdmFsdWUpICsgKHRoaXMuZWxlbWVudC5jbGFzc05hbWUgfHwgXCJcIik7XHJcbiAgICAgICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhiaW5kcylcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGEpID0+IFtcInN0eWxlXCIsIFwiY2xhc3NcIl0uaW5jbHVkZXMoYSkpXHJcbiAgICAgICAgICAgICAgICAuZm9yRWFjaCgoYXR0cikgPT4gdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLCBIZWxwZXIucGFyc2VyPHN0cmluZz4oeyBleHByOiBiaW5kc1thdHRyXSEgfSkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgQXR0cmlidXRlLCBBdHRyaWJ1dGVzLCBDaGV2ZXJlQ2hpbGQsIENoZXZlcmVFbGVtZW50LCBEYXRhLCBEaXNwYXRjaCwgUmVsYXRpb24sIFdhdGNoIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENoZXZlcmVEYXRhIH0gZnJvbSBcIi4vQ2hldmVyZURhdGFcIjtcclxuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcbmltcG9ydCB7IEJpbmROb2RlLCBDaGV2ZXJlQWN0aW9uLCBFdmVudE5vZGUsIExvb3BOb2RlLCBNb2RlbE5vZGUsIFNob3dOb2RlLCBUZXh0Tm9kZSB9IGZyb20gXCJAYWN0aW9uc1wiO1xyXG5pbXBvcnQgeyBDaGV2ZXJlIH0gZnJvbSBcIi4vQ2hldmVyZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENoZXZlcmVOb2RlIGV4dGVuZHMgQ2hldmVyZSBpbXBsZW1lbnRzIENoZXZlcmVFbGVtZW50IHtcclxuICAgIG5hbWUgICAgICAgIDogc3RyaW5nO1xyXG4gICAgZGF0YSAgICAgICAgOiBEYXRhPGFueT47XHJcbiAgICBtZXRob2RzPyAgICA6IERhdGE8RnVuY3Rpb24+O1xyXG4gICAgcmVmcz8gICAgICAgOiBEYXRhPEhUTUxFbGVtZW50PjtcclxuICAgICNjaGlsZHM/ICAgIDogRGF0YTxDaGV2ZXJlQ2hpbGQ8QXR0cmlidXRlcz5bXT4gPSB7XHJcbiAgICAgICAgXCJkYXRhLW9uXCIgICA6IFtdLFxyXG4gICAgICAgIFwiZGF0YS10ZXh0XCIgOiBbXSxcclxuICAgICAgICBcImRhdGEtbW9kZWxcIjogW10sXHJcbiAgICAgICAgXCJkYXRhLWZvclwiICA6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1zaG93XCIgOiBbXSxcclxuICAgICAgICBcImRhdGEtcmVmXCIgIDogW10sXHJcbiAgICAgICAgXCJkYXRhLWJpbmRcIiA6IFtdLFxyXG4gICAgfTtcclxuICAgICN3YXRjaD8gICAgIDogRGF0YTxXYXRjaD47XHJcbiAgICB1cGRhdGVkPyAgICA6ICgpID0+IHZvaWQ7XHJcbiAgICB1cGRhdGluZz8gICA6ICgpID0+IHZvaWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZURhdGEsIGVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsKTtcclxuICAgICAgICAoeyBcclxuICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLCBcclxuICAgICAgICAgICAgbWV0aG9kczogdGhpcy5tZXRob2RzLCBcclxuICAgICAgICAgICAgd2F0Y2g6IHRoaXMuI3dhdGNoLCBcclxuICAgICAgICAgICAgdXBkYXRlZDogdGhpcy51cGRhdGVkLFxyXG4gICAgICAgICAgICB1cGRhdGluZzogdGhpcy51cGRhdGluZyxcclxuICAgICAgICB9ID0gZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucGFyc2VEYXRhKGRhdGEuZGF0YSk7XHJcblxyXG4gICAgICAgICh0aGlzLm1ldGhvZHMpICYmIHRoaXMucGFyc2VNZXRob2RzKCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIEdldCB0aGUgZXZlbnRzIGFuZCBhY3Rpb25zIG9mIHRoZSBjb21wb25lbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNoZWNrRm9yQWN0aW9uc0FuZENoaWxkcygpO1xyXG5cclxuICAgICAgICB0aGlzLmZpbmRSZWZzKCk7XHJcblxyXG4gICAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZmluZFJlZnMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZWZzID0gKFsuLi50aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS1yZWZdXCIpXSBhcyBIVE1MRWxlbWVudFtdKVxyXG4gICAgICAgICAgICAucmVkdWNlKChwcm9wcywgZWwpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKCFlbC5kYXRhc2V0LnJlZilcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJkYXRhLXJlZiBhdHRyaWJ1dGUgY2Fubm90IGJlIGVtcHR5XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKHsuLi5wcm9wc30pLnNvbWUoKHApID0+IHAgPT0gZWwuZGF0YXNldC5yZWYhKSlcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJJdCBzZWVtcyBsaWtlIHRoZXJlIGFyZSByZXBlYXRlZCAnZGF0YS1yZWYnIHZhbHVlcywgY2hlY2sgeW91ciAnZGF0YS1yZWYnIGF0dHJpYnV0ZXNcIilcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnByb3BzLFxyXG4gICAgICAgICAgICAgICAgICAgIFtlbC5kYXRhc2V0LnJlZiFdOiBlbCxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwge30pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZnJlc2hDaGlsZHMoYXR0cjogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLiNjaGlsZHMhW2F0dHJdLmZpbHRlcihcclxuICAgICAgICAgICAgKG5vZGUpID0+ICgobm9kZSBhcyBDaGV2ZXJlQ2hpbGQ8QXR0cmlidXRlPikuYXR0cj8udmFsdWVzLm9yaWdpbmFsLmluY2x1ZGVzKG5hbWUpKVxyXG4gICAgICAgICkuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAobm9kZSBhcyBDaGV2ZXJlQWN0aW9uPEF0dHJpYnV0ZT4pLnNldEFjdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSBhbGwgdGhlIGRhdGEsIHRoZXkgbmVlZCBnZXR0ZXIgYW5kIGEgc2V0dGVyXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgcHJpbWl0aXZlIGRhdGFcclxuICAgICAqL1xyXG4gICAgcGFyc2VEYXRhKGRhdGE6IERhdGE8YW55Pik6IERhdGE8YW55PiB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJveHkoZGF0YSwge1xyXG4gICAgICAgICAgICBnZXQodGFyZ2V0LCBuYW1lLCByZWNlaXZlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgbmFtZSwgcmVjZWl2ZXIpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQodGFyZ2V0LCBuYW1lLCB2YWx1ZSwgcmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgICAgIChzZWxmLnVwZGF0aW5nKSAmJiBzZWxmLnVwZGF0aW5nKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgKHNlbGYuI3dhdGNoISkgXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgc2VsZi4jd2F0Y2ghW25hbWUgYXMgc3RyaW5nXT8uYXBwbHkoc2VsZiwgW3ZhbHVlLCB0YXJnZXRbbmFtZSBhcyBzdHJpbmddXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgUmVmbGVjdC5zZXQodGFyZ2V0LCBuYW1lLCB2YWx1ZSwgcmVjZWl2ZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIFtcImRhdGEtc2hvd1wiLCBcImRhdGEtdGV4dFwiXS5mb3JFYWNoKChhdHRyKSA9PiBzZWxmLnJlZnJlc2hDaGlsZHMoYXR0ciwgKG5hbWUgYXMgc3RyaW5nKSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuI2NoaWxkcyFbXCJkYXRhLW1vZGVsXCJdLmZpbHRlcigobm9kZSk9PiAobm9kZSBhcyBNb2RlbE5vZGUpLnZhcmlhYmxlID09IG5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKG5vZGUpID0+IChub2RlIGFzIE1vZGVsTm9kZSkuYmluZERhdGEoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi4jY2hpbGRzIVtcImRhdGEtYmluZFwiXS5mb3JFYWNoKChjaGlsZCkgPT4gKGNoaWxkIGFzIEJpbmROb2RlKS5zZXRBY3Rpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIChzZWxmLnVwZGF0ZWQpICYmIHNlbGYudXBkYXRlZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZU1ldGhvZHMoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMubWV0aG9kcyEgPSBPYmplY3QudmFsdWVzKHRoaXMubWV0aG9kcyEpXHJcbiAgICAgICAgICAgIC5yZWR1Y2UoKHJlc3QsIGZ1bmMpID0+ICh7IFxyXG4gICAgICAgICAgICAgICAgLi4ucmVzdCwgXHJcbiAgICAgICAgICAgICAgICBbZnVuYy5uYW1lXTogbmV3IFByb3h5KGZ1bmMsIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHBseSh0YXJnZXQsIF8sIGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHNlbGYudXBkYXRpbmcpICYmIHNlbGYudXBkYXRpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmFwcGx5KHNlbGYsIFsuLi5hcmdzXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChzZWxmLnVwZGF0ZWQpICYmIHNlbGYudXBkYXRlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pLCB7fSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q2hpbGRzKGRhdGE6IFJlbGF0aW9uKSB7XHJcbiAgICAgICAgZGF0YS5ub2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuI2NoaWxkcyFbZGF0YS50eXBlXS5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIGFsbCB0aGUgY2hpbGRyZW5zIHRoYXQgaGF2ZSBhbiBhY3Rpb24gYW5kIGRhdGFcclxuICAgICAqL1xyXG4gICAgY2hlY2tGb3JBY3Rpb25zQW5kQ2hpbGRzKCk6IHZvaWQge1xyXG4gICAgICAgIGlmKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLWlubGluZV0sICpbZGF0YS1hdHRhY2hlZF1cIikubGVuZ3RoKVxyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihgQ2hpbGQgY29tcG9uZW50cyBpcyBhbiB1bnN1cHBvcnRlZCBmZWF0dXJlLCBzb3JyeSBhYm91dCB0aGF0YCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNoaWxkcyAgPSBbXHJcbiAgICAgICAgICAgIEhlbHBlci5nZXRFbGVtZW50c0J5KHtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZTogXCJkYXRhLWZvclwiLFxyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwidGVtcGxhdGVbZGF0YS1mb3JdXCIsXHJcbiAgICAgICAgICAgICAgICBDaGlsZDogTG9vcE5vZGVcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIEhlbHBlci5nZXRFbGVtZW50c0J5KHtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZTogXCJkYXRhLXRleHRcIixcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIipbZGF0YS10ZXh0XVwiLFxyXG4gICAgICAgICAgICAgICAgQ2hpbGQ6IFRleHROb2RlXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBIZWxwZXIuZ2V0RWxlbWVudHNCeSh7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGU6IFwiZGF0YS1zaG93XCIsXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCIqW2RhdGEtc2hvd11cIixcclxuICAgICAgICAgICAgICAgIENoaWxkOiBTaG93Tm9kZVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgSGVscGVyLmdldEVsZW1lbnRzQnkoe1xyXG4gICAgICAgICAgICAgICAgIGF0dHJpYnV0ZTogXCJkYXRhLW1vZGVsXCIsXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCJpbnB1dFtkYXRhLW1vZGVsXSwgc2VsZWN0W2RhdGEtbW9kZWxdLCB0ZXh0YXJlYVtkYXRhLW1vZGVsXVwiLFxyXG4gICAgICAgICAgICAgICAgQ2hpbGQ6IE1vZGVsTm9kZVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhT24oe1xyXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlOiBcIm9uXCIsXHJcbiAgICAgICAgICAgICAgICBDaGlsZDogRXZlbnROb2RlLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFPbih7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGU6IFwiYmluZFwiLFxyXG4gICAgICAgICAgICAgICAgQ2hpbGQ6IEJpbmROb2RlLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgY2hpbGRzLmZvckVhY2goKGNoaWxkKSA9PiAoY2hpbGQubm9kZXMubGVuZ3RoKSAmJiB0aGlzLnNldENoaWxkcyhjaGlsZCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAkZW1pdFNlbGYoZGF0YTogRGlzcGF0Y2gpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLiNjaGlsZHMhW1wiZGF0YS1vblwiXVxyXG4gICAgICAgICAgICAuZmlsdGVyKChub2RlKSA9PiAobm9kZSBhcyBFdmVudE5vZGUpLmF0dHIhXHJcbiAgICAgICAgICAgICAgICAuc29tZSgoYXR0cnMpID0+IGF0dHJzLmF0dHJpYnV0ZS5pbmNsdWRlcyhkYXRhLm5hbWUpKVxyXG4gICAgICAgICAgICApLmZvckVhY2goKG5vZGUpID0+IG5vZGUuZWxlbWVudC5kaXNwYXRjaEV2ZW50KFxyXG4gICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KGRhdGEubmFtZSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbCAgICAgIDogZGF0YS5kZXRhaWwsXHJcbiAgICAgICAgICAgICAgICAgICAgYnViYmxlcyAgICAgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvc2VkICAgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjYW5jZWxhYmxlICA6IHRydWUsXHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgKiBmcm9tIFwiLi9DaGV2ZXJlRGF0YVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9DaGV2ZXJlTm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9DaGV2ZXJlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0NoZXZlcmVJbmxpbmVcIjsiLCJpbXBvcnQgeyBSZWdFeHBGYWN0b3J5IH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcbmltcG9ydCB7IEZpbmRDaGlsZHMsIFJlbGF0aW9uLCBQYXJzZSwgQXR0cmlidXRlLCBEYXRhT24sIEV2ZW50Q2FsbGJhY2sgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBIZWxwZXIgPSB7XHJcbiAgICBnZXRFbGVtZW50c0J5KGRhdGE6IEZpbmRDaGlsZHM8QXR0cmlidXRlPik6IFJlbGF0aW9uIHtcclxuICAgICAgICBjb25zdCBub2RlcyA9IFsuLi5kYXRhLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChkYXRhLnNlbGVjdG9yKV07XHJcbiAgICBcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiBkYXRhLmF0dHJpYnV0ZSxcclxuICAgICAgICAgICAgbm9kZXM6IG5vZGVzLm1hcCgobm9kZSkgPT4gbmV3IGRhdGEuQ2hpbGQoe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogbm9kZSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogZGF0YS5wYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBhdHRyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlOiBkYXRhLmF0dHJpYnV0ZSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IG5vZGUuZ2V0QXR0cmlidXRlKGRhdGEuYXR0cmlidXRlKSFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgcGFyc2VyPFQ+KGRhdGE6IFBhcnNlKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihcclxuICAgICAgICAgICAgWy4uLihkYXRhLmFyZ3M/LmtleXMoKSB8fCBcIlwiKV0uam9pbihcIixcIiksIFxyXG4gICAgICAgICAgICBgcmV0dXJuICR7ZGF0YS5leHByfWBcclxuICAgICAgICApLmJpbmQoZGF0YS5ub2RlKSguLi5bLi4uKGRhdGEuYXJncz8udmFsdWVzKCkgfHwgXCJcIildKTtcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YU9uKGRhdGE6IERhdGFPbik6IFJlbGF0aW9uIHtcclxuICAgICAgICBjb25zdCByZWdleHAgPSBSZWdFeHBGYWN0b3J5LmJpbmRPck9uKGRhdGEuYXR0cmlidXRlKSxcclxuICAgICAgICAgICAgbm9kZXMgPSBbLi4uZGF0YS5wYXJlbnQuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKV1cclxuICAgICAgICAgICAgLmZpbHRlcigoZWwpID0+IFsuLi5lbC5hdHRyaWJ1dGVzXVxyXG4gICAgICAgICAgICAgICAgLm1hcCgoYXR0cikgPT4gYXR0ci5uYW1lKVxyXG4gICAgICAgICAgICAgICAgLnNvbWUoKGF0dHIpID0+IHJlZ2V4cC50ZXN0KGF0dHIpKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHR5cGU6IGBkYXRhLSR7ZGF0YS5hdHRyaWJ1dGV9YCxcclxuICAgICAgICAgICAgbm9kZXM6IG5vZGVzLm1hcCgobm9kZSkgPT4gbmV3IGRhdGEuQ2hpbGQoe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogbm9kZSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogZGF0YS5wYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBhdHRyOiBbLi4ubm9kZS5hdHRyaWJ1dGVzXVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGF0dHIpID0+IGF0dHIubmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGF0dHIgPT4gcmVnZXhwLnRlc3QoYXR0cikpXHJcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoYXR0cikgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlOiBhdHRyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBub2RlLmdldEF0dHJpYnV0ZShhdHRyKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICB9KSksXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBldmVudENhbGxiYWNrKGRhdGE6IEV2ZW50Q2FsbGJhY2spOiAoKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oXCIkZXZlbnQsICRlbFwiLCBkYXRhLmV4cHIpLmJpbmQoZGF0YS5ub2RlLCBkYXRhLiRldmVudCwgZGF0YS5ub2RlLmVsZW1lbnQpKClcclxuICAgIH1cclxufTsiLCJpbXBvcnQgeyBQYXR0ZXJuIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgUmVnRXhwRmFjdG9yeSA9IHtcclxuICAgIGxvb3A6ICh2YXJpYWJsZTogc3RyaW5nKSA9PiBuZXcgUmVnRXhwKFxyXG4gICAgICAgIFN0cmluZy5yYXdgXiR7dmFyaWFibGV9fCg/PD1cXFspJHt2YXJpYWJsZX0oPz1cXF0pfCg/IVxcLCkke3ZhcmlhYmxlfSg/PVxcLCl8KD88PVxcOihcXHMrKT8pJHt2YXJpYWJsZX18KD88PVxcLHxcXCgpJHt2YXJpYWJsZX1gLCBcImdcIlxyXG4gICAgKSxcclxuICAgICR0aGlzOiAocHJvcDogc3RyaW5nKSA9PiBuZXcgUmVnRXhwKFxyXG4gICAgICAgIFN0cmluZy5yYXdgXnRoaXNcXC4ke3Byb3B9XFwuW2EtekEtWl1gLCBcImdcIlxyXG4gICAgKSxcclxuICAgIGJpbmRPck9uOiAodmFsOiBzdHJpbmcpID0+IG5ldyBSZWdFeHAoXHJcbiAgICAgICAgU3RyaW5nLnJhd2BeZGF0YS0ke3ZhbH06fEAke3ZhbH1gXHJcbiAgICApXHJcbn07XHJcblxyXG5jb25zdCBjb21tb25SZWdleHAgPSB7XHJcbiAgICAkdGhpczogUmVnRXhwRmFjdG9yeS4kdGhpcyhcImRhdGFcIiksXHJcbiAgICB3b3JkczogXCJbYS16QS1aXStcIixcclxuICAgIG1ldGhvZHM6IFN0cmluZy5yYXdgXnRoaXNcXC4obWV0aG9kc3xcXCRlbWl0fFxcJGVtaXRTZWxmKVxcLlthLXpBLVpdK2AsXHJcbiAgICBib29sOiBTdHJpbmcucmF3YF4oXFwhKT8odHJ1ZXxmYWxzZXx0aGlzXFwuZGF0YVxcLlxcdyspYCxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBQYXR0ZXJuczogUGF0dGVybiA9IHtcclxuICAgIGdsb2JhbDoge1xyXG4gICAgICAgIGdldE5hbWU6IG5ldyBSZWdFeHAoY29tbW9uUmVnZXhwLndvcmRzKSxcclxuICAgICAgICAkZGF0YTogY29tbW9uUmVnZXhwLiR0aGlzLFxyXG4gICAgICAgIGFyZ3VtZW50czogLyg/PD1cXCgpLiooPz1cXCkpL2csXHJcbiAgICB9LFxyXG4gICAgdmFyaWFibGVzOiB7XHJcbiAgICAgICAgZXF1YWxpdHk6IC8oPHw+fCEpPz17MSwzfS9nLFxyXG4gICAgICAgIHZhbHVlOiAvKD88PVxcPSkuKig/PVxcOykvZyxcclxuICAgIH0sXHJcbiAgICBhdHRyOiB7XHJcbiAgICAgICAgaXNNYWdpYzogL14oXFwkbWFnaWNzKS8sXHJcbiAgICAgICAgbWV0aG9kTmFtZTogbmV3IFJlZ0V4cChjb21tb25SZWdleHAubWV0aG9kcyksXHJcbiAgICAgICAgaXNNZXRob2Q6IC9eLitcXCguKlxcKShcXDspPyQvLFxyXG4gICAgICAgIGlzTG9naWNhbEV4cHJlc3Npb246IG5ldyBSZWdFeHAoU3RyaW5nLnJhd2Ake2NvbW1vblJlZ2V4cC5ib29sfShcXHMrKT8oXFx8fCZ8PXwhPXwoPnw8KSg9KT8pYCksXHJcbiAgICAgICAgaXNWYXJpYWJsZUFzc2lnbjogL150aGlzXFwuZGF0YVxcLlxcdysoXFxzKT8oXFw/XFw/fHxcXCt8XFwtfFxcKnxcXC98XFwlfFxcKlxcKnw8PD98Pj4oPik/fFxcfChcXHwpP3x8XFwmKFxcJik/fFxcXik/PS8sXHJcbiAgICAgICAgaXNTdHJpbmc6IC9eKFxcYCkuKlxcMSQvLFxyXG4gICAgICAgIGlzT2JqZWN0OiAvXlxcey4qXFx9JC8sXHJcbiAgICAgICAgaXNCb29sZWFuOiBuZXcgUmVnRXhwKGAke2NvbW1vblJlZ2V4cC5ib29sfSRgKSxcclxuICAgICAgICBtZXRob2RTeW50YXg6IC8oXlxcdyskKXwoXlxcdytcXCgoLiopP1xcKSQpLyxcclxuICAgICAgICBiaW5kQW5kT246IC9eKGRhdGEtKG9ufGJpbmQpOnxAKG9ufGJpbmQpKS8sXHJcbiAgICAgICAgYmluZDogL14oZGF0YS0pLyxcclxuICAgICAgICBmb3I6IC9eXFx3KyhcXHMrKWluKFxccyspdGhpc1xcLmRhdGFcXC5cXHcrLyxcclxuICAgICAgICBmb3JQYXJlbnQ6IC90aGlzXFwuLiovZyxcclxuICAgIH0sXHJcbn07IiwiZXhwb3J0ICogZnJvbSBcIi4vSGVscGVyXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL1BhdHRlcm5zXCI7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IENoZXZlcmVXaW5kb3csIENoZXZlcmVOb2RlRGF0YSwgQ2hldmVyZURhdGFOb2RlLCBDaGV2ZXJlTm9kZUxpc3QgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcbmltcG9ydCB7IENoZXZlcmVEYXRhLCBDaGV2ZXJlSW5saW5lLCBDaGV2ZXJlTm9kZSB9IGZyb20gXCJAY2hldmVyZVwiO1xuaW1wb3J0IHsgUGF0dGVybnMgfSBmcm9tIFwiQGhlbHBlcnNcIjtcblxuY29uc3QgQ2hldmVyZTogQ2hldmVyZVdpbmRvdyA9IHtcbiAgIG5vZGVzOiBbXSxcbiAgIC8qKlxuICAgICogRmluZCBhIENoZXZlcmVEYXRhIGJ5IHRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtYXR0YWNoZWQnIGF0dHJpYnV0ZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJcbiAgICAqIEBwYXJhbSB7Q2hldmVyZURhdGFbXX0gZGF0YVxuICAgICogQHJldHVybnMgVGhlIGRhdGEgcmVhZHkgZm9yIGluc3RhbmNlIGEgTm9kZUxpc3RPZjxFbGVtZW50PlxuICAgICovXG4gICBmaW5kSXRzRGF0YShhdHRyOiBzdHJpbmcsIC4uLmRhdGE6IENoZXZlcmVEYXRhW10pOiBDaGV2ZXJlRGF0YSB7XG4gICAgICAgbGV0IHNlYXJjaDogQ2hldmVyZURhdGEgfCB1bmRlZmluZWQgPSBkYXRhLmZpbmQoKGQpID0+IGQubmFtZSA9PSBhdHRyLnRyaW0oKS5yZXBsYWNlKC9cXCguKi8sIFwiXCIpKTtcblxuICAgICAgICBpZighc2VhcmNoKSBcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgJyR7YXR0cn0nIGNvdWxkbid0IGJlIGZvdW5kIGluIGFueSBvZiB5b3VyIGRlY2xhcmVkIGNvbXBvbmVudHNgKTtcblxuICAgICAgIHJldHVybiBzZWFyY2g7XG4gICB9LFxuICAgLyoqXG4gICAgKiBTZWFyY2ggZm9yIENoZXZlcmUgTm9kZXMgYXQgdGhlIHNpdGVcbiAgICAqIEBwYXJhbSBkYXRhIEFsbCB0aGUgQ2hldmVyZSBjb21wb25lbnRzXG4gICAgKi9cbiAgICBzdGFydCguLi5kYXRhOiBDaGV2ZXJlRGF0YVtdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzOiBDaGV2ZXJlTm9kZUxpc3QgPSAoWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZbZGF0YS1hdHRhY2hlZF1cIildIGFzIEhUTUxFbGVtZW50W10pXG4gICAgICAgICAgICAubWFwKChlbGVtZW50KSA9PiAoeyBlbDogZWxlbWVudCwgYXR0cjogZWxlbWVudC5kYXRhc2V0LmF0dGFjaGVkISB9KSk7XG5cbiAgICAgICAvL0NyZWF0ZSBhIENoZXZlcmVOb2RlIGZvciBlYWNoIGRhdGEtYXR0YWNoZWRcbiAgICAgICBlbGVtZW50cy5mb3JFYWNoKGFzeW5jKGVsOiBDaGV2ZXJlRGF0YU5vZGUpID0+IHtcbiAgICAgICAgICAgY29uc3Qgbm9kZTogQ2hldmVyZURhdGEgPSB0aGlzLmZpbmRJdHNEYXRhKGVsLmF0dHIsIC4uLmRhdGEpO1xuXG4gICAgICAgICAgICBpZighUGF0dGVybnMuYXR0ci5tZXRob2RTeW50YXgudGVzdChlbC5hdHRyKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFRoZXJlIGFyZSBzeW50YXggZXJyb3IgaW4gdGhlICdkYXRhLWF0dGFjaGVkJyBhdHRyaWJ1dGUsIHVucmVjb2duaXplZCBleHByZXNzaW9uIFwiJHtlbC5hdHRyfVwiYCk7XG5cbiAgICAgICAgICAgIGlmKChub2RlLmluaXQgPT0gdW5kZWZpbmVkKSAmJiAoUGF0dGVybnMuZ2xvYmFsLmFyZ3VtZW50cy50ZXN0KGVsLmF0dHIpKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXZhbEVycm9yKGBUaGUgJHtub2RlLm5hbWV9IGNvbXBvbmVudHMgZG9uJ3QgaGF2ZSBhbiBpbml0KCkgZnVuY3Rpb24sIHRoZXJlZm9yZSB0aGV5IGRvIG5vdCBhY2NlcHQgYW55IHBhcmFtZXRlcnNgKVxuXG4gICAgICAgICAgICBpZihub2RlLmluaXQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgKGFzeW5jKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFBhdHRlcm5zLmdsb2JhbC5hcmd1bWVudHMudGVzdChlbC5hdHRyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbm9kZS5pbml0RnVuYyhlbC5hdHRyLm1hdGNoKFBhdHRlcm5zLmdsb2JhbC5hcmd1bWVudHMpIS5qb2luKFwiLFwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbm9kZS5pbml0RnVuYygpO1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubm9kZXMucHVzaChuZXcgQ2hldmVyZU5vZGUobm9kZSwgZWwuZWwpKTtcbiAgICAgICB9KTtcblxuICAgICAgIHRoaXMubm9kZXMucHVzaCguLi5bLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS1pbmxpbmVdXCIpXS5tYXAoKGUpID0+IG5ldyBDaGV2ZXJlSW5saW5lKGUgYXMgSFRNTEVsZW1lbnQpKSk7XG4gICB9LFxuICAgZGF0YShkYXRhOiBDaGV2ZXJlTm9kZURhdGEpOiBDaGV2ZXJlRGF0YSB7XG4gICAgICAgcmV0dXJuIG5ldyBDaGV2ZXJlRGF0YShkYXRhKTtcbiAgIH0sXG59O1xuXG53aW5kb3cuQ2hldmVyZSA9IENoZXZlcmU7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9