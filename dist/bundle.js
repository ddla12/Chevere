/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/actions/ActionNode.js":
/*!**************************************!*\
  !*** ./src/js/actions/ActionNode.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChevereAction": () => (/* binding */ ChevereAction)
/* harmony export */ });
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
//# sourceMappingURL=ActionNode.js.map

/***/ }),

/***/ "./src/js/actions/BindNode.js":
/*!************************************!*\
  !*** ./src/js/actions/BindNode.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BindNode": () => (/* binding */ BindNode)
/* harmony export */ });
/* harmony import */ var _ActionNode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActionNode */ "./src/js/actions/ActionNode.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");


class BindNode extends _ActionNode__WEBPACK_IMPORTED_MODULE_0__.ChevereAction {
    constructor(data) {
        super(data);
        data.attr.some((attr) => this.ifAttrIsEmpty(attr));
        this.attr = data.attr.map((attr) => ({
            attribute: attr.attribute,
            values: {
                original: attr.values.original,
            },
            bindAttr: attr.attribute.replace(_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.bindAndOn, ""),
            bindValue: this.element.dataset[attr.attribute.replace(_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.bindAndOn, "")] || "",
            type: (_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.isString.test(attr.values.original)) ? "string"
                : (_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.isObject.test(attr.values.original)) ? "object"
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
            this.attr[i].values.current = () => _helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.parser({
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
            if (_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.isObject.test(attr.values.original))
                throw new SyntaxError(`Only 'style' and 'class' attribute accepts an object as value /
                    any other atttribute can only receive either a variable or a template string`);
            let i = this.attr.indexOf(attr);
            this.attr[i].values.current = () => _helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.parser({
                expr: this.attr[i].values.original,
                node: this.parent
            });
            attr.predicate = () => this.element.setAttribute(attr.bindAttr, attr.values.current());
        });
        this.setAction();
    }
    parseAttribute() {
        try {
            if (this.attr.some((attr) => (!_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.isString.test(attr.values.original) &&
                !_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.isObject.test(attr.values.original))))
                throw new SyntaxError("A 'data-bind' attribute only accepts an object or a template string as value");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=BindNode.js.map

/***/ }),

/***/ "./src/js/actions/EventNode.js":
/*!*************************************!*\
  !*** ./src/js/actions/EventNode.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventNode": () => (/* binding */ EventNode)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");
/* harmony import */ var _ActionNode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ActionNode */ "./src/js/actions/ActionNode.js");


class EventNode extends _ActionNode__WEBPACK_IMPORTED_MODULE_1__.ChevereAction {
    constructor(data) {
        super(data);
        this.attr?.some((attr) => this.ifAttrIsEmpty(attr));
        this.parseAttribute();
    }
    refreshAttribute() {
        let eventNames = this.attr.map((attr) => attr.attribute
            .replace(_helpers__WEBPACK_IMPORTED_MODULE_0__.Patterns.attr.bindAndOn, "")
            .replace(/\..*/, ""));
        this.attr.forEach((attr, i) => {
            const modifier = attr.attribute.replace(/^.*\./, "");
            ((modifier != "window") ? this.element : window).addEventListener(eventNames[i], (e) => {
                _helpers__WEBPACK_IMPORTED_MODULE_0__.Helper.eventCallback({
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
            if (this.attr.some((attr) => (!_helpers__WEBPACK_IMPORTED_MODULE_0__.Patterns.attr.isMethod.test(attr.values.original)
                && !_helpers__WEBPACK_IMPORTED_MODULE_0__.Patterns.attr.isVariableAssign.test(attr.values.original))))
                throw new SyntaxError("A 'data-on' attribute only accepts a method or a assignment as value");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=EventNode.js.map

/***/ }),

/***/ "./src/js/actions/LoopNode.js":
/*!************************************!*\
  !*** ./src/js/actions/LoopNode.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LoopNode": () => (/* binding */ LoopNode)
/* harmony export */ });
/* harmony import */ var _ActionNode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActionNode */ "./src/js/actions/ActionNode.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");


class LoopNode extends _ActionNode__WEBPACK_IMPORTED_MODULE_0__.ChevereAction {
    constructor(data) {
        super(data);
        this.variables = {
            loop: this.element.dataset.for.match(/^\w+/)[0],
            parent: this.element.dataset.for.match(_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.forParent)[0].replace("this.data.", "")
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
                        ? _helpers__WEBPACK_IMPORTED_MODULE_1__.RegExpFactory.loop(this.variables.loop)
                        : toReplace.before), toReplace.current);
                });
            });
            this.templates.fragment.append(document.importNode(this.templates.content, true));
        });
        this.parent.element.append(this.templates.fragment);
    }
    parseAttribute() {
        try {
            if ((!_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr["for"].test(this.attr.values.original)))
                throw new SyntaxError("data-for attribute must follow the pattern 'var in vars'");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=LoopNode.js.map

/***/ }),

/***/ "./src/js/actions/ModelNode.js":
/*!*************************************!*\
  !*** ./src/js/actions/ModelNode.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ModelNode": () => (/* binding */ ModelNode)
/* harmony export */ });
/* harmony import */ var _ActionNode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActionNode */ "./src/js/actions/ActionNode.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");


class ModelNode extends _ActionNode__WEBPACK_IMPORTED_MODULE_0__.ChevereAction {
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
            if (!this.attr?.values.original.match(_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.global.$data))
                throw new SyntaxError("The 'data-model' attribute only accept a property reference as value");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=ModelNode.js.map

/***/ }),

/***/ "./src/js/actions/ShowNode.js":
/*!************************************!*\
  !*** ./src/js/actions/ShowNode.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ShowNode": () => (/* binding */ ShowNode)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");
/* harmony import */ var _ActionNode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ActionNode */ "./src/js/actions/ActionNode.js");


class ShowNode extends _ActionNode__WEBPACK_IMPORTED_MODULE_1__.ChevereAction {
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
        this.attr.values.current = () => _helpers__WEBPACK_IMPORTED_MODULE_0__.Helper.parser({
            expr: this.attr.values.original,
            node: this.parent
        });
        this.setAction();
    }
    parseAttribute() {
        try {
            if ((!_helpers__WEBPACK_IMPORTED_MODULE_0__.Patterns.attr.isBoolean.test(this.attr.values.original))
                && (!_helpers__WEBPACK_IMPORTED_MODULE_0__.Patterns.attr.isLogicalExpression.test(this.attr.values.original)))
                throw new SyntaxError("data-show attribute only accept booleans");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
    ;
}
;
//# sourceMappingURL=ShowNode.js.map

/***/ }),

/***/ "./src/js/actions/TextNode.js":
/*!************************************!*\
  !*** ./src/js/actions/TextNode.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TextNode": () => (/* binding */ TextNode)
/* harmony export */ });
/* harmony import */ var _ActionNode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActionNode */ "./src/js/actions/ActionNode.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");


class TextNode extends _ActionNode__WEBPACK_IMPORTED_MODULE_0__.ChevereAction {
    constructor(data) {
        super(data);
        this.ifAttrIsEmpty(this.attr);
        this.parseAttribute();
    }
    setAction() {
        this.element.textContent = this.attr.values.current();
    }
    refreshAttribute() {
        this.attr.values.current = () => _helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.parser({
            expr: this.attr?.values.original,
            node: this.parent,
        });
        this.setAction();
    }
    parseAttribute() {
        try {
            if ((_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.isObject.test(this.attr?.values.original))
                || (_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.isMethod.test(this.attr?.values.original)))
                throw new SyntaxError("The 'data-text' attribute only accept strings concatenation, and a variable as reference");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=TextNode.js.map

/***/ }),

/***/ "./src/js/actions/index.js":
/*!*********************************!*\
  !*** ./src/js/actions/index.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventNode": () => (/* reexport safe */ _EventNode__WEBPACK_IMPORTED_MODULE_0__.EventNode),
/* harmony export */   "LoopNode": () => (/* reexport safe */ _LoopNode__WEBPACK_IMPORTED_MODULE_1__.LoopNode),
/* harmony export */   "ModelNode": () => (/* reexport safe */ _ModelNode__WEBPACK_IMPORTED_MODULE_2__.ModelNode),
/* harmony export */   "TextNode": () => (/* reexport safe */ _TextNode__WEBPACK_IMPORTED_MODULE_3__.TextNode),
/* harmony export */   "ShowNode": () => (/* reexport safe */ _ShowNode__WEBPACK_IMPORTED_MODULE_4__.ShowNode),
/* harmony export */   "BindNode": () => (/* reexport safe */ _BindNode__WEBPACK_IMPORTED_MODULE_5__.BindNode),
/* harmony export */   "ChevereAction": () => (/* reexport safe */ _ActionNode__WEBPACK_IMPORTED_MODULE_6__.ChevereAction)
/* harmony export */ });
/* harmony import */ var _EventNode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventNode */ "./src/js/actions/EventNode.js");
/* harmony import */ var _LoopNode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LoopNode */ "./src/js/actions/LoopNode.js");
/* harmony import */ var _ModelNode__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ModelNode */ "./src/js/actions/ModelNode.js");
/* harmony import */ var _TextNode__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TextNode */ "./src/js/actions/TextNode.js");
/* harmony import */ var _ShowNode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ShowNode */ "./src/js/actions/ShowNode.js");
/* harmony import */ var _BindNode__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./BindNode */ "./src/js/actions/BindNode.js");
/* harmony import */ var _ActionNode__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ActionNode */ "./src/js/actions/ActionNode.js");







//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./src/js/chevere/Chevere.js":
/*!***********************************!*\
  !*** ./src/js/chevere/Chevere.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Chevere": () => (/* binding */ Chevere)
/* harmony export */ });
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @actions */ "./src/js/actions/index.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");


class Chevere {
    constructor(element) {
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
    setId() {
        return Math.random().toString(32).substr(2);
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
        this.childs[attr].filter((node) => (node.attr?.values.original.includes(name))).forEach((node) => {
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
        if (this.element.querySelectorAll("*[data-inline], *[data-attached]").length)
            throw Error(`Child components is an unsupported feature, sorry about that`);
        const childs = [
            _helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.getElementsBy({
                attribute: "data-for",
                element: this.element,
                parent: this,
                selector: "template[data-for]",
                Child: _actions__WEBPACK_IMPORTED_MODULE_0__.LoopNode
            }),
            _helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.getElementsBy({
                attribute: "data-text",
                element: this.element,
                parent: this,
                selector: "*[data-text]",
                Child: _actions__WEBPACK_IMPORTED_MODULE_0__.TextNode
            }),
            _helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.getElementsBy({
                attribute: "data-show",
                element: this.element,
                parent: this,
                selector: "*[data-show]",
                Child: _actions__WEBPACK_IMPORTED_MODULE_0__.ShowNode
            }),
            _helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.getElementsBy({
                attribute: "data-model",
                element: this.element,
                parent: this,
                selector: "input[data-model], select[data-model], textarea[data-model]",
                Child: _actions__WEBPACK_IMPORTED_MODULE_0__.ModelNode
            }),
            _helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.getElementsByDataOn({
                attribute: "on",
                Child: _actions__WEBPACK_IMPORTED_MODULE_0__.EventNode,
                parent: this
            }),
            _helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.getElementsByDataOn({
                attribute: "bind",
                Child: _actions__WEBPACK_IMPORTED_MODULE_0__.BindNode,
                parent: this
            })
        ];
        childs.forEach((child) => (child.nodes.length) && this.setChilds(child));
    }
    $emitSelf(data) {
        this.childs["data-on"]
            .filter((node) => node.attr
            .some((attrs) => attrs.attribute.includes(data.name))).forEach((node) => node.element.dispatchEvent(new CustomEvent(data.name, {
            detail: data.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })));
    }
    updateRelated(name) {
        ["data-show", "data-text"].forEach((attr) => this.refreshChilds(attr, name));
        this.childs["data-model"].filter((node) => node.variable == name)
            .forEach((node) => node.bindData());
        this.childs["data-bind"].forEach((child) => child.setAction());
    }
}
//# sourceMappingURL=Chevere.js.map

/***/ }),

/***/ "./src/js/chevere/ChevereData.js":
/*!***************************************!*\
  !*** ./src/js/chevere/ChevereData.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChevereData": () => (/* binding */ ChevereData)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");

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
            ? (args?.split(",").map((a) => _helpers__WEBPACK_IMPORTED_MODULE_0__.Helper.parser({ expr: a })))
            : [];
        await this.init(...parsedArgs || "");
    }
}
//# sourceMappingURL=ChevereData.js.map

/***/ }),

/***/ "./src/js/chevere/ChevereInline.js":
/*!*****************************************!*\
  !*** ./src/js/chevere/ChevereInline.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChevereInline": () => (/* binding */ ChevereInline)
/* harmony export */ });
/* harmony import */ var _chevere__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @chevere */ "./src/js/chevere/index.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");


class ChevereInline extends _chevere__WEBPACK_IMPORTED_MODULE_0__.Chevere {
    constructor(el) {
        super(el);
        this.data = {};
        this.data = this.parseData(_helpers__WEBPACK_IMPORTED_MODULE_1__.Helper.parser({ expr: this.element.dataset.inline || "{}" }));
        this.checkForActionsAndChilds();
        this.findRefs();
        Object.seal(this);
    }
    parseData(data) {
        const self = this;
        return new Proxy(data, {
            get(target, name, receiver) {
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                Reflect.set(target, name, value, receiver);
                self.updateRelated(name);
                return true;
            }
        });
    }
}
//# sourceMappingURL=ChevereInline.js.map

/***/ }),

/***/ "./src/js/chevere/ChevereNode.js":
/*!***************************************!*\
  !*** ./src/js/chevere/ChevereNode.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChevereNode": () => (/* binding */ ChevereNode)
/* harmony export */ });
/* harmony import */ var _Chevere__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Chevere */ "./src/js/chevere/Chevere.js");
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ChevereNode_watch;

class ChevereNode extends _Chevere__WEBPACK_IMPORTED_MODULE_0__.Chevere {
    constructor(data, el) {
        var _a;
        super(el);
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
                self.updateRelated(name);
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
}
_ChevereNode_watch = new WeakMap();
//# sourceMappingURL=ChevereNode.js.map

/***/ }),

/***/ "./src/js/chevere/index.js":
/*!*********************************!*\
  !*** ./src/js/chevere/index.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChevereData": () => (/* reexport safe */ _ChevereData__WEBPACK_IMPORTED_MODULE_0__.ChevereData),
/* harmony export */   "ChevereNode": () => (/* reexport safe */ _ChevereNode__WEBPACK_IMPORTED_MODULE_1__.ChevereNode),
/* harmony export */   "Chevere": () => (/* reexport safe */ _Chevere__WEBPACK_IMPORTED_MODULE_2__.Chevere),
/* harmony export */   "ChevereInline": () => (/* reexport safe */ _ChevereInline__WEBPACK_IMPORTED_MODULE_3__.ChevereInline)
/* harmony export */ });
/* harmony import */ var _ChevereData__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ChevereData */ "./src/js/chevere/ChevereData.js");
/* harmony import */ var _ChevereNode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ChevereNode */ "./src/js/chevere/ChevereNode.js");
/* harmony import */ var _Chevere__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Chevere */ "./src/js/chevere/Chevere.js");
/* harmony import */ var _ChevereInline__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ChevereInline */ "./src/js/chevere/ChevereInline.js");




//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./src/js/utils/Helper.js":
/*!********************************!*\
  !*** ./src/js/utils/Helper.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Helper": () => (/* binding */ Helper)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");

const Helper = {
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
        const regexp = _helpers__WEBPACK_IMPORTED_MODULE_0__.RegExpFactory.bindOrOn(data.attribute), nodes = [...data.parent.element.querySelectorAll("*")]
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
//# sourceMappingURL=Helper.js.map

/***/ }),

/***/ "./src/js/utils/Patterns.js":
/*!**********************************!*\
  !*** ./src/js/utils/Patterns.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RegExpFactory": () => (/* binding */ RegExpFactory),
/* harmony export */   "Patterns": () => (/* binding */ Patterns)
/* harmony export */ });
const RegExpFactory = {
    loop: (variable) => new RegExp(String.raw `^${variable}|(?<=\[)${variable}(?=\])|(?!\,)${variable}(?=\,)|(?<=\:(\s+)?)${variable}|(?<=\,|\()${variable}`, "g"),
    $this: (prop) => new RegExp(String.raw `^this\.${prop}\.[a-zA-Z]`, "g"),
    bindOrOn: (val) => new RegExp(String.raw `^data-${val}:|@${val}`)
};
const commonRegexp = {
    $this: RegExpFactory.$this("data"),
    words: "[a-zA-Z]+",
    methods: String.raw `^this\.(methods|\$emit|\$emitSelf)\.[a-zA-Z]+`,
    bool: String.raw `^(\!)?(true|false|this\.data\.\w+)`,
};
const Patterns = {
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
//# sourceMappingURL=Patterns.js.map

/***/ }),

/***/ "./src/js/utils/index.js":
/*!*******************************!*\
  !*** ./src/js/utils/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Helper": () => (/* reexport safe */ _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper),
/* harmony export */   "Patterns": () => (/* reexport safe */ _Patterns__WEBPACK_IMPORTED_MODULE_1__.Patterns),
/* harmony export */   "RegExpFactory": () => (/* reexport safe */ _Patterns__WEBPACK_IMPORTED_MODULE_1__.RegExpFactory)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Helper */ "./src/js/utils/Helper.js");
/* harmony import */ var _Patterns__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Patterns */ "./src/js/utils/Patterns.js");


//# sourceMappingURL=index.js.map

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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Chevere": () => (/* binding */ Chevere)
/* harmony export */ });
/* harmony import */ var _chevere__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @chevere */ "./src/js/chevere/index.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @helpers */ "./src/js/utils/index.js");


const Chevere = {
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
        const elements = [...document.querySelectorAll("*[data-attached]")]
            .map((element) => ({ el: element, attr: element.dataset.attached }));
        //Create a ChevereNode for each data-attached
        elements.forEach(async (el) => {
            const node = this.findItsData(el.attr, ...data);
            if (!_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.attr.methodSyntax.test(el.attr))
                throw new SyntaxError(`There are syntax error in the 'data-attached' attribute, unrecognized expression "${el.attr}"`);
            if ((node.init == undefined) && (_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.global.arguments.test(el.attr)))
                throw new EvalError(`The ${node.name} components don't have an init() function, therefore they do not accept any parameters`);
            if (node.init != undefined) {
                await (async () => {
                    return (_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.global.arguments.test(el.attr))
                        ? node.initFunc(el.attr.match(_helpers__WEBPACK_IMPORTED_MODULE_1__.Patterns.global.arguments).join(","))
                        : node.initFunc();
                })();
            }
            new _chevere__WEBPACK_IMPORTED_MODULE_0__.ChevereNode(node, el.el);
        });
        [...document.querySelectorAll("*[data-inline]")].map((e) => new _chevere__WEBPACK_IMPORTED_MODULE_0__.ChevereInline(e));
    },
    data(data) {
        return new _chevere__WEBPACK_IMPORTED_MODULE_0__.ChevereData(data);
    },
};
Object.defineProperty(window, "Chevere", { value: Chevere });
//# sourceMappingURL=index.js.map
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QkFBaUI7QUFDakI7QUFDQSxnQkFBZ0IsaURBQVc7QUFDM0IsU0FBUztBQUNULHdFQUF3RSxtREFBYTtBQUNyRixLQUFLO0FBQ0w7QUFDQSxtQkFBbUIsaURBQVc7QUFDOUIsS0FBSztBQUNMO0FBQ0EsMkNBQTJDLGdCQUFnQjtBQUMzRCxpQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NoZXZlcmUvLi9zcmMvanMvYWN0aW9ucy9BY3Rpb25Ob2RlLmpzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvanMvYWN0aW9ucy9CaW5kTm9kZS5qcyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL2pzL2FjdGlvbnMvRXZlbnROb2RlLmpzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvanMvYWN0aW9ucy9Mb29wTm9kZS5qcyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL2pzL2FjdGlvbnMvTW9kZWxOb2RlLmpzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvanMvYWN0aW9ucy9TaG93Tm9kZS5qcyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL2pzL2FjdGlvbnMvVGV4dE5vZGUuanMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy9qcy9hY3Rpb25zL2luZGV4LmpzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvanMvY2hldmVyZS9DaGV2ZXJlLmpzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvanMvY2hldmVyZS9DaGV2ZXJlRGF0YS5qcyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL2pzL2NoZXZlcmUvQ2hldmVyZUlubGluZS5qcyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL2pzL2NoZXZlcmUvQ2hldmVyZU5vZGUuanMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy9qcy9jaGV2ZXJlL2luZGV4LmpzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvanMvdXRpbHMvSGVscGVyLmpzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvanMvdXRpbHMvUGF0dGVybnMuanMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy9qcy91dGlscy9pbmRleC5qcyIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NoZXZlcmUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NoZXZlcmUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy9qcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQ2hldmVyZUFjdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgKHtcclxuICAgICAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50LFxyXG4gICAgICAgICAgICBhdHRyOiB0aGlzLmF0dHJcclxuICAgICAgICB9ID0gZGF0YSk7XHJcbiAgICB9XHJcbiAgICBzZXRBY3Rpb24oKSB7IH1cclxuICAgIDtcclxuICAgIGlmQXR0cklzRW1wdHkoYXR0cikge1xyXG4gICAgICAgIGlmICghYXR0ci52YWx1ZXMub3JpZ2luYWwpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVGhlICcke2F0dHIuYXR0cmlidXRlfScgYXR0cmlidXRlIGNhbm5vdCBiZSBlbXB0eWApO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUFjdGlvbk5vZGUuanMubWFwIiwiaW1wb3J0IHsgQ2hldmVyZUFjdGlvbiB9IGZyb20gXCIuL0FjdGlvbk5vZGVcIjtcclxuaW1wb3J0IHsgSGVscGVyLCBQYXR0ZXJucyB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5leHBvcnQgY2xhc3MgQmluZE5vZGUgZXh0ZW5kcyBDaGV2ZXJlQWN0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICBkYXRhLmF0dHIuc29tZSgoYXR0cikgPT4gdGhpcy5pZkF0dHJJc0VtcHR5KGF0dHIpKTtcclxuICAgICAgICB0aGlzLmF0dHIgPSBkYXRhLmF0dHIubWFwKChhdHRyKSA9PiAoe1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGU6IGF0dHIuYXR0cmlidXRlLFxyXG4gICAgICAgICAgICB2YWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBhdHRyLnZhbHVlcy5vcmlnaW5hbCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmluZEF0dHI6IGF0dHIuYXR0cmlidXRlLnJlcGxhY2UoUGF0dGVybnMuYXR0ci5iaW5kQW5kT24sIFwiXCIpLFxyXG4gICAgICAgICAgICBiaW5kVmFsdWU6IHRoaXMuZWxlbWVudC5kYXRhc2V0W2F0dHIuYXR0cmlidXRlLnJlcGxhY2UoUGF0dGVybnMuYXR0ci5iaW5kQW5kT24sIFwiXCIpXSB8fCBcIlwiLFxyXG4gICAgICAgICAgICB0eXBlOiAoUGF0dGVybnMuYXR0ci5pc1N0cmluZy50ZXN0KGF0dHIudmFsdWVzLm9yaWdpbmFsKSkgPyBcInN0cmluZ1wiXHJcbiAgICAgICAgICAgICAgICA6IChQYXR0ZXJucy5hdHRyLmlzT2JqZWN0LnRlc3QoYXR0ci52YWx1ZXMub3JpZ2luYWwpKSA/IFwib2JqZWN0XCJcclxuICAgICAgICAgICAgICAgICAgICA6IFwidmFyaWFibGVcIlxyXG4gICAgICAgIH0pKTtcclxuICAgICAgICB0aGlzLnBhcnNlQXR0cmlidXRlKCk7XHJcbiAgICB9XHJcbiAgICBzZXRBY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5hdHRyLmZvckVhY2goKGF0dHIpID0+IGF0dHIucHJlZGljYXRlKCkpO1xyXG4gICAgfVxyXG4gICAgcmVmcmVzaEF0dHJpYnV0ZSgpIHtcclxuICAgICAgICB0aGlzLmF0dHIuZmlsdGVyKChhdHRyKSA9PiBbXCJzdHlsZVwiLCBcImNsYXNzXCJdLmluY2x1ZGVzKGF0dHIuYmluZEF0dHIpKVxyXG4gICAgICAgICAgICAuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaSA9IHRoaXMuYXR0ci5pbmRleE9mKGF0dHIpO1xyXG4gICAgICAgICAgICB0aGlzLmF0dHJbaV0udmFsdWVzLmN1cnJlbnQgPSAoKSA9PiBIZWxwZXIucGFyc2VyKHtcclxuICAgICAgICAgICAgICAgIGV4cHI6IHRoaXMuYXR0cltpXS52YWx1ZXMub3JpZ2luYWwsXHJcbiAgICAgICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBbU3R5bGUsIENsYXNzXSA9IFtcclxuICAgICAgICAgICAgdGhpcy5hdHRyLmZpbmRJbmRleCgoYXR0cikgPT4gYXR0ci5iaW5kQXR0ciA9PSBcInN0eWxlXCIpLFxyXG4gICAgICAgICAgICB0aGlzLmF0dHIuZmluZEluZGV4KChhdHRyKSA9PiBhdHRyLmJpbmRBdHRyID09IFwiY2xhc3NcIiksXHJcbiAgICAgICAgXTtcclxuICAgICAgICAodGhpcy5hdHRyW1N0eWxlXSkgJiYgKHRoaXMuYXR0cltTdHlsZV0ucHJlZGljYXRlID0gKCkgPT4gKFtcInN0cmluZ1wiLCBcInZhcmlhYmxlXCJdLmluY2x1ZGVzKHRoaXMuYXR0cltTdHlsZV0udHlwZSkpXHJcbiAgICAgICAgICAgID8gKHRoaXMuZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gdGhpcy5hdHRyW1N0eWxlXS52YWx1ZXMuY3VycmVudCgpICsgdGhpcy5hdHRyW1N0eWxlXS5iaW5kVmFsdWUpXHJcbiAgICAgICAgICAgIDogT2JqZWN0LmFzc2lnbih0aGlzLmVsZW1lbnQuc3R5bGUsIHRoaXMuYXR0cltTdHlsZV0udmFsdWVzLmN1cnJlbnQoKSkpO1xyXG4gICAgICAgICh0aGlzLmF0dHJbQ2xhc3NdKSAmJiAodGhpcy5hdHRyW0NsYXNzXS5wcmVkaWNhdGUgPSAoKSA9PiB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gKFtcInN0cmluZ1wiLCBcInZhcmlhYmxlXCJdLmluY2x1ZGVzKHRoaXMuYXR0cltDbGFzc10udHlwZSkpXHJcbiAgICAgICAgICAgID8gdGhpcy5hdHRyW0NsYXNzXS52YWx1ZXMuY3VycmVudCgpICsgXCIgXCJcclxuICAgICAgICAgICAgOiAoT2JqZWN0LmVudHJpZXModGhpcy5hdHRyW0NsYXNzXS52YWx1ZXMuY3VycmVudCgpKVxyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoWywgdmFsdWVdKSA9PiB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIC5tYXAoKFtrZXldKSA9PiBrZXkpXHJcbiAgICAgICAgICAgICAgICAuam9pbihcIiBcIikgKyBcIiBcIilcclxuICAgICAgICAgICAgICAgICsgdGhpcy5hdHRyW0NsYXNzXS5iaW5kVmFsdWUpO1xyXG4gICAgICAgIHRoaXMuYXR0ci5maWx0ZXIoKGF0dHIpID0+ICFbXCJzdHlsZVwiLCBcImNsYXNzXCJdLmluY2x1ZGVzKGF0dHIuYmluZEF0dHIpKVxyXG4gICAgICAgICAgICAuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoUGF0dGVybnMuYXR0ci5pc09iamVjdC50ZXN0KGF0dHIudmFsdWVzLm9yaWdpbmFsKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgT25seSAnc3R5bGUnIGFuZCAnY2xhc3MnIGF0dHJpYnV0ZSBhY2NlcHRzIGFuIG9iamVjdCBhcyB2YWx1ZSAvXHJcbiAgICAgICAgICAgICAgICAgICAgYW55IG90aGVyIGF0dHRyaWJ1dGUgY2FuIG9ubHkgcmVjZWl2ZSBlaXRoZXIgYSB2YXJpYWJsZSBvciBhIHRlbXBsYXRlIHN0cmluZ2ApO1xyXG4gICAgICAgICAgICBsZXQgaSA9IHRoaXMuYXR0ci5pbmRleE9mKGF0dHIpO1xyXG4gICAgICAgICAgICB0aGlzLmF0dHJbaV0udmFsdWVzLmN1cnJlbnQgPSAoKSA9PiBIZWxwZXIucGFyc2VyKHtcclxuICAgICAgICAgICAgICAgIGV4cHI6IHRoaXMuYXR0cltpXS52YWx1ZXMub3JpZ2luYWwsXHJcbiAgICAgICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYXR0ci5wcmVkaWNhdGUgPSAoKSA9PiB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHIuYmluZEF0dHIsIGF0dHIudmFsdWVzLmN1cnJlbnQoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZXRBY3Rpb24oKTtcclxuICAgIH1cclxuICAgIHBhcnNlQXR0cmlidXRlKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmF0dHIuc29tZSgoYXR0cikgPT4gKCFQYXR0ZXJucy5hdHRyLmlzU3RyaW5nLnRlc3QoYXR0ci52YWx1ZXMub3JpZ2luYWwpICYmXHJcbiAgICAgICAgICAgICAgICAhUGF0dGVybnMuYXR0ci5pc09iamVjdC50ZXN0KGF0dHIudmFsdWVzLm9yaWdpbmFsKSkpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiQSAnZGF0YS1iaW5kJyBhdHRyaWJ1dGUgb25seSBhY2NlcHRzIGFuIG9iamVjdCBvciBhIHRlbXBsYXRlIHN0cmluZyBhcyB2YWx1ZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoQXR0cmlidXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QmluZE5vZGUuanMubWFwIiwiaW1wb3J0IHsgSGVscGVyLCBQYXR0ZXJucyB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5pbXBvcnQgeyBDaGV2ZXJlQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uTm9kZVwiO1xyXG5leHBvcnQgY2xhc3MgRXZlbnROb2RlIGV4dGVuZHMgQ2hldmVyZUFjdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5hdHRyPy5zb21lKChhdHRyKSA9PiB0aGlzLmlmQXR0cklzRW1wdHkoYXR0cikpO1xyXG4gICAgICAgIHRoaXMucGFyc2VBdHRyaWJ1dGUoKTtcclxuICAgIH1cclxuICAgIHJlZnJlc2hBdHRyaWJ1dGUoKSB7XHJcbiAgICAgICAgbGV0IGV2ZW50TmFtZXMgPSB0aGlzLmF0dHIubWFwKChhdHRyKSA9PiBhdHRyLmF0dHJpYnV0ZVxyXG4gICAgICAgICAgICAucmVwbGFjZShQYXR0ZXJucy5hdHRyLmJpbmRBbmRPbiwgXCJcIilcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcLi4qLywgXCJcIikpO1xyXG4gICAgICAgIHRoaXMuYXR0ci5mb3JFYWNoKChhdHRyLCBpKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1vZGlmaWVyID0gYXR0ci5hdHRyaWJ1dGUucmVwbGFjZSgvXi4qXFwuLywgXCJcIik7XHJcbiAgICAgICAgICAgICgobW9kaWZpZXIgIT0gXCJ3aW5kb3dcIikgPyB0aGlzLmVsZW1lbnQgOiB3aW5kb3cpLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lc1tpXSwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIEhlbHBlci5ldmVudENhbGxiYWNrKHtcclxuICAgICAgICAgICAgICAgICAgICAkZXZlbnQ6IGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwcjogKChhdHRyLnZhbHVlcy5vcmlnaW5hbC5pbmNsdWRlcyhcIiRlbWl0U2VsZlwiKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBhdHRyLnZhbHVlcy5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7JHthdHRyLnZhbHVlcy5vcmlnaW5hbH1gKSxcclxuICAgICAgICAgICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcGFyc2VBdHRyaWJ1dGUoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYXR0ci5zb21lKChhdHRyKSA9PiAoIVBhdHRlcm5zLmF0dHIuaXNNZXRob2QudGVzdChhdHRyLnZhbHVlcy5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICYmICFQYXR0ZXJucy5hdHRyLmlzVmFyaWFibGVBc3NpZ24udGVzdChhdHRyLnZhbHVlcy5vcmlnaW5hbCkpKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIkEgJ2RhdGEtb24nIGF0dHJpYnV0ZSBvbmx5IGFjY2VwdHMgYSBtZXRob2Qgb3IgYSBhc3NpZ25tZW50IGFzIHZhbHVlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1FdmVudE5vZGUuanMubWFwIiwiaW1wb3J0IHsgQ2hldmVyZUFjdGlvbiB9IGZyb20gXCIuL0FjdGlvbk5vZGVcIjtcclxuaW1wb3J0IHsgUGF0dGVybnMsIFJlZ0V4cEZhY3RvcnkgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuZXhwb3J0IGNsYXNzIExvb3BOb2RlIGV4dGVuZHMgQ2hldmVyZUFjdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB7XHJcbiAgICAgICAgICAgIGxvb3A6IHRoaXMuZWxlbWVudC5kYXRhc2V0LmZvci5tYXRjaCgvXlxcdysvKVswXSxcclxuICAgICAgICAgICAgcGFyZW50OiB0aGlzLmVsZW1lbnQuZGF0YXNldC5mb3IubWF0Y2goUGF0dGVybnMuYXR0ci5mb3JQYXJlbnQpWzBdLnJlcGxhY2UoXCJ0aGlzLmRhdGEuXCIsIFwiXCIpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcyA9IHtcclxuICAgICAgICAgICAgY29udGVudDogdGhpcy5lbGVtZW50LmNvbnRlbnQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50OiBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmICh0aGlzLnRlbXBsYXRlcy5jb250ZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCI6c2NvcGUgPiAqXCIpLmxlbmd0aCAhPSAxKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIHRlbXBsYXRlIHdpdGggJ2RhdGEtZm9yJyBhdHRyaWJ1dGUgY2FuIG9ubHkgaGF2ZSBvbmUgZGlyZWN0IGNoaWxkXCIpO1xyXG4gICAgICAgIHRoaXMucGFyc2VBdHRyaWJ1dGUoKTtcclxuICAgIH1cclxuICAgIHJlZnJlc2hBdHRyaWJ1dGUoKSB7XHJcbiAgICAgICAgaWYgKCEodGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlcy5wYXJlbnRdIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBleGVjdXRlIGEgZm9yIGxvb3Agd2l0aCB0aGUgJyR7dGhpcy52YXJpYWJsZXMucGFyZW50fScgdmFyaWFibGUsYCArXHJcbiAgICAgICAgICAgICAgICBgaXQgbXVzdCBiZSBhbiBhcnJheWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVzLnBhcmVudF0uZm9yRWFjaCgoXywgaSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHMgPSBbLi4udGhpcy50ZW1wbGF0ZXMuY29udGVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKV0sIHRvUmVwbGFjZSA9IHtcclxuICAgICAgICAgICAgICAgIGJlZm9yZTogYHRoaXMuZGF0YS4ke3RoaXMudmFyaWFibGVzLnBhcmVudH1bJHtpIC0gMX1dYCxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGB0aGlzLmRhdGEuJHt0aGlzLnZhcmlhYmxlcy5wYXJlbnR9WyR7aX1dYFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjaGlsZHMuZm9yRWFjaCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgICAgIFsuLi5jaGlsZC5hdHRyaWJ1dGVzXVxyXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGEpID0+IGEudGV4dENvbnRlbnQuaW5jbHVkZXMoKGkgPT0gMCkgPyB0aGlzLnZhcmlhYmxlcy5sb29wIDogdG9SZXBsYWNlLmJlZm9yZSkpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhLnRleHRDb250ZW50ID0gYS50ZXh0Q29udGVudC5yZXBsYWNlKCgoaSA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFJlZ0V4cEZhY3RvcnkubG9vcCh0aGlzLnZhcmlhYmxlcy5sb29wKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRvUmVwbGFjZS5iZWZvcmUpLCB0b1JlcGxhY2UuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGVzLmZyYWdtZW50LmFwcGVuZChkb2N1bWVudC5pbXBvcnROb2RlKHRoaXMudGVtcGxhdGVzLmNvbnRlbnQsIHRydWUpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnBhcmVudC5lbGVtZW50LmFwcGVuZCh0aGlzLnRlbXBsYXRlcy5mcmFnbWVudCk7XHJcbiAgICB9XHJcbiAgICBwYXJzZUF0dHJpYnV0ZSgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoKCFQYXR0ZXJucy5hdHRyLmZvci50ZXN0KHRoaXMuYXR0ci52YWx1ZXMub3JpZ2luYWwpKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcImRhdGEtZm9yIGF0dHJpYnV0ZSBtdXN0IGZvbGxvdyB0aGUgcGF0dGVybiAndmFyIGluIHZhcnMnXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Mb29wTm9kZS5qcy5tYXAiLCJpbXBvcnQgeyBDaGV2ZXJlQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uTm9kZVwiO1xyXG5pbXBvcnQgeyBQYXR0ZXJucyB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5leHBvcnQgY2xhc3MgTW9kZWxOb2RlIGV4dGVuZHMgQ2hldmVyZUFjdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuYXR0ci52YWx1ZXMub3JpZ2luYWwucmVwbGFjZShcInRoaXMuZGF0YS5cIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5pbnB1dFR5cGUgPSB0aGlzLmVsZW1lbnQudHlwZTtcclxuICAgICAgICAodGhpcy5pbnB1dFR5cGUgPT0gXCJjaGVja2JveFwiKSAmJiAodGhpcy5yZWxhdGVkID0gWy4uLnRoaXMucGFyZW50LmVsZW1lbnRcclxuICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKGBpbnB1dFt0eXBlPSdjaGVja2JveCddW2RhdGEtbW9kZWw9J3RoaXMuZGF0YS4ke3RoaXMudmFyaWFibGV9J11gKV1cclxuICAgICAgICAgICAgLmZpbHRlcigoZSkgPT4gZSAhPSB0aGlzLmVsZW1lbnQpKTtcclxuICAgICAgICB0aGlzLmlmQXR0cklzRW1wdHkodGhpcy5hdHRyKTtcclxuICAgICAgICB0aGlzLnBhcnNlQXR0cmlidXRlKCk7XHJcbiAgICB9XHJcbiAgICBiaW5kRGF0YSgpIHtcclxuICAgICAgICBpZiAoIVtcInJhZGlvXCIsIFwiY2hlY2tib3hcIl0uaW5jbHVkZXModGhpcy5pbnB1dFR5cGUpKVxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBTdHJpbmcodGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXSk7XHJcbiAgICB9XHJcbiAgICBzZXRBY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXSA9ICh0aGlzLmlucHV0VHlwZSAhPSBcImNoZWNrYm94XCIpXHJcbiAgICAgICAgICAgID8gdGhpcy5lbGVtZW50LnZhbHVlXHJcbiAgICAgICAgICAgIDogKCghdGhpcy5yZWxhdGVkPy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICA/IHRoaXMuZWxlbWVudC5jaGVja2VkXHJcbiAgICAgICAgICAgICAgICA6IFsuLi50aGlzLnJlbGF0ZWQsIHRoaXMuZWxlbWVudF1cclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChjKSA9PiBjLmNoZWNrZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoYykgPT4gYy52YWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuam9pbihcIixcIikpO1xyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgcmVmcmVzaEF0dHJpYnV0ZSgpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHRoaXMuc2V0QWN0aW9uLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuYmluZERhdGEoKTtcclxuICAgIH1cclxuICAgIHBhcnNlQXR0cmlidXRlKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5hdHRyPy52YWx1ZXMub3JpZ2luYWwubWF0Y2goUGF0dGVybnMuZ2xvYmFsLiRkYXRhKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIlRoZSAnZGF0YS1tb2RlbCcgYXR0cmlidXRlIG9ubHkgYWNjZXB0IGEgcHJvcGVydHkgcmVmZXJlbmNlIGFzIHZhbHVlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Nb2RlbE5vZGUuanMubWFwIiwiaW1wb3J0IHsgSGVscGVyLCBQYXR0ZXJucyB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5pbXBvcnQgeyBDaGV2ZXJlQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uTm9kZVwiO1xyXG5leHBvcnQgY2xhc3MgU2hvd05vZGUgZXh0ZW5kcyBDaGV2ZXJlQWN0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXkgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudCkuZGlzcGxheTtcclxuICAgICAgICB0aGlzLmlmQXR0cklzRW1wdHkodGhpcy5hdHRyKTtcclxuICAgICAgICB0aGlzLnBhcnNlQXR0cmlidXRlKCk7XHJcbiAgICB9XHJcbiAgICBzZXRBY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAhKHRoaXMuYXR0ci52YWx1ZXMuY3VycmVudCgpKVxyXG4gICAgICAgICAgICA/IFwibm9uZVwiXHJcbiAgICAgICAgICAgIDogdGhpcy5kaXNwbGF5O1xyXG4gICAgfVxyXG4gICAgcmVmcmVzaEF0dHJpYnV0ZSgpIHtcclxuICAgICAgICB0aGlzLmF0dHIudmFsdWVzLmN1cnJlbnQgPSAoKSA9PiBIZWxwZXIucGFyc2VyKHtcclxuICAgICAgICAgICAgZXhwcjogdGhpcy5hdHRyLnZhbHVlcy5vcmlnaW5hbCxcclxuICAgICAgICAgICAgbm9kZTogdGhpcy5wYXJlbnRcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNldEFjdGlvbigpO1xyXG4gICAgfVxyXG4gICAgcGFyc2VBdHRyaWJ1dGUoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKCghUGF0dGVybnMuYXR0ci5pc0Jvb2xlYW4udGVzdCh0aGlzLmF0dHIudmFsdWVzLm9yaWdpbmFsKSlcclxuICAgICAgICAgICAgICAgICYmICghUGF0dGVybnMuYXR0ci5pc0xvZ2ljYWxFeHByZXNzaW9uLnRlc3QodGhpcy5hdHRyLnZhbHVlcy5vcmlnaW5hbCkpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiZGF0YS1zaG93IGF0dHJpYnV0ZSBvbmx5IGFjY2VwdCBib29sZWFuc1wiKTtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoQXR0cmlidXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICA7XHJcbn1cclxuO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1TaG93Tm9kZS5qcy5tYXAiLCJpbXBvcnQgeyBDaGV2ZXJlQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uTm9kZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIsIFBhdHRlcm5zIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcbmV4cG9ydCBjbGFzcyBUZXh0Tm9kZSBleHRlbmRzIENoZXZlcmVBY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuaWZBdHRySXNFbXB0eSh0aGlzLmF0dHIpO1xyXG4gICAgICAgIHRoaXMucGFyc2VBdHRyaWJ1dGUoKTtcclxuICAgIH1cclxuICAgIHNldEFjdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLmF0dHIudmFsdWVzLmN1cnJlbnQoKTtcclxuICAgIH1cclxuICAgIHJlZnJlc2hBdHRyaWJ1dGUoKSB7XHJcbiAgICAgICAgdGhpcy5hdHRyLnZhbHVlcy5jdXJyZW50ID0gKCkgPT4gSGVscGVyLnBhcnNlcih7XHJcbiAgICAgICAgICAgIGV4cHI6IHRoaXMuYXR0cj8udmFsdWVzLm9yaWdpbmFsLFxyXG4gICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudCxcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNldEFjdGlvbigpO1xyXG4gICAgfVxyXG4gICAgcGFyc2VBdHRyaWJ1dGUoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKChQYXR0ZXJucy5hdHRyLmlzT2JqZWN0LnRlc3QodGhpcy5hdHRyPy52YWx1ZXMub3JpZ2luYWwpKVxyXG4gICAgICAgICAgICAgICAgfHwgKFBhdHRlcm5zLmF0dHIuaXNNZXRob2QudGVzdCh0aGlzLmF0dHI/LnZhbHVlcy5vcmlnaW5hbCkpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlICdkYXRhLXRleHQnIGF0dHJpYnV0ZSBvbmx5IGFjY2VwdCBzdHJpbmdzIGNvbmNhdGVuYXRpb24sIGFuZCBhIHZhcmlhYmxlIGFzIHJlZmVyZW5jZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoQXR0cmlidXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VGV4dE5vZGUuanMubWFwIiwiZXhwb3J0ICogZnJvbSBcIi4vRXZlbnROb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0xvb3BOb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL01vZGVsTm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9UZXh0Tm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9TaG93Tm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9CaW5kTm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9BY3Rpb25Ob2RlXCI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsImltcG9ydCB7IEJpbmROb2RlLCBFdmVudE5vZGUsIExvb3BOb2RlLCBNb2RlbE5vZGUsIFNob3dOb2RlLCBUZXh0Tm9kZSB9IGZyb20gXCJAYWN0aW9uc1wiO1xyXG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuZXhwb3J0IGNsYXNzIENoZXZlcmUge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuY2hpbGRzID0ge1xyXG4gICAgICAgICAgICBcImRhdGEtb25cIjogW10sXHJcbiAgICAgICAgICAgIFwiZGF0YS10ZXh0XCI6IFtdLFxyXG4gICAgICAgICAgICBcImRhdGEtbW9kZWxcIjogW10sXHJcbiAgICAgICAgICAgIFwiZGF0YS1mb3JcIjogW10sXHJcbiAgICAgICAgICAgIFwiZGF0YS1zaG93XCI6IFtdLFxyXG4gICAgICAgICAgICBcImRhdGEtcmVmXCI6IFtdLFxyXG4gICAgICAgICAgICBcImRhdGEtYmluZFwiOiBbXSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuc2V0SWQoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0YXNldC5pZCA9IHRoaXMuaWQ7XHJcbiAgICB9XHJcbiAgICBzZXRJZCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzMikuc3Vic3RyKDIpO1xyXG4gICAgfVxyXG4gICAgZmluZFJlZnMoKSB7XHJcbiAgICAgICAgdGhpcy5yZWZzID0gWy4uLnRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLXJlZl1cIildXHJcbiAgICAgICAgICAgIC5yZWR1Y2UoKHByb3BzLCBlbCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWVsLmRhdGFzZXQucmVmKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiZGF0YS1yZWYgYXR0cmlidXRlIGNhbm5vdCBiZSBlbXB0eVwiKTtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHsgLi4ucHJvcHMgfSkuc29tZSgocCkgPT4gcCA9PSBlbC5kYXRhc2V0LnJlZikpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJJdCBzZWVtcyBsaWtlIHRoZXJlIGFyZSByZXBlYXRlZCAnZGF0YS1yZWYnIHZhbHVlcywgY2hlY2sgeW91ciAnZGF0YS1yZWYnIGF0dHJpYnV0ZXNcIik7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAuLi5wcm9wcyxcclxuICAgICAgICAgICAgICAgIFtlbC5kYXRhc2V0LnJlZl06IGVsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sIHt9KTtcclxuICAgIH1cclxuICAgIHJlZnJlc2hDaGlsZHMoYXR0ciwgbmFtZSkge1xyXG4gICAgICAgIHRoaXMuY2hpbGRzW2F0dHJdLmZpbHRlcigobm9kZSkgPT4gKG5vZGUuYXR0cj8udmFsdWVzLm9yaWdpbmFsLmluY2x1ZGVzKG5hbWUpKSkuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBub2RlLnNldEFjdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgJGVtaXQoZGF0YSkge1xyXG4gICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChkYXRhLm5hbWUsIHtcclxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhLmRldGFpbCxcclxuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcclxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgc2V0Q2hpbGRzKGRhdGEpIHtcclxuICAgICAgICBkYXRhLm5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHNbZGF0YS50eXBlXS5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgY2hlY2tGb3JBY3Rpb25zQW5kQ2hpbGRzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS1pbmxpbmVdLCAqW2RhdGEtYXR0YWNoZWRdXCIpLmxlbmd0aClcclxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoYENoaWxkIGNvbXBvbmVudHMgaXMgYW4gdW5zdXBwb3J0ZWQgZmVhdHVyZSwgc29ycnkgYWJvdXQgdGhhdGApO1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcyA9IFtcclxuICAgICAgICAgICAgSGVscGVyLmdldEVsZW1lbnRzQnkoe1xyXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlOiBcImRhdGEtZm9yXCIsXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCJ0ZW1wbGF0ZVtkYXRhLWZvcl1cIixcclxuICAgICAgICAgICAgICAgIENoaWxkOiBMb29wTm9kZVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgSGVscGVyLmdldEVsZW1lbnRzQnkoe1xyXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlOiBcImRhdGEtdGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiKltkYXRhLXRleHRdXCIsXHJcbiAgICAgICAgICAgICAgICBDaGlsZDogVGV4dE5vZGVcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIEhlbHBlci5nZXRFbGVtZW50c0J5KHtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZTogXCJkYXRhLXNob3dcIixcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIipbZGF0YS1zaG93XVwiLFxyXG4gICAgICAgICAgICAgICAgQ2hpbGQ6IFNob3dOb2RlXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBIZWxwZXIuZ2V0RWxlbWVudHNCeSh7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGU6IFwiZGF0YS1tb2RlbFwiLFxyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiaW5wdXRbZGF0YS1tb2RlbF0sIHNlbGVjdFtkYXRhLW1vZGVsXSwgdGV4dGFyZWFbZGF0YS1tb2RlbF1cIixcclxuICAgICAgICAgICAgICAgIENoaWxkOiBNb2RlbE5vZGVcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIEhlbHBlci5nZXRFbGVtZW50c0J5RGF0YU9uKHtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZTogXCJvblwiLFxyXG4gICAgICAgICAgICAgICAgQ2hpbGQ6IEV2ZW50Tm9kZSxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogdGhpc1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhT24oe1xyXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlOiBcImJpbmRcIixcclxuICAgICAgICAgICAgICAgIENoaWxkOiBCaW5kTm9kZSxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogdGhpc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIF07XHJcbiAgICAgICAgY2hpbGRzLmZvckVhY2goKGNoaWxkKSA9PiAoY2hpbGQubm9kZXMubGVuZ3RoKSAmJiB0aGlzLnNldENoaWxkcyhjaGlsZCkpO1xyXG4gICAgfVxyXG4gICAgJGVtaXRTZWxmKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmNoaWxkc1tcImRhdGEtb25cIl1cclxuICAgICAgICAgICAgLmZpbHRlcigobm9kZSkgPT4gbm9kZS5hdHRyXHJcbiAgICAgICAgICAgIC5zb21lKChhdHRycykgPT4gYXR0cnMuYXR0cmlidXRlLmluY2x1ZGVzKGRhdGEubmFtZSkpKS5mb3JFYWNoKChub2RlKSA9PiBub2RlLmVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZGF0YS5uYW1lLCB7XHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YS5kZXRhaWwsXHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgIH0pKSk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVSZWxhdGVkKG5hbWUpIHtcclxuICAgICAgICBbXCJkYXRhLXNob3dcIiwgXCJkYXRhLXRleHRcIl0uZm9yRWFjaCgoYXR0cikgPT4gdGhpcy5yZWZyZXNoQ2hpbGRzKGF0dHIsIG5hbWUpKTtcclxuICAgICAgICB0aGlzLmNoaWxkc1tcImRhdGEtbW9kZWxcIl0uZmlsdGVyKChub2RlKSA9PiBub2RlLnZhcmlhYmxlID09IG5hbWUpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChub2RlKSA9PiBub2RlLmJpbmREYXRhKCkpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRzW1wiZGF0YS1iaW5kXCJdLmZvckVhY2goKGNoaWxkKSA9PiBjaGlsZC5zZXRBY3Rpb24oKSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2hldmVyZS5qcy5tYXAiLCJpbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuLyoqXHJcbiAqICBUaGUgY2xhc3MgdGhhdCB1c2VycyBjcmVhdGUgdGhlaXIgY29tcG9uZW50c1xyXG4gKiAgQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2hldmVyZURhdGEge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgICh7XHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgZGF0YTogdGhpcy5kYXRhLFxyXG4gICAgICAgICAgICBtZXRob2RzOiB0aGlzLm1ldGhvZHMsXHJcbiAgICAgICAgICAgIGluaXQ6IHRoaXMuaW5pdCxcclxuICAgICAgICAgICAgd2F0Y2g6IHRoaXMud2F0Y2gsXHJcbiAgICAgICAgICAgIHVwZGF0ZWQ6IHRoaXMudXBkYXRlZCxcclxuICAgICAgICAgICAgdXBkYXRpbmc6IHRoaXMudXBkYXRpbmdcclxuICAgICAgICB9ID0gZGF0YSk7XHJcbiAgICAgICAgKHRoaXMud2F0Y2gpICYmIE9iamVjdC5rZXlzKHRoaXMud2F0Y2gpLnNvbWUoKGZ1bmMpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGFbZnVuY10pXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYFlvdSdyZSB0cnlpbmcgdG8gd2F0Y2ggYW4gdW5kZWZpbmVkIHByb3BlcnR5ICcke2Z1bmN9J2ApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBpbml0RnVuYyhhcmdzKSB7XHJcbiAgICAgICAgbGV0IHBhcnNlZEFyZ3MgPSAoYXJncylcclxuICAgICAgICAgICAgPyAoYXJncz8uc3BsaXQoXCIsXCIpLm1hcCgoYSkgPT4gSGVscGVyLnBhcnNlcih7IGV4cHI6IGEgfSkpKVxyXG4gICAgICAgICAgICA6IFtdO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdCguLi5wYXJzZWRBcmdzIHx8IFwiXCIpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUNoZXZlcmVEYXRhLmpzLm1hcCIsImltcG9ydCB7IENoZXZlcmUgfSBmcm9tIFwiQGNoZXZlcmVcIjtcclxuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlSW5saW5lIGV4dGVuZHMgQ2hldmVyZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbCkge1xyXG4gICAgICAgIHN1cGVyKGVsKTtcclxuICAgICAgICB0aGlzLmRhdGEgPSB7fTtcclxuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLnBhcnNlRGF0YShIZWxwZXIucGFyc2VyKHsgZXhwcjogdGhpcy5lbGVtZW50LmRhdGFzZXQuaW5saW5lIHx8IFwie31cIiB9KSk7XHJcbiAgICAgICAgdGhpcy5jaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKTtcclxuICAgICAgICB0aGlzLmZpbmRSZWZzKCk7XHJcbiAgICAgICAgT2JqZWN0LnNlYWwodGhpcyk7XHJcbiAgICB9XHJcbiAgICBwYXJzZURhdGEoZGF0YSkge1xyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJveHkoZGF0YSwge1xyXG4gICAgICAgICAgICBnZXQodGFyZ2V0LCBuYW1lLCByZWNlaXZlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgbmFtZSwgcmVjZWl2ZXIpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQodGFyZ2V0LCBuYW1lLCB2YWx1ZSwgcmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgICAgIFJlZmxlY3Quc2V0KHRhcmdldCwgbmFtZSwgdmFsdWUsIHJlY2VpdmVyKTtcclxuICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlUmVsYXRlZChuYW1lKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2hldmVyZUlubGluZS5qcy5tYXAiLCJ2YXIgX19jbGFzc1ByaXZhdGVGaWVsZFNldCA9ICh0aGlzICYmIHRoaXMuX19jbGFzc1ByaXZhdGVGaWVsZFNldCkgfHwgZnVuY3Rpb24gKHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcclxufTtcclxudmFyIF9fY2xhc3NQcml2YXRlRmllbGRHZXQgPSAodGhpcyAmJiB0aGlzLl9fY2xhc3NQcml2YXRlRmllbGRHZXQpIHx8IGZ1bmN0aW9uIChyZWNlaXZlciwgc3RhdGUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIGdldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHJlYWQgcHJpdmF0ZSBtZW1iZXIgZnJvbSBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIGtpbmQgPT09IFwibVwiID8gZiA6IGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyKSA6IGYgPyBmLnZhbHVlIDogc3RhdGUuZ2V0KHJlY2VpdmVyKTtcclxufTtcclxudmFyIF9DaGV2ZXJlTm9kZV93YXRjaDtcclxuaW1wb3J0IHsgQ2hldmVyZSB9IGZyb20gXCIuL0NoZXZlcmVcIjtcclxuZXhwb3J0IGNsYXNzIENoZXZlcmVOb2RlIGV4dGVuZHMgQ2hldmVyZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBlbCkge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICBzdXBlcihlbCk7XHJcbiAgICAgICAgX0NoZXZlcmVOb2RlX3dhdGNoLnNldCh0aGlzLCB2b2lkIDApO1xyXG4gICAgICAgIChfYSA9IHRoaXMsIHtcclxuICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICBtZXRob2RzOiB0aGlzLm1ldGhvZHMsXHJcbiAgICAgICAgICAgIHdhdGNoOiAoeyBzZXQgdmFsdWUoX2IpIHsgX19jbGFzc1ByaXZhdGVGaWVsZFNldChfYSwgX0NoZXZlcmVOb2RlX3dhdGNoLCBfYiwgXCJmXCIpOyB9IH0pLnZhbHVlLFxyXG4gICAgICAgICAgICB1cGRhdGVkOiB0aGlzLnVwZGF0ZWQsXHJcbiAgICAgICAgICAgIHVwZGF0aW5nOiB0aGlzLnVwZGF0aW5nLFxyXG4gICAgICAgIH0gPSBkYXRhKTtcclxuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLnBhcnNlRGF0YShkYXRhLmRhdGEpO1xyXG4gICAgICAgICh0aGlzLm1ldGhvZHMpICYmIHRoaXMucGFyc2VNZXRob2RzKCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIEdldCB0aGUgZXZlbnRzIGFuZCBhY3Rpb25zIG9mIHRoZSBjb21wb25lbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNoZWNrRm9yQWN0aW9uc0FuZENoaWxkcygpO1xyXG4gICAgICAgIHRoaXMuZmluZFJlZnMoKTtcclxuICAgICAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSBhbGwgdGhlIGRhdGEsIHRoZXkgbmVlZCBnZXR0ZXIgYW5kIGEgc2V0dGVyXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgcHJpbWl0aXZlIGRhdGFcclxuICAgICAqL1xyXG4gICAgcGFyc2VEYXRhKGRhdGEpIHtcclxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KGRhdGEsIHtcclxuICAgICAgICAgICAgZ2V0KHRhcmdldCwgbmFtZSwgcmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIG5hbWUsIHJlY2VpdmVyKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0KHRhcmdldCwgbmFtZSwgdmFsdWUsIHJlY2VpdmVyKSB7XHJcbiAgICAgICAgICAgICAgICAoc2VsZi51cGRhdGluZykgJiYgc2VsZi51cGRhdGluZygpO1xyXG4gICAgICAgICAgICAgICAgKF9fY2xhc3NQcml2YXRlRmllbGRHZXQoc2VsZiwgX0NoZXZlcmVOb2RlX3dhdGNoLCBcImZcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgX19jbGFzc1ByaXZhdGVGaWVsZEdldChzZWxmLCBfQ2hldmVyZU5vZGVfd2F0Y2gsIFwiZlwiKVtuYW1lXT8uYXBwbHkoc2VsZiwgW3ZhbHVlLCB0YXJnZXRbbmFtZV1dKTtcclxuICAgICAgICAgICAgICAgIFJlZmxlY3Quc2V0KHRhcmdldCwgbmFtZSwgdmFsdWUsIHJlY2VpdmVyKTtcclxuICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlUmVsYXRlZChuYW1lKTtcclxuICAgICAgICAgICAgICAgIChzZWxmLnVwZGF0ZWQpICYmIHNlbGYudXBkYXRlZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHBhcnNlTWV0aG9kcygpIHtcclxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLm1ldGhvZHMgPSBPYmplY3QudmFsdWVzKHRoaXMubWV0aG9kcylcclxuICAgICAgICAgICAgLnJlZHVjZSgocmVzdCwgZnVuYykgPT4gKHtcclxuICAgICAgICAgICAgLi4ucmVzdCxcclxuICAgICAgICAgICAgW2Z1bmMubmFtZV06IG5ldyBQcm94eShmdW5jLCB7XHJcbiAgICAgICAgICAgICAgICBhcHBseSh0YXJnZXQsIF8sIGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAoc2VsZi51cGRhdGluZykgJiYgc2VsZi51cGRhdGluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5hcHBseShzZWxmLCBbLi4uYXJnc10pO1xyXG4gICAgICAgICAgICAgICAgICAgIChzZWxmLnVwZGF0ZWQpICYmIHNlbGYudXBkYXRlZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pLCB7fSk7XHJcbiAgICB9XHJcbn1cclxuX0NoZXZlcmVOb2RlX3dhdGNoID0gbmV3IFdlYWtNYXAoKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2hldmVyZU5vZGUuanMubWFwIiwiZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZURhdGFcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZU5vZGVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9DaGV2ZXJlSW5saW5lXCI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsImltcG9ydCB7IFJlZ0V4cEZhY3RvcnkgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuZXhwb3J0IGNvbnN0IEhlbHBlciA9IHtcclxuICAgIGdldEVsZW1lbnRzQnkoZGF0YSkge1xyXG4gICAgICAgIGNvbnN0IG5vZGVzID0gWy4uLmRhdGEuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGRhdGEuc2VsZWN0b3IpXTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiBkYXRhLmF0dHJpYnV0ZSxcclxuICAgICAgICAgICAgbm9kZXM6IG5vZGVzLm1hcCgobm9kZSkgPT4gbmV3IGRhdGEuQ2hpbGQoe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogbm9kZSxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogZGF0YS5wYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBhdHRyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlOiBkYXRhLmF0dHJpYnV0ZSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IG5vZGUuZ2V0QXR0cmlidXRlKGRhdGEuYXR0cmlidXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBwYXJzZXIoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oWy4uLihkYXRhLmFyZ3M/LmtleXMoKSB8fCBcIlwiKV0uam9pbihcIixcIiksIGByZXR1cm4gJHtkYXRhLmV4cHJ9YCkuYmluZChkYXRhLm5vZGUpKC4uLlsuLi4oZGF0YS5hcmdzPy52YWx1ZXMoKSB8fCBcIlwiKV0pO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhT24oZGF0YSkge1xyXG4gICAgICAgIGNvbnN0IHJlZ2V4cCA9IFJlZ0V4cEZhY3RvcnkuYmluZE9yT24oZGF0YS5hdHRyaWJ1dGUpLCBub2RlcyA9IFsuLi5kYXRhLnBhcmVudC5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpXVxyXG4gICAgICAgICAgICAuZmlsdGVyKChlbCkgPT4gWy4uLmVsLmF0dHJpYnV0ZXNdXHJcbiAgICAgICAgICAgIC5tYXAoKGF0dHIpID0+IGF0dHIubmFtZSlcclxuICAgICAgICAgICAgLnNvbWUoKGF0dHIpID0+IHJlZ2V4cC50ZXN0KGF0dHIpKSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogYGRhdGEtJHtkYXRhLmF0dHJpYnV0ZX1gLFxyXG4gICAgICAgICAgICBub2Rlczogbm9kZXMubWFwKChub2RlKSA9PiBuZXcgZGF0YS5DaGlsZCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBub2RlLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBkYXRhLnBhcmVudCxcclxuICAgICAgICAgICAgICAgIGF0dHI6IFsuLi5ub2RlLmF0dHJpYnV0ZXNdXHJcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoYXR0cikgPT4gYXR0ci5uYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoYXR0ciA9PiByZWdleHAudGVzdChhdHRyKSlcclxuICAgICAgICAgICAgICAgICAgICAubWFwKChhdHRyKSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZTogYXR0cixcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IG5vZGUuZ2V0QXR0cmlidXRlKGF0dHIpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICAgIH0pKSxcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIGV2ZW50Q2FsbGJhY2soZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oXCIkZXZlbnQsICRlbFwiLCBkYXRhLmV4cHIpLmJpbmQoZGF0YS5ub2RlLCBkYXRhLiRldmVudCwgZGF0YS5ub2RlLmVsZW1lbnQpKCk7XHJcbiAgICB9XHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUhlbHBlci5qcy5tYXAiLCJleHBvcnQgY29uc3QgUmVnRXhwRmFjdG9yeSA9IHtcclxuICAgIGxvb3A6ICh2YXJpYWJsZSkgPT4gbmV3IFJlZ0V4cChTdHJpbmcucmF3IGBeJHt2YXJpYWJsZX18KD88PVxcWykke3ZhcmlhYmxlfSg/PVxcXSl8KD8hXFwsKSR7dmFyaWFibGV9KD89XFwsKXwoPzw9XFw6KFxccyspPykke3ZhcmlhYmxlfXwoPzw9XFwsfFxcKCkke3ZhcmlhYmxlfWAsIFwiZ1wiKSxcclxuICAgICR0aGlzOiAocHJvcCkgPT4gbmV3IFJlZ0V4cChTdHJpbmcucmF3IGBedGhpc1xcLiR7cHJvcH1cXC5bYS16QS1aXWAsIFwiZ1wiKSxcclxuICAgIGJpbmRPck9uOiAodmFsKSA9PiBuZXcgUmVnRXhwKFN0cmluZy5yYXcgYF5kYXRhLSR7dmFsfTp8QCR7dmFsfWApXHJcbn07XHJcbmNvbnN0IGNvbW1vblJlZ2V4cCA9IHtcclxuICAgICR0aGlzOiBSZWdFeHBGYWN0b3J5LiR0aGlzKFwiZGF0YVwiKSxcclxuICAgIHdvcmRzOiBcIlthLXpBLVpdK1wiLFxyXG4gICAgbWV0aG9kczogU3RyaW5nLnJhdyBgXnRoaXNcXC4obWV0aG9kc3xcXCRlbWl0fFxcJGVtaXRTZWxmKVxcLlthLXpBLVpdK2AsXHJcbiAgICBib29sOiBTdHJpbmcucmF3IGBeKFxcISk/KHRydWV8ZmFsc2V8dGhpc1xcLmRhdGFcXC5cXHcrKWAsXHJcbn07XHJcbmV4cG9ydCBjb25zdCBQYXR0ZXJucyA9IHtcclxuICAgIGdsb2JhbDoge1xyXG4gICAgICAgIGdldE5hbWU6IG5ldyBSZWdFeHAoY29tbW9uUmVnZXhwLndvcmRzKSxcclxuICAgICAgICAkZGF0YTogY29tbW9uUmVnZXhwLiR0aGlzLFxyXG4gICAgICAgIGFyZ3VtZW50czogLyg/PD1cXCgpLiooPz1cXCkpL2csXHJcbiAgICB9LFxyXG4gICAgdmFyaWFibGVzOiB7XHJcbiAgICAgICAgZXF1YWxpdHk6IC8oPHw+fCEpPz17MSwzfS9nLFxyXG4gICAgICAgIHZhbHVlOiAvKD88PVxcPSkuKig/PVxcOykvZyxcclxuICAgIH0sXHJcbiAgICBhdHRyOiB7XHJcbiAgICAgICAgaXNNYWdpYzogL14oXFwkbWFnaWNzKS8sXHJcbiAgICAgICAgbWV0aG9kTmFtZTogbmV3IFJlZ0V4cChjb21tb25SZWdleHAubWV0aG9kcyksXHJcbiAgICAgICAgaXNNZXRob2Q6IC9eLitcXCguKlxcKShcXDspPyQvLFxyXG4gICAgICAgIGlzTG9naWNhbEV4cHJlc3Npb246IG5ldyBSZWdFeHAoU3RyaW5nLnJhdyBgJHtjb21tb25SZWdleHAuYm9vbH0oXFxzKyk/KFxcfHwmfD18IT18KD58PCkoPSk/KWApLFxyXG4gICAgICAgIGlzVmFyaWFibGVBc3NpZ246IC9edGhpc1xcLmRhdGFcXC5cXHcrKFxccyk/KFxcP1xcP3x8XFwrfFxcLXxcXCp8XFwvfFxcJXxcXCpcXCp8PDw/fD4+KD4pP3xcXHwoXFx8KT98fFxcJihcXCYpP3xcXF4pPz0vLFxyXG4gICAgICAgIGlzU3RyaW5nOiAvXihcXGApLipcXDEkLyxcclxuICAgICAgICBpc09iamVjdDogL15cXHsuKlxcfSQvLFxyXG4gICAgICAgIGlzQm9vbGVhbjogbmV3IFJlZ0V4cChgJHtjb21tb25SZWdleHAuYm9vbH0kYCksXHJcbiAgICAgICAgbWV0aG9kU3ludGF4OiAvKF5cXHcrJCl8KF5cXHcrXFwoKC4qKT9cXCkkKS8sXHJcbiAgICAgICAgYmluZEFuZE9uOiAvXihkYXRhLShvbnxiaW5kKTp8QChvbnxiaW5kKSkvLFxyXG4gICAgICAgIGJpbmQ6IC9eKGRhdGEtKS8sXHJcbiAgICAgICAgZm9yOiAvXlxcdysoXFxzKylpbihcXHMrKXRoaXNcXC5kYXRhXFwuXFx3Ky8sXHJcbiAgICAgICAgZm9yUGFyZW50OiAvdGhpc1xcLi4qL2csXHJcbiAgICB9LFxyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1QYXR0ZXJucy5qcy5tYXAiLCJleHBvcnQgKiBmcm9tIFwiLi9IZWxwZXJcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUGF0dGVybnNcIjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBDaGV2ZXJlRGF0YSwgQ2hldmVyZUlubGluZSwgQ2hldmVyZU5vZGUgfSBmcm9tIFwiQGNoZXZlcmVcIjtcclxuaW1wb3J0IHsgUGF0dGVybnMgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuZXhwb3J0IGNvbnN0IENoZXZlcmUgPSB7XHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgYSBDaGV2ZXJlRGF0YSBieSB0aGUgdmFsdWUgb2YgdGhlICdkYXRhLWF0dGFjaGVkJyBhdHRyaWJ1dGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyXHJcbiAgICAgKiBAcGFyYW0ge0NoZXZlcmVEYXRhW119IGRhdGFcclxuICAgICAqIEByZXR1cm5zIFRoZSBkYXRhIHJlYWR5IGZvciBpbnN0YW5jZSBhIE5vZGVMaXN0T2Y8RWxlbWVudD5cclxuICAgICAqL1xyXG4gICAgZmluZEl0c0RhdGEoYXR0ciwgLi4uZGF0YSkge1xyXG4gICAgICAgIGxldCBzZWFyY2ggPSBkYXRhLmZpbmQoKGQpID0+IGQubmFtZSA9PSBhdHRyLnRyaW0oKS5yZXBsYWNlKC9cXCguKi8sIFwiXCIpKTtcclxuICAgICAgICBpZiAoIXNlYXJjaClcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGAnJHthdHRyfScgY291bGRuJ3QgYmUgZm91bmQgaW4gYW55IG9mIHlvdXIgZGVjbGFyZWQgY29tcG9uZW50c2ApO1xyXG4gICAgICAgIHJldHVybiBzZWFyY2g7XHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiBTZWFyY2ggZm9yIENoZXZlcmUgTm9kZXMgYXQgdGhlIHNpdGVcclxuICAgICAqIEBwYXJhbSBkYXRhIEFsbCB0aGUgQ2hldmVyZSBjb21wb25lbnRzXHJcbiAgICAgKi9cclxuICAgIHN0YXJ0KC4uLmRhdGEpIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLWF0dGFjaGVkXVwiKV1cclxuICAgICAgICAgICAgLm1hcCgoZWxlbWVudCkgPT4gKHsgZWw6IGVsZW1lbnQsIGF0dHI6IGVsZW1lbnQuZGF0YXNldC5hdHRhY2hlZCB9KSk7XHJcbiAgICAgICAgLy9DcmVhdGUgYSBDaGV2ZXJlTm9kZSBmb3IgZWFjaCBkYXRhLWF0dGFjaGVkXHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChhc3luYyAoZWwpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZmluZEl0c0RhdGEoZWwuYXR0ciwgLi4uZGF0YSk7XHJcbiAgICAgICAgICAgIGlmICghUGF0dGVybnMuYXR0ci5tZXRob2RTeW50YXgudGVzdChlbC5hdHRyKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVGhlcmUgYXJlIHN5bnRheCBlcnJvciBpbiB0aGUgJ2RhdGEtYXR0YWNoZWQnIGF0dHJpYnV0ZSwgdW5yZWNvZ25pemVkIGV4cHJlc3Npb24gXCIke2VsLmF0dHJ9XCJgKTtcclxuICAgICAgICAgICAgaWYgKChub2RlLmluaXQgPT0gdW5kZWZpbmVkKSAmJiAoUGF0dGVybnMuZ2xvYmFsLmFyZ3VtZW50cy50ZXN0KGVsLmF0dHIpKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFdmFsRXJyb3IoYFRoZSAke25vZGUubmFtZX0gY29tcG9uZW50cyBkb24ndCBoYXZlIGFuIGluaXQoKSBmdW5jdGlvbiwgdGhlcmVmb3JlIHRoZXkgZG8gbm90IGFjY2VwdCBhbnkgcGFyYW1ldGVyc2ApO1xyXG4gICAgICAgICAgICBpZiAobm9kZS5pbml0ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFBhdHRlcm5zLmdsb2JhbC5hcmd1bWVudHMudGVzdChlbC5hdHRyKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBub2RlLmluaXRGdW5jKGVsLmF0dHIubWF0Y2goUGF0dGVybnMuZ2xvYmFsLmFyZ3VtZW50cykuam9pbihcIixcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbm9kZS5pbml0RnVuYygpO1xyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuZXcgQ2hldmVyZU5vZGUobm9kZSwgZWwuZWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLWlubGluZV1cIildLm1hcCgoZSkgPT4gbmV3IENoZXZlcmVJbmxpbmUoZSkpO1xyXG4gICAgfSxcclxuICAgIGRhdGEoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQ2hldmVyZURhdGEoZGF0YSk7XHJcbiAgICB9LFxyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LCBcIkNoZXZlcmVcIiwgeyB2YWx1ZTogQ2hldmVyZSB9KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9