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
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
const _helpers_2 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
/**
 *  Class for the elements that have either the "data-bind" or "@bind" attribute
 */
class BindNode {
    constructor(data) {
        ({
            element: this.element,
            attribute: this.attribute,
            parent: this.parent,
            attribute: this.attribute,
        } = data);
        if (!(["string", "object", "$this"].includes(this.attribute.modifier))) {
            throw new TypeError(`The 'data-bind/@bind' attribute can be: 'string' (default) and 'object' if it binds 'style' or 'class'`);
        }
        ;
        /**
         *  Remove the '@bind' or the 'data-bind:' from the attribute
         * and get the 'bindable' attribute so to speak
         */
        const bindable = (this.attribute.attribute.match(_helpers_2.Patterns.bind.bindable) ?? [""])[0];
        if (!bindable)
            throw new EvalError("A 'data-bind/@bind' must be followed by a valid html attribute");
        //Set the 'bindAttr' property
        this.bindAttr = {
            name: bindable,
            exists: this.element.hasAttribute(bindable),
            value: this.element.getAttribute(bindable),
        };
        /**
         * Find all the '$this.data' placed in the attribute,
         * and return the real variable name
         */
        this.variables = [...new Set([
                ...[this.attribute.values.original.match(_helpers_2.Patterns.bind.$this)]
                    .map((m) => m[0])
                    .map((variable) => variable.replace("$this.data.", ""))
            ])];
        this.setData();
    }
    ;
    hasError(type, regexp) {
        if ((this.attribute.modifier == type) && (!regexp.test(this.attribute.values.original))) {
            throw new EvalError(`The value of the 'data-bind/@bind' attribute must be a ${type}`);
        }
        ;
    }
    parse(value) {
        this.hasError(this.attribute.modifier, _helpers_2.Patterns.bind[this.attribute.modifier]);
        if (this.attribute.modifier == "$this") {
            this.attribute.values.current = value.replace(`$this.data.${value.match(_helpers_2.Patterns.bind.variable)[0]}`, this.parent.data[value.match(_helpers_2.Patterns.bind.variable)[0]].value);
            console.log(this.attribute.values.current);
            return _helpers_1.Parser.parser(this.attribute.values.current);
        }
        ;
        if (this.bindAttr.name == "class") {
            const objectClass = value.replace(/\{|\}/g, "").split(",")
                .map((exp) => exp.split(":").map(e => e.trim()))
                .map((data) => {
                return [
                    _helpers_1.Parser.parser(data[0]),
                    _helpers_1.Parser.parser(((data[1].match(_helpers_2.Patterns.bind.$this))
                        ? data[1].replaceAll(_helpers_2.Patterns.bind.$this, _helpers_1.Parser.parentEscape(this.parent.data[data[1].match(_helpers_2.Patterns.bind.variable)[0]]))
                        : data[1]))
                ];
            });
            return objectClass.filter((e) => Boolean(e[1])).map((c) => c.shift()).join(" ");
        }
        ;
        this.variables.forEach((variable) => {
            let v = this.parent.data[variable].value;
            this.attribute.values.current = value.replaceAll(`$this.data.${variable}`, ((typeof v == "string") ? `'${v}'` : v));
        });
        return _helpers_1.Parser.parser(this.attribute.values.current);
    }
    /**
     * Bind the attribute
     */
    setData() {
        if (this.attribute.modifier == "$this") {
            this.element.setAttribute(this.bindAttr.name, this.parse(this.attribute.values.original));
            return;
        }
        if (this.attribute.modifier == "object") {
            (this.bindAttr.name == "style")
                && Object.assign(this.element.style, this.parse(this.attribute.values.original));
            (this.bindAttr.name == "class")
                && (this.element.className = `${this.parse(this.attribute.values.original)} ${(this.bindAttr.value ?? "")}`);
            return;
        }
        (this.bindAttr.name == "class")
            && (this.element.className = `${this.parse(this.attribute.values.original)} ${(this.bindAttr.value ?? "")}`);
        (this.bindAttr.name == "style")
            && (this.element.style.cssText = this.parse(this.attribute.values.original) + (this.bindAttr.value ?? ""));
    }
    ;
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
const ActionNode_1 = __webpack_require__(/*! ./ActionNode */ "./src/ts/actions/ActionNode.ts");
class EventNode extends ActionNode_1.ChevereAction {
    constructor(data) {
        super(data);
        this.attr?.some((attr) => this.ifAttrIsEmpty(attr));
        this.parseAttribute();
    }
    refreshAttribute() {
    }
    parseAttribute() {
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
const TextNode_1 = __webpack_require__(/*! ./TextNode */ "./src/ts/actions/TextNode.ts");
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class LoopNode {
    constructor(data) {
        ({ element: this.element, parent: this.parent } = data);
        const parsed = _helpers_1.Parser.parseDataForAttr({
            attr: this.element.getAttribute("data-for"),
            node: this.parent
        });
        ({ expressions: this.expressions, variable: this.variable } = parsed);
        if (typeof this.variable.value == "string")
            throw new EvalError(`Cannot set a 'for..in' loop in type ${typeof this.variable.value}`);
        this.loopElements();
    }
    ;
    loopElements() {
        let pos = Array.from(this.parent.element.children).indexOf(this.element);
        const template = document.createDocumentFragment(), element = this.element.content.querySelector("div:first-child");
        if (!element)
            throw new Error("The first child of your data-for element must be a div element");
        const thisChilds = [...element.querySelectorAll("*[data-text]")];
        const LoopText = thisChilds
            .filter((child) => child.getAttribute("data-text")?.startsWith(this.expressions[0]));
        LoopText.forEach(el => {
            el.setAttribute("data-text", `${this.variable.nombre}[]` + el.getAttribute("data-text")?.replace(this.expressions[0], ""));
        });
        for (let i in this.variable.value) {
            LoopText
                .forEach(element => {
                let attrVal = (+(i) == 0)
                    ? element.getAttribute("data-text")?.replace("[]", `[${i}]`)
                    : element.getAttribute("data-text")?.replace(/\[[0-9]+\]/, `[${i}]`);
                element.setAttribute("data-text", attrVal);
                this.parent.childs["data-text"].push(new TextNode_1.TextNode({
                    element: element,
                    parent: this.parent
                }));
            });
            template.appendChild(document.importNode(element, true));
        }
        ;
        this.parent.element.prepend(template);
        this.parent.canSet = true;
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
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
/**
 * The class for those inputs elements that have the `data-model` attribute
 *  @class
 */
class ModelNode {
    constructor(input) {
        ({ parent: this.parent, element: this.element } = input);
        //Search if the indicated variable of the data-model attribute exists in the scope
        this.variable = this.getVariable();
        this.assignText(this.parent.data[this.variable].value.toString());
        //Add the listener
        this.element.addEventListener("input", this.syncText.bind(this));
    }
    /**
     * If input is neither type 'radio' nor type 'checkbox', sets its value according to the variable
     * @param {any} value The value
     */
    assignText(value) {
        this.element.value = String(value);
    }
    syncText() {
        if (this.element.type == "checkbox") {
            const related = [...this.parent.element.querySelectorAll(`input[type="checkbox"][data-model="${this.element.getAttribute("data-model")}"]`)].filter((e) => e != this.element);
            if (related.length) {
                this.parent.data[this.variable].value = (related.some((e) => (e.checked == true) && (e != this.element)))
                    ? related.filter((e) => e.checked == true).map((e) => e.value)
                    : ((this.element.checked) ? this.element.value : "");
            }
            else {
                this.parent.data[this.variable].value = (this.element.value == "on")
                    ? String(this.element.checked)
                    : (this.element.checked) ? this.element.value : "";
            }
        }
        else {
            this.parent.data[this.variable].value = String(this.element.value);
        }
    }
    /**
     * Find the variable that was indicated in the 'data-model' attribute
     * @returns The variable to model
     */
    getVariable() {
        let attr = this.element.getAttribute("data-model");
        _helpers_1.Helper.checkForErrorInVariable(attr);
        let variable = Object.keys(this.parent.data).find((data) => data == attr);
        if (!variable)
            throw new ReferenceError(`There's no a '${attr}' variable in the data-attached scope`);
        return variable;
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
        this.ifAttrIsEmpty(this.attr);
        this.parseAttribute();
    }
    refreshAttribute() {
        this.attr.values.current = _helpers_1.Helper.parser({
            expr: this.attr.values.original,
            node: this.parent
        });
        this.element.hidden = !(this.attr.values.current);
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
    refreshAttribute() {
        this.attr.values.current = _helpers_1.Helper.parser({
            expr: this.attr?.values.original,
            node: this.parent,
        });
        this.element.textContent = this.attr.values.current;
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
        ({ name: this.name, data: this.data, methods: this.methods, init: this.init } = data);
    }
    initFunc(args) {
        let parsedArgs = (args)
            ? (args?.split(",").map((a) => _helpers_1.Helper.parser({ expr: a })))
            : [];
        this.init?.bind(this)(...parsedArgs || "");
    }
}
exports.ChevereData = ChevereData;


/***/ }),

/***/ "./src/ts/chevere/ChevereNode.ts":
/*!***************************************!*\
  !*** ./src/ts/chevere/ChevereNode.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ChevereNode_childs;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChevereNode = void 0;
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
const _actions_1 = __webpack_require__(/*! @actions */ "./src/ts/actions/index.ts");
class ChevereNode {
    constructor(data, el) {
        _ChevereNode_childs.set(this, {
            "event": [],
            "data-text": [],
            "data-model": [],
            "data-for": [],
            "data-show": [],
            "data-ref": [],
            "data-bind": [],
        });
        ({ name: this.name, methods: this.methods, } = data);
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
    setId() {
        return Math.random().toString(32).substr(2);
    }
    findRefs() {
        this.refs = [...this.element.querySelectorAll("*[data-ref]")]
            .reduce((props, el) => {
            if (!el.getAttribute("data-ref"))
                throw new SyntaxError("data-ref attribute cannot be empty");
            if (Object.keys({ ...props }).some((p) => p == el.getAttribute("data-ref")))
                throw new SyntaxError("It seems like there are repeated 'data-ref' values, check your 'data-ref' attributes");
            return {
                ...props,
                [el.getAttribute("data-ref")]: el,
            };
        }, {});
    }
    refreshChilds(attr, name) {
        __classPrivateFieldGet(this, _ChevereNode_childs, "f")[attr].filter((node) => (node.attr?.values.original.includes(name))).forEach((node) => {
            node.refreshAttribute();
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
                ["data-show", "data-text"].forEach((attr) => self.refreshChilds(attr, name));
                return Reflect.set(target, name, value, receiver);
            }
        });
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
        const childs = [
            _helpers_1.Helper.getElementsBy({
                attribute: "data-text",
                element: this.element,
                parent: this,
                selector: "*[data-text]",
                child: _actions_1.TextNode
            }),
            _helpers_1.Helper.getElementsBy({
                attribute: "data-show",
                element: this.element,
                parent: this,
                selector: "*[data-show]",
                child: _actions_1.ShowNode
            }),
        ];
        childs.forEach((child) => (child.nodes.length) && this.setChilds(child));
    }
}
exports.ChevereNode = ChevereNode;
_ChevereNode_childs = new WeakMap();


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


/***/ }),

/***/ "./src/ts/utils/Helper.ts":
/*!********************************!*\
  !*** ./src/ts/utils/Helper.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Helper = void 0;
exports.Helper = {
    getElementsBy(data) {
        const nodes = [...data.element.querySelectorAll(data.selector)];
        return {
            type: data.attribute,
            nodes: nodes.map((node) => new data.child({
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
        const regexp = new RegExp(`^(data-(${data.attribute}):|@(${data.attribute}))`), nodes = [...data.parent.element.querySelectorAll("*")]
            .filter((el) => [...el.attributes]
            .map((attr) => attr.name)
            .some((attr) => regexp.test(attr)));
        return {
            type: `data-${data.attribute}`,
            nodes: nodes.map((node) => new data.child({
                element: node,
                parent: data.parent,
                attr: nodes.map((node) => [...node.attributes]
                    .map((attr) => attr.name)
                    .filter(attr => regexp.test(attr))).reduce((attrs, attr) => [...attrs, ...attr], [])
                    .map((attr) => ({
                    attribute: attr,
                    values: {
                        original: node.getAttribute(attr)
                    }
                }))
            }))
        };
    }
};


/***/ }),

/***/ "./src/ts/utils/Magics.ts":
/*!********************************!*\
  !*** ./src/ts/utils/Magics.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Magics = void 0;
exports.Magics = {
    increment(variable) {
        variable++;
    },
    decrement(variable) {
        variable--;
    },
    toggle(variable) {
        variable = !variable;
    },
    set(variable, value) {
        variable = value;
    },
};


/***/ }),

/***/ "./src/ts/utils/Patterns.ts":
/*!**********************************!*\
  !*** ./src/ts/utils/Patterns.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Patterns = void 0;
const commonRegexp = {
    $this: "^this\.data\.[a-zA-Z]+$",
    words: "[a-zA-Z]+",
};
exports.Patterns = {
    global: {
        getName: new RegExp(`^${commonRegexp.words}`),
        $data: new RegExp(commonRegexp.$this, "g"),
        arguments: /(?<=\().*(?=\))/,
    },
    variables: {
        equality: /(<|>|!)?={1,3}/g,
        value: /(?<=\=).*(?=\;)/g,
    },
    attr: {
        isMagic: /^(\$magics)/,
        isMethod: /^this\.methods\.[a-zA-Z]+\(/,
        isLogicalExpression: /^this\.data\.[a-zA-Z]+(\s)?(<|>|!|=)?=/,
        isVariableAssign: /^this\.data\.[a-zA-Z]+(\s)?(\?\?||\+|\-|\*|\/|\%|\*\*|<<?|>>(>)?|\|(\|)?||\&(\&)?|\^)?=/,
        isString: /^(\`).*\1$/,
        isObject: /^\{.*\}$/,
        isBoolean: /^(\!)?this\.data\.[a-zA-Z]+$/,
        methodSyntax: /(^\w+$)|(^\w+\((.*)?\)$)/,
        bindAndOn: /^(data-(on|bind):|@(on|bind))/,
        bind: /^(data-)/
    },
    bind: {
        string: /^(\`).*\1$/,
        object: /^\{.*\}$/,
        $this: /\$this\.data\.[a-zA-Z]+/g,
        attr: /^(@|data-)bind(:)?/,
        bindable: /(?<=^(@|data-)bind(:)?)\w+/,
        modifier: /(?<=\.).*/,
        variable: /(?<=\$this\.data\.)\w+/,
    }
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
__exportStar(__webpack_require__(/*! ./Magics */ "./src/ts/utils/Magics.ts"), exports);
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
            .map((element) => ({ el: element, attr: element.getAttribute("data-attached") }));
        //Create a ChevereNode for each data-attached
        elements.forEach((el) => {
            const node = this.findItsData(el.attr, ...data);
            if (!_helpers_1.Patterns.attr.methodSyntax.test(el.attr))
                throw new SyntaxError(`There are syntax error in the 'data-attached' attribute, unrecognized expression "${el.attr}"`);
            if ((node.init == undefined) && (_helpers_1.Patterns.global.arguments.test(el.attr)))
                throw new EvalError(`The ${node.name} components don't have an init() function, therefore they do not accept any parameters`);
            if (node.init != undefined) {
                (el.attr.match(_helpers_1.Patterns.global.arguments)[0])
                    ? node.initFunc(el.attr.match(_helpers_1.Patterns.global.arguments).join(","))
                    : node.initFunc();
            }
            this.nodes.push(new _chevere_1.ChevereNode(node, el.el));
        });
    },
    data(data) {
        return new _chevere_1.ChevereData(data);
    },
};
window.Chevere = Chevere;

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvQWN0aW9uTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvQmluZE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL0V2ZW50Tm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvTG9vcE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL01vZGVsTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvU2hvd05vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL1RleHROb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvQ2hldmVyZURhdGEudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9jaGV2ZXJlL0NoZXZlcmVOb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvY2hldmVyZS9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL3V0aWxzL0hlbHBlci50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL3V0aWxzL01hZ2ljcy50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL3V0aWxzL1BhdHRlcm5zLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoZXZlcmVDaGlsZCwgQXR0cmlidXRlIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENoZXZlcmVOb2RlIH0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2hldmVyZUFjdGlvbjxBdHRyaWJ1dGVzPiB7XHJcbiAgICBlbGVtZW50IDogRWxlbWVudDtcclxuICAgIHBhcmVudCAgOiBDaGV2ZXJlTm9kZTtcclxuICAgIGF0dHI/ICAgOiBBdHRyaWJ1dGVzO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlQ2hpbGQ8QXR0cmlidXRlcz4pIHtcclxuICAgICAgICAoeyBcclxuICAgICAgICAgICAgZWxlbWVudCA6IHRoaXMuZWxlbWVudCwgXHJcbiAgICAgICAgICAgIHBhcmVudCAgOiB0aGlzLnBhcmVudCxcclxuICAgICAgICAgICAgYXR0ciAgICA6IHRoaXMuYXR0clxyXG4gICAgICAgIH0gPSBkYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgcGFyc2VBdHRyaWJ1dGUoKTogdm9pZDtcclxuICAgIGFic3RyYWN0IHJlZnJlc2hBdHRyaWJ1dGUoKTogdm9pZDtcclxuXHJcbiAgICBwcm90ZWN0ZWQgaWZBdHRySXNFbXB0eShhdHRyOiBBdHRyaWJ1dGUpOiB2b2lkIHtcclxuICAgICAgICBpZighYXR0ci52YWx1ZXMub3JpZ2luYWwpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVGhlICcke2F0dHIuYXR0cmlidXRlfScgYXR0cmlidXRlIGNhbm5vdCBiZSBlbXB0eWApXHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZSB9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBQYXJzZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuaW1wb3J0IHsgQmluZEF0dHIsIEJpbmRDaGlsZCwgRXhwQXR0cmlidXRlIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IFBhdHRlcm5zIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG4vKipcclxuICogIENsYXNzIGZvciB0aGUgZWxlbWVudHMgdGhhdCBoYXZlIGVpdGhlciB0aGUgXCJkYXRhLWJpbmRcIiBvciBcIkBiaW5kXCIgYXR0cmlidXRlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQmluZE5vZGUgaW1wbGVtZW50cyBCaW5kQ2hpbGQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgXCJkYXRhLWJpbmRcIi9cIkBiaW5kXCIgYXR0cmlidXRlIGRhdGFcclxuICAgICAqIEBwcm9wZXJ0eSB7RXhwQXR0cn1cclxuICAgICAqL1xyXG4gICAgYXR0cmlidXRlICAgOiBFeHBBdHRyaWJ1dGU7IFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmluZGFibGUgYXR0cmlidXRlIGRhdGFcclxuICAgICAqIEBwcm9wZXJ0eSB7QmluZEF0dHJ9XHJcbiAgICAgKi9cclxuICAgIGJpbmRBdHRyICAgIDogQmluZEF0dHI7XHJcblxyXG4gICAgZWxlbWVudCAgICAgOiBIVE1MRWxlbWVudDtcclxuICAgIHBhcmVudCAgICAgIDogQ2hldmVyZU5vZGU7XHJcbiAgICB2YXJpYWJsZXMgICA6IHN0cmluZ1tdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IEJpbmRDaGlsZCkge1xyXG4gICAgICAgICh7IFxyXG4gICAgICAgICAgICBlbGVtZW50ICAgICA6IHRoaXMuZWxlbWVudCwgXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZSAgIDogdGhpcy5hdHRyaWJ1dGUsIFxyXG4gICAgICAgICAgICBwYXJlbnQgICAgICA6IHRoaXMucGFyZW50LFxyXG4gICAgICAgICAgICBhdHRyaWJ1dGUgICA6IHRoaXMuYXR0cmlidXRlLFxyXG4gICAgICAgIH0gPSBkYXRhKTtcclxuXHJcbiAgICAgICAgaWYoIShbXCJzdHJpbmdcIiwgXCJvYmplY3RcIiwgXCIkdGhpc1wiXS5pbmNsdWRlcyh0aGlzLmF0dHJpYnV0ZS5tb2RpZmllcikpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXHJcbiAgICAgICAgICAgICAgICBgVGhlICdkYXRhLWJpbmQvQGJpbmQnIGF0dHJpYnV0ZSBjYW4gYmU6ICdzdHJpbmcnIChkZWZhdWx0KSBhbmQgJ29iamVjdCcgaWYgaXQgYmluZHMgJ3N0eWxlJyBvciAnY2xhc3MnYCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFJlbW92ZSB0aGUgJ0BiaW5kJyBvciB0aGUgJ2RhdGEtYmluZDonIGZyb20gdGhlIGF0dHJpYnV0ZSBcclxuICAgICAgICAgKiBhbmQgZ2V0IHRoZSAnYmluZGFibGUnIGF0dHJpYnV0ZSBzbyB0byBzcGVha1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGJpbmRhYmxlOiBzdHJpbmcgPSAodGhpcy5hdHRyaWJ1dGUuYXR0cmlidXRlLm1hdGNoKFBhdHRlcm5zLmJpbmQuYmluZGFibGUpID8/IFtcIlwiXSlbMF07XHJcblxyXG4gICAgICAgIGlmKCFiaW5kYWJsZSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEV2YWxFcnJvcihcIkEgJ2RhdGEtYmluZC9AYmluZCcgbXVzdCBiZSBmb2xsb3dlZCBieSBhIHZhbGlkIGh0bWwgYXR0cmlidXRlXCIpO1xyXG5cclxuICAgICAgICAvL1NldCB0aGUgJ2JpbmRBdHRyJyBwcm9wZXJ0eVxyXG4gICAgICAgIHRoaXMuYmluZEF0dHIgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IGJpbmRhYmxlLFxyXG4gICAgICAgICAgICBleGlzdHM6IHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoYmluZGFibGUpLFxyXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShiaW5kYWJsZSkhLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpbmQgYWxsIHRoZSAnJHRoaXMuZGF0YScgcGxhY2VkIGluIHRoZSBhdHRyaWJ1dGUsIFxyXG4gICAgICAgICAqIGFuZCByZXR1cm4gdGhlIHJlYWwgdmFyaWFibGUgbmFtZVxyXG4gICAgICAgICAqL1xyXG5cclxuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IFsuLi5uZXcgU2V0KFtcclxuICAgICAgICAgICAgLi4uW3RoaXMuYXR0cmlidXRlLnZhbHVlcy5vcmlnaW5hbC5tYXRjaChQYXR0ZXJucy5iaW5kLiR0aGlzKSFdXHJcbiAgICAgICAgICAgICAgICAubWFwKChtKSA9PiBtWzBdKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgodmFyaWFibGUpID0+IHZhcmlhYmxlLnJlcGxhY2UoXCIkdGhpcy5kYXRhLlwiLCBcIlwiKSlcclxuICAgICAgICBdKV07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0RGF0YSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBoYXNFcnJvcih0eXBlOiBzdHJpbmcsIHJlZ2V4cDogUmVnRXhwKSB7XHJcbiAgICAgICAgaWYoKHRoaXMuYXR0cmlidXRlLm1vZGlmaWVyID09IHR5cGUpICYmICghcmVnZXhwLnRlc3QodGhpcy5hdHRyaWJ1dGUudmFsdWVzLm9yaWdpbmFsKSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEV2YWxFcnJvcihgVGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1iaW5kL0BiaW5kJyBhdHRyaWJ1dGUgbXVzdCBiZSBhICR7dHlwZX1gKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHRoaXMuaGFzRXJyb3IodGhpcy5hdHRyaWJ1dGUubW9kaWZpZXIsIFBhdHRlcm5zLmJpbmRbdGhpcy5hdHRyaWJ1dGUubW9kaWZpZXJdKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5hdHRyaWJ1dGUubW9kaWZpZXIgPT0gXCIkdGhpc1wiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlLnZhbHVlcy5jdXJyZW50ID0gdmFsdWUucmVwbGFjZShcclxuICAgICAgICAgICAgICAgIGAkdGhpcy5kYXRhLiR7dmFsdWUubWF0Y2goUGF0dGVybnMuYmluZC52YXJpYWJsZSkhWzBdfWAsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5kYXRhW3ZhbHVlLm1hdGNoKFBhdHRlcm5zLmJpbmQudmFyaWFibGUpIVswXV0udmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5hdHRyaWJ1dGUudmFsdWVzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICByZXR1cm4gUGFyc2VyLnBhcnNlcih0aGlzLmF0dHJpYnV0ZS52YWx1ZXMuY3VycmVudCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5iaW5kQXR0ci5uYW1lID09IFwiY2xhc3NcIikge1xyXG4gICAgICAgICAgICBjb25zdCBvYmplY3RDbGFzcyA9IHZhbHVlLnJlcGxhY2UoL1xce3xcXH0vZywgXCJcIikuc3BsaXQoXCIsXCIpXHJcbiAgICAgICAgICAgICAgICAubWFwKChleHApID0+IGV4cC5zcGxpdChcIjpcIikubWFwKGUgPT4gZS50cmltKCkpKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFBhcnNlci5wYXJzZXIoZGF0YVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFBhcnNlci5wYXJzZXIoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGRhdGFbMV0ubWF0Y2goUGF0dGVybnMuYmluZC4kdGhpcykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBkYXRhWzFdLnJlcGxhY2VBbGwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBhdHRlcm5zLmJpbmQuJHRoaXMsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQYXJzZXIucGFyZW50RXNjYXBlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVtkYXRhWzFdLm1hdGNoKFBhdHRlcm5zLmJpbmQudmFyaWFibGUpIVswXV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBkYXRhWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICBdfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0Q2xhc3MuZmlsdGVyKChlKSA9PiBCb29sZWFuKGVbMV0pKS5tYXAoKGMpID0+IGMuc2hpZnQoKSkuam9pbihcIiBcIik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy52YXJpYWJsZXMuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IHYgPSB0aGlzLnBhcmVudC5kYXRhW3ZhcmlhYmxlXS52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlLnZhbHVlcy5jdXJyZW50ID0gdmFsdWUucmVwbGFjZUFsbChcclxuICAgICAgICAgICAgICAgIGAkdGhpcy5kYXRhLiR7dmFyaWFibGV9YCwgXHJcbiAgICAgICAgICAgICAgICAoKHR5cGVvZiB2ID09IFwic3RyaW5nXCIpID8gYCcke3Z9J2AgOiB2KVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gUGFyc2VyLnBhcnNlcih0aGlzLmF0dHJpYnV0ZS52YWx1ZXMuY3VycmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kIHRoZSBhdHRyaWJ1dGVcclxuICAgICAqL1xyXG4gICAgc2V0RGF0YSgpOiB2b2lkIHtcclxuICAgICAgICBpZih0aGlzLmF0dHJpYnV0ZS5tb2RpZmllciA9PSBcIiR0aGlzXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLmJpbmRBdHRyLm5hbWUsIHRoaXMucGFyc2UodGhpcy5hdHRyaWJ1dGUudmFsdWVzLm9yaWdpbmFsKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMuYXR0cmlidXRlLm1vZGlmaWVyID09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgKHRoaXMuYmluZEF0dHIubmFtZSA9PSBcInN0eWxlXCIpIFxyXG4gICAgICAgICAgICAgICAgJiYgT2JqZWN0LmFzc2lnbih0aGlzLmVsZW1lbnQuc3R5bGUsIHRoaXMucGFyc2UodGhpcy5hdHRyaWJ1dGUudmFsdWVzLm9yaWdpbmFsKSk7XHJcblxyXG4gICAgICAgICAgICAodGhpcy5iaW5kQXR0ci5uYW1lID09IFwiY2xhc3NcIilcclxuICAgICAgICAgICAgICAgICYmICh0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gYCR7dGhpcy5wYXJzZSh0aGlzLmF0dHJpYnV0ZS52YWx1ZXMub3JpZ2luYWwpfSAkeyh0aGlzLmJpbmRBdHRyLnZhbHVlID8/IFwiXCIpfWApXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgICh0aGlzLmJpbmRBdHRyLm5hbWUgPT0gXCJjbGFzc1wiKVxyXG4gICAgICAgICAgICAmJiAodGhpcy5lbGVtZW50LmNsYXNzTmFtZSA9IGAke3RoaXMucGFyc2UodGhpcy5hdHRyaWJ1dGUudmFsdWVzLm9yaWdpbmFsKX0gJHsodGhpcy5iaW5kQXR0ci52YWx1ZSA/PyBcIlwiKX1gKTtcclxuXHJcbiAgICAgICAgKHRoaXMuYmluZEF0dHIubmFtZSA9PSBcInN0eWxlXCIpIFxyXG4gICAgICAgICAgICAmJiAodGhpcy5lbGVtZW50LnN0eWxlLmNzc1RleHQgPSB0aGlzLnBhcnNlKHRoaXMuYXR0cmlidXRlLnZhbHVlcy5vcmlnaW5hbCkgKyAodGhpcy5iaW5kQXR0ci52YWx1ZSA/PyBcIlwiKSk7XHJcbiAgICB9O1xyXG59IiwiaW1wb3J0IHsgQXR0cmlidXRlLCBDaGV2ZXJlQ2hpbGQgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgQ2hldmVyZUFjdGlvbiB9IGZyb20gXCIuL0FjdGlvbk5vZGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudE5vZGUgZXh0ZW5kcyBDaGV2ZXJlQWN0aW9uPEF0dHJpYnV0ZVtdPiB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlQ2hpbGQ8QXR0cmlidXRlW10+KSB7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0cj8uc29tZSgoYXR0cikgPT4gdGhpcy5pZkF0dHJJc0VtcHR5KGF0dHIpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJzZUF0dHJpYnV0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZnJlc2hBdHRyaWJ1dGUoKTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlQXR0cmlidXRlKCk6IHZvaWQge1xyXG5cclxuICAgIH1cclxufSIsImltcG9ydCB7Q2hldmVyZU5vZGV9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBMb29wRWxlbWVudCwgUGFyc2VkRGF0YSwgUGFyc2VkRm9yIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IFRleHROb2RlIH0gZnJvbSBcIi4vVGV4dE5vZGVcIjtcclxuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTG9vcE5vZGUgaW1wbGVtZW50cyBMb29wRWxlbWVudCB7XHJcbiAgICBlbGVtZW50OiBIVE1MVGVtcGxhdGVFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIHZhcmlhYmxlOiBQYXJzZWREYXRhO1xyXG4gICAgZXhwcmVzc2lvbnM/OiBzdHJpbmdbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBMb29wRWxlbWVudCkge1xyXG4gICAgICAgICh7IGVsZW1lbnQ6IHRoaXMuZWxlbWVudCwgcGFyZW50OiB0aGlzLnBhcmVudCB9ID0gZGF0YSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcnNlZDogUGFyc2VkRm9yID0gUGFyc2VyLnBhcnNlRGF0YUZvckF0dHIoe1xyXG4gICAgICAgICAgICBhdHRyOiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1mb3JcIikhLCBcclxuICAgICAgICAgICAgbm9kZTogdGhpcy5wYXJlbnRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgKHsgZXhwcmVzc2lvbnM6IHRoaXMuZXhwcmVzc2lvbnMsIHZhcmlhYmxlOiB0aGlzLnZhcmlhYmxlIH0gPSBwYXJzZWQpO1xyXG5cclxuICAgICAgICBpZih0eXBlb2YgdGhpcy52YXJpYWJsZS52YWx1ZSA9PSBcInN0cmluZ1wiKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEV2YWxFcnJvcihgQ2Fubm90IHNldCBhICdmb3IuLmluJyBsb29wIGluIHR5cGUgJHt0eXBlb2YgdGhpcy52YXJpYWJsZS52YWx1ZX1gKTsgICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLmxvb3BFbGVtZW50cygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBsb29wRWxlbWVudHMoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHBvczogbnVtYmVyID0gQXJyYXkuZnJvbSh0aGlzLnBhcmVudC5lbGVtZW50LmNoaWxkcmVuKS5pbmRleE9mKHRoaXMuZWxlbWVudCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlOiBEb2N1bWVudEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxyXG4gICAgICAgICAgICBlbGVtZW50ID0gdGhpcy5lbGVtZW50LmNvbnRlbnQucXVlcnlTZWxlY3RvcihcImRpdjpmaXJzdC1jaGlsZFwiKTtcclxuXHJcbiAgICAgICAgaWYoIWVsZW1lbnQpIHRocm93IG5ldyBFcnJvcihcIlRoZSBmaXJzdCBjaGlsZCBvZiB5b3VyIGRhdGEtZm9yIGVsZW1lbnQgbXVzdCBiZSBhIGRpdiBlbGVtZW50XCIpO1xyXG5cclxuICAgICAgICBjb25zdCB0aGlzQ2hpbGRzID0gWy4uLmVsZW1lbnQhLnF1ZXJ5U2VsZWN0b3JBbGwoXCIqW2RhdGEtdGV4dF1cIildO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICBjb25zdCBMb29wVGV4dCA9IHRoaXNDaGlsZHNcclxuICAgICAgICAgICAgLmZpbHRlcigoY2hpbGQpID0+IGNoaWxkLmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8uc3RhcnRzV2l0aCh0aGlzLmV4cHJlc3Npb25zIVswXSkpO1xyXG5cclxuICAgICAgICBMb29wVGV4dC5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIsIFxyXG4gICAgICAgICAgICBgJHt0aGlzLnZhcmlhYmxlLm5vbWJyZX1bXWAgKyBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIik/LnJlcGxhY2UodGhpcy5leHByZXNzaW9ucyFbMF0sIFwiXCIpISlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSBpbiB0aGlzLnZhcmlhYmxlLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIExvb3BUZXh0XHJcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYXR0clZhbDogc3RyaW5nID0gKCsoaSkgPT0gMCkgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIik/LnJlcGxhY2UoXCJbXVwiICwgYFske2l9XWApISBcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBlbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8ucmVwbGFjZSgvXFxbWzAtOV0rXFxdLywgYFske2l9XWApIVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIsIGF0dHJWYWwpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5jaGlsZHMhW1wiZGF0YS10ZXh0XCJdLnB1c2gobmV3IFRleHROb2RlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLnBhcmVudFxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGVtcGxhdGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZShlbGVtZW50LCB0cnVlKSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBhcmVudC5lbGVtZW50LnByZXBlbmQodGVtcGxhdGUpO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudC5jYW5TZXQgPSB0cnVlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZU5vZGUgfSBmcm9tIFwiQGNoZXZlcmVcIjtcbmltcG9ydCB7IElucHV0TW9kZWwgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCJAaGVscGVyc1wiO1xuXG4vKipcbiAqIFRoZSBjbGFzcyBmb3IgdGhvc2UgaW5wdXRzIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgYGRhdGEtbW9kZWxgIGF0dHJpYnV0ZVxuICogIEBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgTW9kZWxOb2RlIGltcGxlbWVudHMgSW5wdXRNb2RlbCB7XG4gICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudDtcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xuICAgIHZhcmlhYmxlOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihpbnB1dDogSW5wdXRNb2RlbCkge1xuICAgICAgICAoeyBwYXJlbnQ6IHRoaXMucGFyZW50LCBlbGVtZW50OiB0aGlzLmVsZW1lbnQgfSA9IGlucHV0KTtcblxuICAgICAgICAvL1NlYXJjaCBpZiB0aGUgaW5kaWNhdGVkIHZhcmlhYmxlIG9mIHRoZSBkYXRhLW1vZGVsIGF0dHJpYnV0ZSBleGlzdHMgaW4gdGhlIHNjb3BlXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmdldFZhcmlhYmxlKCk7XG5cbiAgICAgICAgdGhpcy5hc3NpZ25UZXh0KHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUudG9TdHJpbmcoKSk7XG5cbiAgICAgICAgLy9BZGQgdGhlIGxpc3RlbmVyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGhpcy5zeW5jVGV4dC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiBpbnB1dCBpcyBuZWl0aGVyIHR5cGUgJ3JhZGlvJyBub3IgdHlwZSAnY2hlY2tib3gnLCBzZXRzIGl0cyB2YWx1ZSBhY2NvcmRpbmcgdG8gdGhlIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIHthbnl9IHZhbHVlIFRoZSB2YWx1ZVxuICAgICAqL1xuICAgIGFzc2lnblRleHQodmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuICAgIH1cblxuICAgIHN5bmNUZXh0KCk6IHZvaWQge1xuICAgICAgICBpZih0aGlzLmVsZW1lbnQudHlwZSA9PSBcImNoZWNrYm94XCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0ZWQgPSBbLi4udGhpcy5wYXJlbnQuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgIGBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl1bZGF0YS1tb2RlbD1cIiR7dGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtbW9kZWxcIil9XCJdYFxuICAgICAgICAgICAgKV0uZmlsdGVyKChlKSA9PiBlICE9IHRoaXMuZWxlbWVudCkgYXMgSFRNTElucHV0RWxlbWVudFtdO1xuXG4gICAgICAgICAgICBpZihyZWxhdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUgPSAocmVsYXRlZC5zb21lKChlKSA9PiAoZS5jaGVja2VkID09IHRydWUpICYmIChlICE9IHRoaXMuZWxlbWVudCkpKVxuICAgICAgICAgICAgICAgICAgICA/IHJlbGF0ZWQuZmlsdGVyKChlKSA9PiBlLmNoZWNrZWQgPT0gdHJ1ZSkubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICA6ICgodGhpcy5lbGVtZW50LmNoZWNrZWQpID8gdGhpcy5lbGVtZW50LnZhbHVlIDogXCJcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUgPSAodGhpcy5lbGVtZW50LnZhbHVlID09IFwib25cIilcbiAgICAgICAgICAgICAgICAgICAgPyBTdHJpbmcodGhpcy5lbGVtZW50LmNoZWNrZWQpXG4gICAgICAgICAgICAgICAgICAgIDogKHRoaXMuZWxlbWVudC5jaGVja2VkKSA/IHRoaXMuZWxlbWVudC52YWx1ZSA6IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdLnZhbHVlID0gU3RyaW5nKHRoaXMuZWxlbWVudC52YWx1ZSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmQgdGhlIHZhcmlhYmxlIHRoYXQgd2FzIGluZGljYXRlZCBpbiB0aGUgJ2RhdGEtbW9kZWwnIGF0dHJpYnV0ZSBcbiAgICAgKiBAcmV0dXJucyBUaGUgdmFyaWFibGUgdG8gbW9kZWxcbiAgICAgKi9cbiAgICBnZXRWYXJpYWJsZSgpOiBzdHJpbmcge1xuICAgICAgICBsZXQgYXR0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLW1vZGVsXCIpITtcblxuICAgICAgICBIZWxwZXIuY2hlY2tGb3JFcnJvckluVmFyaWFibGUoYXR0cik7XG5cbiAgICAgICAgbGV0IHZhcmlhYmxlID0gT2JqZWN0LmtleXModGhpcy5wYXJlbnQuZGF0YSkuZmluZCgoZGF0YSkgPT4gZGF0YSA9PSBhdHRyKTtcblxuICAgICAgICBpZiAoIXZhcmlhYmxlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgIGBUaGVyZSdzIG5vIGEgJyR7YXR0cn0nIHZhcmlhYmxlIGluIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHZhcmlhYmxlO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBIZWxwZXIsIFBhdHRlcm5zIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcbmltcG9ydCB7IEF0dHJpYnV0ZSwgQ2hldmVyZUNoaWxkIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENoZXZlcmVBY3Rpb24gfSBmcm9tIFwiLi9BY3Rpb25Ob2RlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU2hvd05vZGUgZXh0ZW5kcyBDaGV2ZXJlQWN0aW9uPEF0dHJpYnV0ZT4ge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZUNoaWxkPEF0dHJpYnV0ZT4pIHtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5pZkF0dHJJc0VtcHR5KHRoaXMuYXR0ciEpO1xyXG4gICAgICAgIHRoaXMucGFyc2VBdHRyaWJ1dGUoKTtcclxuICAgIH1cclxuXHJcbiAgICByZWZyZXNoQXR0cmlidXRlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYXR0ciEudmFsdWVzLmN1cnJlbnQgPSBIZWxwZXIucGFyc2VyPEJvb2xlYW4+KHtcclxuICAgICAgICAgICAgZXhwcjogdGhpcy5hdHRyIS52YWx1ZXMub3JpZ2luYWwsXHJcbiAgICAgICAgICAgIG5vZGU6IHRoaXMucGFyZW50XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICh0aGlzLmVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpLmhpZGRlbiA9ICEodGhpcy5hdHRyIS52YWx1ZXMuY3VycmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VBdHRyaWJ1dGUoKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoKCFQYXR0ZXJucy5hdHRyLmlzQm9vbGVhbi50ZXN0KHRoaXMuYXR0ciEudmFsdWVzLm9yaWdpbmFsKSkgXHJcbiAgICAgICAgICAgICYmICghUGF0dGVybnMuYXR0ci5pc0xvZ2ljYWxFeHByZXNzaW9uLnRlc3QodGhpcy5hdHRyIS52YWx1ZXMub3JpZ2luYWwpKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcImRhdGEtc2hvdyBhdHRyaWJ1dGUgb25seSBhY2NlcHQgYm9vbGVhbnNcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGUoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59OyIsIlxyXG5pbXBvcnQgeyBBdHRyaWJ1dGUsIENoZXZlcmVDaGlsZCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBDaGV2ZXJlQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uTm9kZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIsIFBhdHRlcm5zIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGV4dE5vZGUgZXh0ZW5kcyBDaGV2ZXJlQWN0aW9uPEF0dHJpYnV0ZT4geyBcclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVDaGlsZDxBdHRyaWJ1dGU+KSB7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuaWZBdHRySXNFbXB0eSh0aGlzLmF0dHIhKTtcclxuICAgICAgICB0aGlzLnBhcnNlQXR0cmlidXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVmcmVzaEF0dHJpYnV0ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmF0dHIhLnZhbHVlcy5jdXJyZW50ID0gSGVscGVyLnBhcnNlcjxTdHJpbmc+KHtcclxuICAgICAgICAgICAgZXhwcjogdGhpcy5hdHRyPy52YWx1ZXMub3JpZ2luYWwhLFxyXG4gICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudCxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5hdHRyIS52YWx1ZXMuY3VycmVudDtcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZUF0dHJpYnV0ZSgpOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZigoUGF0dGVybnMuYXR0ci5pc09iamVjdC50ZXN0KHRoaXMuYXR0cj8udmFsdWVzLm9yaWdpbmFsISkpIFxyXG4gICAgICAgICAgICB8fCAoUGF0dGVybnMuYXR0ci5pc01ldGhvZC50ZXN0KHRoaXMuYXR0cj8udmFsdWVzLm9yaWdpbmFsISkpKSBcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIlRoZSAnZGF0YS10ZXh0JyBhdHRyaWJ1dGUgb25seSBhY2NlcHQgc3RyaW5ncyBjb25jYXRlbmF0aW9uLCBhbmQgYSB2YXJpYWJsZSBhcyByZWZlcmVuY2VcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGUoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgKiBmcm9tIFwiLi9FdmVudE5vZGVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vTG9vcE5vZGVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vTW9kZWxOb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL1RleHROb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL1Nob3dOb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0JpbmROb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0FjdGlvbk5vZGVcIjsiLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZURhdGEsIERhdGEsIGluaXRGdW5jIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5cclxuLyoqXHJcbiAqICBUaGUgY2xhc3MgdGhhdCB1c2VycyBjcmVhdGUgdGhlaXIgY29tcG9uZW50c1xyXG4gKiAgQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2hldmVyZURhdGEgaW1wbGVtZW50cyBDaGV2ZXJlTm9kZURhdGEge1xyXG4gICAgcmVhZG9ubHkgbmFtZSAgIDogc3RyaW5nO1xyXG4gICAgZGF0YSAgICAgICAgICAgIDogRGF0YTxhbnk+O1xyXG4gICAgbWV0aG9kcz8gICAgICAgIDogRGF0YTxGdW5jdGlvbj47XHJcbiAgICBpbml0ICAgICAgICAgICAgOiBpbml0RnVuYztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlTm9kZURhdGEpIHtcclxuICAgICAgICAoeyBuYW1lOiB0aGlzLm5hbWUsIGRhdGE6IHRoaXMuZGF0YSwgbWV0aG9kczogdGhpcy5tZXRob2RzLCBpbml0OiB0aGlzLmluaXQgfSA9IGRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRGdW5jKGFyZ3M/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcGFyc2VkQXJnczogYW55W10gPSAoYXJncylcclxuICAgICAgICAgICAgPyAoYXJncz8uc3BsaXQoXCIsXCIpLm1hcCgoYSkgPT4gSGVscGVyLnBhcnNlcih7IGV4cHI6IGEgfSkpKVxyXG4gICAgICAgICAgICA6IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQ/LmJpbmQodGhpcykoLi4ucGFyc2VkQXJncyB8fCBcIlwiKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IEF0dHJpYnV0ZSwgQXR0cmlidXRlcywgQ2hldmVyZUNoaWxkLCBDaGV2ZXJlRWxlbWVudCwgRGF0YSwgUmVsYXRpb24gfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgQ2hldmVyZURhdGEgfSBmcm9tIFwiLi9DaGV2ZXJlRGF0YVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuaW1wb3J0IHsgQ2hldmVyZUFjdGlvbiwgRXZlbnROb2RlLCBTaG93Tm9kZSwgVGV4dE5vZGUgfSBmcm9tIFwiQGFjdGlvbnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlTm9kZSBpbXBsZW1lbnRzIENoZXZlcmVFbGVtZW50IHtcclxuICAgIG5hbWUgICAgOiBzdHJpbmc7XHJcbiAgICBkYXRhICAgIDogRGF0YTxvYmplY3Q+O1xyXG4gICAgaWQgICAgICA6IHN0cmluZztcclxuICAgIG1ldGhvZHM/OiBEYXRhPEZ1bmN0aW9uPjtcclxuICAgIGVsZW1lbnQgOiBFbGVtZW50O1xyXG4gICAgcmVmcz8gICA6IERhdGE8SFRNTEVsZW1lbnQ+O1xyXG4gICAgI2NoaWxkcz8gOiBEYXRhPENoZXZlcmVDaGlsZDxBdHRyaWJ1dGVzPltdPiA9IHtcclxuICAgICAgICBcImV2ZW50XCIgICAgIDogW10sXHJcbiAgICAgICAgXCJkYXRhLXRleHRcIiA6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1tb2RlbFwiOiBbXSxcclxuICAgICAgICBcImRhdGEtZm9yXCIgIDogW10sXHJcbiAgICAgICAgXCJkYXRhLXNob3dcIiA6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1yZWZcIiAgOiBbXSxcclxuICAgICAgICBcImRhdGEtYmluZFwiIDogW10sXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVEYXRhLCBlbDogRWxlbWVudCkge1xyXG4gICAgICAgICh7IG5hbWU6IHRoaXMubmFtZSwgbWV0aG9kczogdGhpcy5tZXRob2RzLCB9ID0gZGF0YSlcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wYXJzZURhdGEoZGF0YS5kYXRhKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHRoZSBwYXJlbnQgYGRpdmAgYW5kIGdpdmUgaXQgYSB2YWx1ZSBmb3IgdGhlIGRhdGEtaWQgYXR0cmlidXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuc2V0SWQoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCB0aGlzLmlkKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIEdldCB0aGUgZXZlbnRzIGFuZCBhY3Rpb25zIG9mIHRoZSBjb21wb25lbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNoZWNrRm9yQWN0aW9uc0FuZENoaWxkcygpO1xyXG5cclxuICAgICAgICB0aGlzLmZpbmRSZWZzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzMikuc3Vic3RyKDIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpbmRSZWZzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVmcyA9IFsuLi50aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS1yZWZdXCIpXVxyXG4gICAgICAgICAgICAucmVkdWNlKChwcm9wcywgZWwpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKCFlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXJlZlwiKSlcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJkYXRhLXJlZiBhdHRyaWJ1dGUgY2Fubm90IGJlIGVtcHR5XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKHsuLi5wcm9wc30pLnNvbWUoKHApID0+IHAgPT0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1yZWZcIikhKSlcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJJdCBzZWVtcyBsaWtlIHRoZXJlIGFyZSByZXBlYXRlZCAnZGF0YS1yZWYnIHZhbHVlcywgY2hlY2sgeW91ciAnZGF0YS1yZWYnIGF0dHJpYnV0ZXNcIilcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnByb3BzLFxyXG4gICAgICAgICAgICAgICAgICAgIFtlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXJlZlwiKSFdOiBlbCxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwge30pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZnJlc2hDaGlsZHMoYXR0cjogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLiNjaGlsZHMhW2F0dHJdLmZpbHRlcihcclxuICAgICAgICAgICAgKG5vZGUpID0+ICgobm9kZSBhcyBDaGV2ZXJlQ2hpbGQ8QXR0cmlidXRlPikuYXR0cj8udmFsdWVzLm9yaWdpbmFsLmluY2x1ZGVzKG5hbWUpKVxyXG4gICAgICAgICkuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAobm9kZSBhcyBDaGV2ZXJlQWN0aW9uPEF0dHJpYnV0ZT4pLnJlZnJlc2hBdHRyaWJ1dGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgYWxsIHRoZSBkYXRhLCB0aGV5IG5lZWQgZ2V0dGVyIGFuZCBhIHNldHRlclxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIHByaW1pdGl2ZSBkYXRhXHJcbiAgICAgKi9cclxuICAgIHBhcnNlRGF0YShkYXRhOiBEYXRhPGFueT4pOiBEYXRhPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KGRhdGEsIHtcclxuICAgICAgICAgICAgZ2V0KHRhcmdldCwgbmFtZSwgcmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIG5hbWUsIHJlY2VpdmVyKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0KHRhcmdldCwgbmFtZSwgdmFsdWUsIHJlY2VpdmVyKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgW1wiZGF0YS1zaG93XCIsIFwiZGF0YS10ZXh0XCJdLmZvckVhY2goKGF0dHIpID0+IHNlbGYucmVmcmVzaENoaWxkcyhhdHRyLCAobmFtZSBhcyBzdHJpbmcpKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwgbmFtZSwgdmFsdWUsIHJlY2VpdmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNldENoaWxkcyhkYXRhOiBSZWxhdGlvbikge1xyXG4gICAgICAgIGRhdGEubm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiNjaGlsZHMhW2RhdGEudHlwZV0ucHVzaChub2RlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBhbGwgdGhlIGNoaWxkcmVucyB0aGF0IGhhdmUgYW4gYWN0aW9uIGFuZCBkYXRhXHJcbiAgICAgKi9cclxuICAgIGNoZWNrRm9yQWN0aW9uc0FuZENoaWxkcygpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcyAgPSBbXHJcbiAgICAgICAgICAgICAgICBIZWxwZXIuZ2V0RWxlbWVudHNCeSh7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlOiBcImRhdGEtdGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiKltkYXRhLXRleHRdXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQ6IFRleHROb2RlXHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgIEhlbHBlci5nZXRFbGVtZW50c0J5KHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGU6IFwiZGF0YS1zaG93XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCIqW2RhdGEtc2hvd11cIixcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZDogU2hvd05vZGVcclxuICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgY2hpbGRzLmZvckVhY2goKGNoaWxkKSA9PiAoY2hpbGQubm9kZXMubGVuZ3RoKSAmJiB0aGlzLnNldENoaWxkcyhjaGlsZCkpO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZURhdGFcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZU5vZGVcIjsiLCJpbXBvcnQgeyBGaW5kQ2hpbGRzLCBSZWxhdGlvbiwgUGFyc2UsIEF0dHJpYnV0ZSwgQ2hldmVyZUNoaWxkLCBEYXRhT24gfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBIZWxwZXIgPSB7XHJcbiAgICBnZXRFbGVtZW50c0J5KGRhdGE6IEZpbmRDaGlsZHM8QXR0cmlidXRlPik6IFJlbGF0aW9uIHtcclxuICAgICAgICBjb25zdCBub2RlcyA9IFsuLi5kYXRhLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChkYXRhLnNlbGVjdG9yKV07XHJcbiAgICBcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiBkYXRhLmF0dHJpYnV0ZSxcclxuICAgICAgICAgICAgbm9kZXM6IG5vZGVzLm1hcCgobm9kZSkgPT4gbmV3IGRhdGEuY2hpbGQoe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogbm9kZSxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogZGF0YS5wYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBhdHRyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlOiBkYXRhLmF0dHJpYnV0ZSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IG5vZGUuZ2V0QXR0cmlidXRlKGRhdGEuYXR0cmlidXRlKSFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgcGFyc2VyPFQ+KGRhdGE6IFBhcnNlKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihcclxuICAgICAgICAgICAgWy4uLihkYXRhLmFyZ3M/LmtleXMoKSB8fCBcIlwiKV0uam9pbihcIixcIiksIFxyXG4gICAgICAgICAgICBgcmV0dXJuICR7ZGF0YS5leHByfWBcclxuICAgICAgICApLmJpbmQoZGF0YS5ub2RlKSguLi5bLi4uKGRhdGEuYXJncz8udmFsdWVzKCkgfHwgXCJcIildKTtcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YU9uKGRhdGE6IERhdGFPbik6IFJlbGF0aW9uIHtcclxuICAgICAgICBjb25zdCByZWdleHAgPSBuZXcgUmVnRXhwKGBeKGRhdGEtKCR7ZGF0YS5hdHRyaWJ1dGV9KTp8QCgke2RhdGEuYXR0cmlidXRlfSkpYCksXHJcbiAgICAgICAgICAgIG5vZGVzID0gWy4uLmRhdGEucGFyZW50LmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipcIildXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGVsKSA9PiBbLi4uZWwuYXR0cmlidXRlc11cclxuICAgICAgICAgICAgICAgIC5tYXAoKGF0dHIpID0+IGF0dHIubmFtZSlcclxuICAgICAgICAgICAgICAgIC5zb21lKChhdHRyKSA9PiByZWdleHAudGVzdChhdHRyKSkpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiBgZGF0YS0ke2RhdGEuYXR0cmlidXRlfWAsXHJcbiAgICAgICAgICAgIG5vZGVzOiBub2Rlcy5tYXAoKG5vZGUpID0+IG5ldyBkYXRhLmNoaWxkKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGRhdGEucGFyZW50LFxyXG4gICAgICAgICAgICAgICAgYXR0cjogbm9kZXMubWFwKChub2RlKSA9PiBcclxuICAgICAgICAgICAgICAgICAgICBbLi4ubm9kZS5hdHRyaWJ1dGVzXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKChhdHRyKSA9PiBhdHRyLm5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoYXR0ciA9PiByZWdleHAudGVzdChhdHRyKSlcclxuICAgICAgICAgICAgICAgICkucmVkdWNlKChhdHRycyxhdHRyKSA9PiBbLi4uYXR0cnMsIC4uLmF0dHJdLCBbXSlcclxuICAgICAgICAgICAgICAgIC5tYXAoKGF0dHIpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlOiBhdHRyLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cikhXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkpIGFzIEF0dHJpYnV0ZVtdXHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTsiLCJpbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBNYWdpY3M6IEhlbHBlciA9IHtcclxuICAgIGluY3JlbWVudCh2YXJpYWJsZTogYW55KTogdm9pZCB7XHJcbiAgICAgICAgdmFyaWFibGUrKztcclxuICAgIH0sXHJcbiAgICBkZWNyZW1lbnQodmFyaWFibGU6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIHZhcmlhYmxlLS07XHJcbiAgICB9LFxyXG4gICAgdG9nZ2xlKHZhcmlhYmxlOiBhbnkpOiB2b2lkIHtcclxuICAgICAgICB2YXJpYWJsZSA9ICF2YXJpYWJsZTtcclxuICAgIH0sXHJcbiAgICBzZXQodmFyaWFibGU6IGFueSwgdmFsdWU6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIHZhcmlhYmxlID0gdmFsdWU7XHJcbiAgICB9LFxyXG59OyIsImltcG9ydCB7IFBhdHRlcm4gfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmNvbnN0IGNvbW1vblJlZ2V4cCA9IHtcclxuICAgICR0aGlzOiBcIl50aGlzXFwuZGF0YVxcLlthLXpBLVpdKyRcIixcclxuICAgIHdvcmRzOiBcIlthLXpBLVpdK1wiLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IFBhdHRlcm5zOiBQYXR0ZXJuID0ge1xyXG4gICAgZ2xvYmFsOiB7XHJcbiAgICAgICAgZ2V0TmFtZTogbmV3IFJlZ0V4cChgXiR7Y29tbW9uUmVnZXhwLndvcmRzfWApLFxyXG4gICAgICAgICRkYXRhOiBuZXcgUmVnRXhwKGNvbW1vblJlZ2V4cC4kdGhpcywgXCJnXCIpLFxyXG4gICAgICAgIGFyZ3VtZW50czogLyg/PD1cXCgpLiooPz1cXCkpLyxcclxuICAgIH0sXHJcbiAgICB2YXJpYWJsZXM6IHtcclxuICAgICAgICBlcXVhbGl0eTogLyg8fD58ISk/PXsxLDN9L2csXHJcbiAgICAgICAgdmFsdWU6IC8oPzw9XFw9KS4qKD89XFw7KS9nLFxyXG4gICAgfSxcclxuICAgIGF0dHI6IHtcclxuICAgICAgICBpc01hZ2ljOiAvXihcXCRtYWdpY3MpLyxcclxuICAgICAgICBpc01ldGhvZDogL150aGlzXFwubWV0aG9kc1xcLlthLXpBLVpdK1xcKC8sXHJcbiAgICAgICAgaXNMb2dpY2FsRXhwcmVzc2lvbjogL150aGlzXFwuZGF0YVxcLlthLXpBLVpdKyhcXHMpPyg8fD58IXw9KT89LyxcclxuICAgICAgICBpc1ZhcmlhYmxlQXNzaWduOiAvXnRoaXNcXC5kYXRhXFwuW2EtekEtWl0rKFxccyk/KFxcP1xcP3x8XFwrfFxcLXxcXCp8XFwvfFxcJXxcXCpcXCp8PDw/fD4+KD4pP3xcXHwoXFx8KT98fFxcJihcXCYpP3xcXF4pPz0vLFxyXG4gICAgICAgIGlzU3RyaW5nOiAvXihcXGApLipcXDEkLyxcclxuICAgICAgICBpc09iamVjdDogL15cXHsuKlxcfSQvLFxyXG4gICAgICAgIGlzQm9vbGVhbjogL14oXFwhKT90aGlzXFwuZGF0YVxcLlthLXpBLVpdKyQvLFxyXG4gICAgICAgIG1ldGhvZFN5bnRheDogLyheXFx3KyQpfCheXFx3K1xcKCguKik/XFwpJCkvLFxyXG4gICAgICAgIGJpbmRBbmRPbjogL14oZGF0YS0ob258YmluZCk6fEAob258YmluZCkpLyxcclxuICAgICAgICBiaW5kOiAvXihkYXRhLSkvXHJcbiAgICB9LFxyXG4gICAgYmluZDoge1xyXG4gICAgICAgIHN0cmluZzogL14oXFxgKS4qXFwxJC8sXHJcbiAgICAgICAgb2JqZWN0OiAvXlxcey4qXFx9JC8sXHJcbiAgICAgICAgJHRoaXM6IC9cXCR0aGlzXFwuZGF0YVxcLlthLXpBLVpdKy9nLFxyXG4gICAgICAgIGF0dHI6IC9eKEB8ZGF0YS0pYmluZCg6KT8vLFxyXG4gICAgICAgIGJpbmRhYmxlOiAvKD88PV4oQHxkYXRhLSliaW5kKDopPylcXHcrLyxcclxuICAgICAgICBtb2RpZmllcjogLyg/PD1cXC4pLiovLFxyXG4gICAgICAgIHZhcmlhYmxlOiAvKD88PVxcJHRoaXNcXC5kYXRhXFwuKVxcdysvLFxyXG4gICAgfVxyXG59OyIsImV4cG9ydCAqIGZyb20gXCIuL01hZ2ljc1wiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9IZWxwZXJcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUGF0dGVybnNcIjsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgQ2hldmVyZVdpbmRvdywgQ2hldmVyZU5vZGVEYXRhLCBDaGV2ZXJlRGF0YU5vZGUsIENoZXZlcmVOb2RlTGlzdCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xuaW1wb3J0IHsgQ2hldmVyZURhdGEsIENoZXZlcmVOb2RlIH0gZnJvbSBcIkBjaGV2ZXJlXCI7XG5pbXBvcnQgeyBQYXR0ZXJucyB9IGZyb20gXCJAaGVscGVyc1wiO1xuXG5jb25zdCBDaGV2ZXJlOiBDaGV2ZXJlV2luZG93ID0ge1xuICAgbm9kZXM6IFtdLFxuICAgLyoqXG4gICAgKiBGaW5kIGEgQ2hldmVyZURhdGEgYnkgdGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1hdHRhY2hlZCcgYXR0cmlidXRlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0clxuICAgICogQHBhcmFtIHtDaGV2ZXJlRGF0YVtdfSBkYXRhXG4gICAgKiBAcmV0dXJucyBUaGUgZGF0YSByZWFkeSBmb3IgaW5zdGFuY2UgYSBOb2RlTGlzdE9mPEVsZW1lbnQ+XG4gICAgKi9cbiAgIGZpbmRJdHNEYXRhKGF0dHI6IHN0cmluZywgLi4uZGF0YTogQ2hldmVyZURhdGFbXSk6IENoZXZlcmVEYXRhIHtcbiAgICAgICBsZXQgc2VhcmNoOiBDaGV2ZXJlRGF0YSB8IHVuZGVmaW5lZCA9IGRhdGEuZmluZCgoZCkgPT4gZC5uYW1lID09IGF0dHIudHJpbSgpLnJlcGxhY2UoL1xcKC4qLywgXCJcIikpO1xuXG4gICAgICAgIGlmKCFzZWFyY2gpIFxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGAnJHthdHRyfScgY291bGRuJ3QgYmUgZm91bmQgaW4gYW55IG9mIHlvdXIgZGVjbGFyZWQgY29tcG9uZW50c2ApO1xuXG4gICAgICAgcmV0dXJuIHNlYXJjaDtcbiAgIH0sXG4gICAvKipcbiAgICAqIFNlYXJjaCBmb3IgQ2hldmVyZSBOb2RlcyBhdCB0aGUgc2l0ZVxuICAgICogQHBhcmFtIGRhdGEgQWxsIHRoZSBDaGV2ZXJlIGNvbXBvbmVudHNcbiAgICAqL1xuICAgIHN0YXJ0KC4uLmRhdGE6IENoZXZlcmVEYXRhW10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHM6IENoZXZlcmVOb2RlTGlzdCA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2W2RhdGEtYXR0YWNoZWRdXCIpXVxuICAgICAgICAgICAgLm1hcCgoZWxlbWVudCkgPT4gKHsgZWw6IGVsZW1lbnQsIGF0dHI6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1hdHRhY2hlZFwiKSF9KSk7XG5cbiAgICAgICAvL0NyZWF0ZSBhIENoZXZlcmVOb2RlIGZvciBlYWNoIGRhdGEtYXR0YWNoZWRcbiAgICAgICBlbGVtZW50cy5mb3JFYWNoKChlbDogQ2hldmVyZURhdGFOb2RlKSA9PiB7XG4gICAgICAgICAgIGNvbnN0IG5vZGU6IENoZXZlcmVEYXRhID0gdGhpcy5maW5kSXRzRGF0YShlbC5hdHRyLCAuLi5kYXRhKTtcblxuICAgICAgICAgICAgaWYoIVBhdHRlcm5zLmF0dHIubWV0aG9kU3ludGF4LnRlc3QoZWwuYXR0cikpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBUaGVyZSBhcmUgc3ludGF4IGVycm9yIGluIHRoZSAnZGF0YS1hdHRhY2hlZCcgYXR0cmlidXRlLCB1bnJlY29nbml6ZWQgZXhwcmVzc2lvbiBcIiR7ZWwuYXR0cn1cImApO1xuXG4gICAgICAgICAgICBpZigobm9kZS5pbml0ID09IHVuZGVmaW5lZCkgJiYgKFBhdHRlcm5zLmdsb2JhbC5hcmd1bWVudHMudGVzdChlbC5hdHRyKSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEV2YWxFcnJvcihgVGhlICR7bm9kZS5uYW1lfSBjb21wb25lbnRzIGRvbid0IGhhdmUgYW4gaW5pdCgpIGZ1bmN0aW9uLCB0aGVyZWZvcmUgdGhleSBkbyBub3QgYWNjZXB0IGFueSBwYXJhbWV0ZXJzYClcblxuICAgICAgICAgICAgaWYobm9kZS5pbml0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIChlbC5hdHRyLm1hdGNoKFBhdHRlcm5zLmdsb2JhbC5hcmd1bWVudHMpIVswXSlcbiAgICAgICAgICAgICAgICAgICAgPyBub2RlLmluaXRGdW5jKGVsLmF0dHIubWF0Y2goUGF0dGVybnMuZ2xvYmFsLmFyZ3VtZW50cykhLmpvaW4oXCIsXCIpKVxuICAgICAgICAgICAgICAgICAgICA6IG5vZGUuaW5pdEZ1bmMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5ldyBDaGV2ZXJlTm9kZShub2RlLCBlbC5lbCkpO1xuICAgICAgIH0pO1xuICAgfSxcbiAgIGRhdGEoZGF0YTogQ2hldmVyZU5vZGVEYXRhKTogQ2hldmVyZURhdGEge1xuICAgICAgIHJldHVybiBuZXcgQ2hldmVyZURhdGEoZGF0YSk7XG4gICB9LFxufTtcblxud2luZG93LkNoZXZlcmUgPSBDaGV2ZXJlOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==