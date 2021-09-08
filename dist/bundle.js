/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
        if (!(["string", "object"].includes(this.attribute.modifier))) {
            throw new TypeError(`The 'data-bind/@bind' attribute only accept two modifiers: 'string' (default) and 'object'`);
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
                ...[...this.attribute.values.original.matchAll(_helpers_2.Patterns.bind.$this)]
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
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class EventNode {
    constructor(data) {
        ({
            element: this.element,
            event: this.event,
            attrVal: this.attrVal,
            parent: this.parent
        } = data);
        //Give it an ID for the element
        this.element.setAttribute("data-id", _helpers_1.Helper.setDataId(10));
        //Search method and check if it has arguments
        this.method = this.getMethod();
        if (this.method.typeOfMethod == "magic") {
            this.element.addEventListener(this.event, this.method.function.original.bind(this, ...this.method.args.values()));
        }
        /*If everything is ok, then set the Event
        this.parent?.setEvent({
            elem: this.element,
            action: this.method!,
            type: this.event,
            args: this.args
        });*/
    }
    getMethod() {
        let name = this.searchMethodName(), func = this.searchMethod(name);
        return {
            typeOfMethod: func.typeOfMethod,
            name,
            function: {
                original: func.method,
            },
            args: this.searchArguments(func),
        };
    }
    searchMethodName() {
        let methodName = this.attrVal.match(_helpers_1.Patterns.attr.methodName)[0];
        if (!methodName)
            throw new Error(`Invalid method name at one of your "${this.parent.name}"" components`);
        return methodName;
    }
    ;
    searchArguments(func) {
        let originalArgs = func.method.toString().trim().match(_helpers_1.Patterns.attr.methodArgs), htmlArgs = this.attrVal.trim().match(_helpers_1.Patterns.attr.methodArgs);
        if ((!originalArgs) && (!htmlArgs))
            return;
        htmlArgs = _helpers_1.Parser.parseArgs(htmlArgs[0].split(","), this.parent, func.typeOfMethod);
        return new Map([...originalArgs[0].split(",").map((v, i) => [v, htmlArgs[i]])]);
    }
    searchMethod(name) {
        let typeOfMethod = _helpers_1.Patterns.attr.isMethod.test(this.attrVal.trim())
            ? "method"
            : (_helpers_1.Patterns.attr.isMagic.test(this.attrVal.trim()) ? "magic" : "");
        if (!typeOfMethod)
            throw new Error(`The value of the attribute contains invalid expressions`);
        let method = ((typeOfMethod == "magic") ? _helpers_1.Magics : this.parent.methods)[name];
        if (!method)
            throw new ReferenceError(`There's no a method named '${name}' in the ${(typeOfMethod == "magic") ? "Magics" : `${this.parent.name} component`}`);
        return {
            method,
            typeOfMethod
        };
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
class ShowNode {
    constructor(data) {
        ({ element: this.element, parent: this.parent } = data);
        let parsedAttr = _helpers_1.Parser.parsedDataShowAttr({
            attr: this.element.getAttribute("data-show"),
            node: this.parent
        });
        ({ value: this.value, variable: this.variable } = parsedAttr);
        this.toggleHidden();
    }
    ;
    toggleHidden() {
        this.element.hidden = !(_helpers_1.Parser.parser(`
            ${(typeof this.variable.value == "string")
            ? `"${this.variable.value}"`
            : this.variable.value} ${this.value}`));
    }
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
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class TextNode {
    constructor(data) {
        ({ element: this.element, parent: this.parent } = data);
        this.element.setAttribute("data-id", _helpers_1.Helper.setDataId(10));
        this.variable = this.element.getAttribute("data-text");
    }
    set value(value) {
        this.element.textContent = this._value = value.toString();
    }
    set variable(attr) {
        _helpers_1.Helper.checkForErrorInVariable(attr);
        const data = _helpers_1.Parser.parseDataTextAttr({
            attr: attr,
            node: this.parent
        });
        ({ variable: this._variable, value: this.value } = data);
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
        ({ name: this.name, data: this.data, init: this.init, methods: this.methods } = data);
    }
    /**
     * Parse the arguments of th init() method
     * @param {string[]} htmlArgs The arguments of de data-attached attribute
     * @param {string[]} initArgs The arguments defined in the init() method
     */
    async parseArguments(htmlArgs, methodArgs) {
        //Get a valid value for the argument, for example, check for strings with unclosed quotes
        let final = _helpers_1.Helper.getRealValuesInArguments({
            args: htmlArgs,
            name: this.name,
            method: "init()"
        });
        //Create the argument object
        let argsObj = {};
        for (let i in methodArgs)
            argsObj[methodArgs[i]] = final[i];
        //...and pass it to the unparsed init function
        return await this.parseInit({
            init: this.init,
            args: argsObj,
        });
    }
    /**
     * Parse the init function and executes it
     * @param {Function} init The unparsed init function
     * @param {object} args The parsed custom arguments
     * @returns the init function
     */
    async parseInit(init) {
        let initFunc = _helpers_1.Helper.contentOfFunction(init.init);
        //Finds the real arguments and no expressions with the same name
        if (init.args) {
            Object.keys(init.args).forEach((arg) => {
                let str = `(?<=(=\\s)|(\\()|(=))(${arg})`;
                initFunc = initFunc.replace(new RegExp(str, "g"), `$args.${arg}`);
            });
        }
        //Create the new parsed init function
        let newFunc = new Function("{$this = undefined, $args = undefined}", `return async() => { ${initFunc} };`);
        //Return the new init function and executes it
        return await newFunc({
            $this: this,
            $args: init.args,
        })();
    }
}
exports.ChevereData = ChevereData;


/***/ }),

/***/ "./src/ts/chevere/ChevereNode.ts":
/*!***************************************!*\
  !*** ./src/ts/chevere/ChevereNode.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChevereNode = void 0;
const _actions_1 = __webpack_require__(/*! @actions */ "./src/ts/actions/index.ts");
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class ChevereNode {
    constructor(data, el) {
        this.args = {};
        this.childs = {
            "event": [],
            "data-text": [],
            "data-model": [],
            "data-for": [],
            "data-show": [],
            "data-ref": [],
            "data-bind": [],
        };
        this.refs = {};
        this.canSet = false;
        this.name = data.name;
        this.data = this.parseData(data.data);
        /**
         *  Parse all $this, $self, $data...
         */
        this.methods = this.parseMethods(data.methods);
        /**
         * Get the parent `div` and give it a value for the data-id attribute
         */
        this.element = el;
        this.id = _helpers_1.Helper.setDataId(10);
        this.element.setAttribute("data-id", this.id);
        /**
         *  Get the events and actions of the component
         */
        this.checkForActionsAndChilds();
    }
    /**
     * Parse all the data, they need getter and a setter
     * @param data The primitive data
     */
    parseData(data) {
        let obj = [];
        Object.entries(data).forEach(([key, value]) => {
            obj.push([key, this.parsedObj(key, value)]);
        });
        return Object.fromEntries(obj);
    }
    /**
     * Parsed the methods described in the method property of the data
     * @param {MethodType} methods
     * @returns The methods parsed
     */
    parseMethods(methods) {
        if (methods == undefined)
            return;
        Object.keys(methods).forEach((method) => {
            //If the method was already parsed
            let wasParsed = methods[method]
                .toString()
                .search("anonymous");
            if (wasParsed == -1) {
                let args = _helpers_1.Helper.methodArguments(methods[method]);
                if (args)
                    this.args[method] = args;
                let parsed = methods[method]
                    .toString()
                    .replace(/^.*|[\}]$/g, "");
                Object.keys(this.data).forEach((variable) => {
                    parsed = parsed.replaceAll(`$this.data.${variable}`, `$this.data.${variable}.value`);
                });
                if (this.args[method] != undefined) {
                    this.args[method]?.forEach((arg) => {
                        let str = `(?<=(=\\s)|(\\()|(=))(${arg})`;
                        parsed = parsed.replace(new RegExp(str, "g"), `$args.${arg}`);
                    });
                }
                ;
                let newFunc = new Function("{$this = undefined, $event = undefined, $args = undefined}", parsed);
                methods[method] = newFunc;
            }
        });
        return methods;
    }
    /**
     * Find all the childrens that have an action and data
     */
    checkForActionsAndChilds() {
        /**
         * All the elements supported with Cheverex
         * @const
         */
        const loopNodes = _helpers_1.ChildsHelper.getElementsByDataFor(this.element);
        //For nodes
        if (loopNodes.length) {
            loopNodes.forEach((loop) => {
                this.childs["data-for"].push(new _actions_1.LoopNode({
                    element: loop,
                    parent: this
                }));
            });
        }
        else
            this.canSet = true;
        if (this.canSet) {
            const eventNodes = _helpers_1.ChildsHelper.getElementsByDataOnAttr(this.element), textNodes = _helpers_1.ChildsHelper.getElementsByDataTextAttr(this.element), modelNodes = _helpers_1.ChildsHelper.getElementsByDataModelAttr(this.element), showNodes = _helpers_1.ChildsHelper.getElementsByDataShow(this.element), bindNodes = _helpers_1.ChildsHelper.getElementsByDataBind(this.element, this);
            //EventNodes
            if (eventNodes) {
                eventNodes.forEach((node) => {
                    this.childs["event"].push(new _actions_1.EventNode({
                        element: node[0],
                        parent: this,
                        event: node[1],
                        attrVal: node[2],
                    }));
                });
            }
            ;
            //Data-text
            if (textNodes.length) {
                textNodes.forEach((text) => {
                    this.childs["data-text"].push(new _actions_1.TextNode({
                        element: text,
                        parent: this,
                    }));
                });
            }
            ;
            //Data-show
            if (showNodes.length) {
                showNodes.forEach((show) => {
                    this.childs["data-show"].push(new _actions_1.ShowNode({
                        element: show,
                        parent: this,
                    }));
                });
            }
            ;
            //Text Inputs with model
            if (modelNodes.length) {
                modelNodes.forEach((input) => {
                    this.childs["data-model"].push(new _actions_1.ModelNode({
                        element: input,
                        parent: this,
                    }));
                });
            }
            ;
            if (bindNodes.length) {
                bindNodes.forEach((node) => this.childs["data-bind"].push(new _actions_1.BindNode(node)));
            }
            ;
            this.refs = Object.fromEntries([..._helpers_1.ChildsHelper.getElementsByDataRef(this.element)]
                .map((ref) => [ref.getAttribute("data-ref"), ref]));
        }
        ;
    }
    /**
     * The parsed data, with the getter and setter
     * @param {string} name The name of the property of the unparsed data object
     * @param {any} value the value of that property
     * @returns The parsed data
     */
    parsedObj(name, value) {
        const self = this;
        return {
            nombre: name,
            _value: value,
            set value(value) {
                this._value = value;
                //Sync text with all inputs that have this variable as model in their 'data-model' attribute
                self.childs["data-text"].filter((text) => (text._variable.nombre == this.nombre) && !(["radio", "checkbox"].includes(text.element.type))).forEach((text) => {
                    text.value = value;
                });
                self.childs["data-bind"].filter((node) => node.variables.includes(this.nombre))
                    .forEach((node) => node.setData());
                self.childs["data-model"].filter((input) => input.variable == this.nombre)
                    .forEach((input) => input.assignText(value));
                self.childs["data-show"].filter((node) => node.variable.nombre == this.nombre)
                    .forEach((show) => show.toggleHidden());
            },
            get value() {
                return this._value;
            },
        };
    }
    /**
     * Set a custom event in the scope of the data-attached
     * @param event The event type, the element, and the function without executing
     */
    setEvent(event) {
        event.elem.addEventListener(event.type, (e) => {
            event.action({
                $this: this,
                $args: event.args,
                $magics: _helpers_1.Magics,
                $event: e
            });
        });
    }
}
exports.ChevereNode = ChevereNode;


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

/***/ "./src/ts/utils/ChildsHelper.ts":
/*!**************************************!*\
  !*** ./src/ts/utils/ChildsHelper.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChildsHelper = void 0;
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
exports.ChildsHelper = {
    getElementsByDataOnAttr(element) {
        let nodes = [];
        //Get all childs of the element
        const childs = element.querySelectorAll("*");
        //Push to `nodes` all elements with the 'data-on' or '@on' attribute
        for (let child of childs) {
            for (let attr of child.attributes) {
                if (attr.name.startsWith("data-on"))
                    nodes.push([child, attr.name.split(":")[1], attr.nodeValue]);
                else if (attr.name.startsWith("@on"))
                    nodes.push([child, attr.name.replace("@on", "").toLowerCase(), attr.nodeValue]);
            }
        }
        return (nodes.length == 0) ? undefined : nodes;
    },
    getElementsByDataBind(element, node) {
        return [...element.querySelectorAll("*")].filter((e) => [...e.attributes].some((attr) => _helpers_1.Patterns.bind.attr.test(attr.name))).map((element) => {
            let attr = [...element.attributes].map((attr) => attr.name).find((attr) => _helpers_1.Patterns.bind.attr.test(attr));
            let modifier = _helpers_1.Patterns.bind.string.test(element.getAttribute(attr))
                ? "string"
                : _helpers_1.Patterns.bind.object.test(element.getAttribute(attr)) ? "object"
                    : "";
            return {
                element: element,
                parent: node,
                attribute: {
                    attribute: attr,
                    modifier: modifier,
                    values: {
                        original: element.getAttribute(attr),
                        current: element.getAttribute(attr),
                    }
                }
            };
        });
    },
    getElementsByDataTextAttr(element) {
        return element.querySelectorAll("*[data-text]");
    },
    getElementsByDataModelAttr(element) {
        return element.querySelectorAll("input[data-model], textarea[data-model], select[data-model]");
    },
    getElementsByDataFor(element) {
        return element.querySelectorAll("template[data-for]");
    },
    getElementsByDataShow(element) {
        return element.querySelectorAll("*[data-show]");
    },
    getElementsByDataRef(element) {
        return element.querySelectorAll("*[data-ref]");
    }
};


/***/ }),

/***/ "./src/ts/utils/Helper.ts":
/*!********************************!*\
  !*** ./src/ts/utils/Helper.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Helper = void 0;
/**
 * Helper class, it provide usefull methods to Chevere elements
 * @class
 */
exports.Helper = {
    isEmpty(obj) {
        return Object.keys(obj).length == 0;
    },
    setDataId(length) {
        let final = "";
        const rounded = (num) => ~~(Math.random() * num);
        const chars = {
            letters: "abcdefghijklmnopqrstuvwxyz",
            mayus: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            numbers: "0123456789",
        };
        for (let i = 0; i <= length; i++)
            final += chars[Object.keys(chars)[rounded(2)]][rounded(length)];
        return final;
    },
    checkForErrorInVariable(str) {
        if (/^[0-9]|\W/g.test(str))
            throw new SyntaxError("Variable name cannot start with a number or have spaces");
    },
    htmlArgsDataAttr(dataAttached) {
        if (!dataAttached.match(/\(.+\)/g))
            return;
        let onlyAttrs = dataAttached.trim().replace(/.*\(|\).*/g, "");
        return (onlyAttrs) ? onlyAttrs.split(",") : undefined;
    },
    methodArguments(method) {
        let onlyArgs = method.toString()
            .replace(/\{.*/gs, "")
            .replace(/.+\(|\).+/g, "");
        return (onlyArgs) ? onlyArgs.split(",") : undefined;
    },
    getRealValuesInArguments(data) {
        let final = [];
        try {
            final = data.args.map((arg) => new Function(`return ${arg}`)());
        }
        catch (error) {
            throw new Error(`${error}, check the values of your ${data.method}, at one of your '${data.name}' components`);
        }
        return final;
    },
    compareArguments(data) {
        let errorPre = `The ${data.method} function of the ${data.component}() component `;
        switch (true) {
            case ((!data.htmlArgs) && (!data.methodArgs)):
                {
                    return false;
                }
                ;
            case ((data.htmlArgs != undefined) && (!data.methodArgs)):
                {
                    throw new Error(errorPre + `doesn't receive any parameter`);
                }
                ;
            case ((!data.htmlArgs) && (data.methodArgs != undefined)):
                {
                    throw new Error(errorPre + `needs to receive ${data.methodArgs} parameters, 0 passed`);
                }
                ;
            case ((data.methodArgs?.length) != (data.htmlArgs?.length)):
                {
                    throw new Error(errorPre + `needs to receive  ${data.methodArgs?.length} parameters, 
                    ${data.htmlArgs?.length} passed`);
                }
                ;
            default: {
                return true;
            }
        }
    },
    contentOfFunction(func) {
        return func.toString()
            .replace(/.+\{|\}$/gs, "")
            .trim();
    },
    nameOfFunction(attr) {
        return attr.trim().replace(/\(.+/, "");
    },
};


/***/ }),

/***/ "./src/ts/utils/InlineParser.ts":
/*!**************************************!*\
  !*** ./src/ts/utils/InlineParser.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Parser = void 0;
const Patterns_1 = __webpack_require__(/*! ./Patterns */ "./src/ts/utils/Patterns.ts");
exports.Parser = {
    escape(str) {
        return str.replaceAll("$", "\\$").replaceAll(".", "\\.");
    },
    parentEscape(parent) {
        return (typeof parent.value == "string") ? `"${parent.value}"` : parent.value;
    },
    parseArgs(args, data, typeOfMethod) {
        try {
            args = args.map((v) => (!Patterns_1.Patterns.bind.$this.test(v))
                ? this.parser(v)
                : ((typeOfMethod != "magic")
                    ? this.parser(v.replaceAll(Patterns_1.Patterns.bind.$this, this.parentEscape(data.data[v.replace("$this.data.", "")])))
                    : data.data[v.replace("$this.data.", "")]));
        }
        catch (e) {
            throw e;
        }
        return args;
    },
    parser(expr) {
        return new Function(`return ${expr}`)();
    },
    parsedDataShowAttr(data) {
        let val = (Patterns_1.Patterns.vars.variableExpression.test(data.attr))
            ? data.attr.replace(Patterns_1.Patterns.vars.value, "").trim()
            : Object.entries(Patterns_1.Patterns.show).find(([, regexp]) => regexp.test(data.attr))[0];
        let parse = `${((Patterns_1.Patterns.vars.equality.exec(data.attr)) || ["=="])[0]} ${val}`;
        const varName = data.attr.match(/\w+/)[0], parentVar = data.node.data[varName];
        if (!parentVar)
            throw new ReferenceError(`A data with the '${varName}' couldn't be found in the '${data.node.name}'`);
        return {
            variable: parentVar,
            value: parse,
        };
    },
    parseDataTextAttr(data) {
        let type = Object.keys(Patterns_1.Patterns.text)
            .find((pattern) => Patterns_1.Patterns.text[pattern].test(data.attr));
        if (!type)
            throw new SyntaxError("The value of the 'data-text' attribute contains invalid expressions");
        const varName = Patterns_1.Patterns.text.justVariable.exec(data.attr)[0];
        let parsed = { variable: data.node.data[varName] };
        switch (type) {
            case "justVariable":
                {
                    parsed.value = parsed.variable.value;
                }
                break;
            case "singleObject":
                {
                    parsed.value = parsed.variable.value[data.attr.match(Patterns_1.Patterns.text.indexValue)[0]];
                }
                break;
            case "nestedObject":
                {
                    let separed = data.attr.split(/\[|\]|\.|\'/g).filter(w => w !== "").slice(1), length = separed.length;
                    function findNestedProp(variable, pos = 0) {
                        let obj = variable[separed[pos]];
                        return (pos == length - 1) ? obj : findNestedProp(obj, pos + 1);
                    }
                    ;
                    parsed.value = findNestedProp(parsed.variable.value);
                }
                break;
        }
        return parsed;
    },
    parseDataForAttr(data) {
        let parsedData = {};
        let expressions = data.attr.split(" ");
        if (expressions.length > 3)
            throw new SyntaxError("The value of the 'data-for' attribute contains invalid expressions");
        parsedData.expressions = expressions;
        let variable = Object.keys(data.node.data).find((variable) => variable == expressions[2]);
        if (!variable)
            throw new ReferenceError(`A variable with the name ${expressions[2]} couldn't be found in the data of your ${data.node.name}() component`);
        else
            parsedData.variable = data.node.data[variable];
        return parsedData;
    },
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
        variable.value++;
    },
    decrement(variable) {
        variable.value--;
    },
    toggle(variable) {
        variable.value = !variable.value;
    },
    set(variable, value) {
        variable.value = value;
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
exports.Patterns = {
    magics: {
        el: /\$el/,
        checkMagic: /^\$magics./,
    },
    vars: {
        variableExpression: /^[a-zA-Z]+(\s)?(<|>|!|=)?=/g,
        variableName: /^[a-zA-Z]+/,
        equality: /(<|>|!)?={1,3}/g,
        value: /^.*(<|>|=)/g,
    },
    text: {
        justVariable: /^[a-zA-Z]+$/,
        singleObject: /^[a-zA-Z]+((\.[a-zA-z]*)|(\[[0-9]{1,}\]))$/,
        nestedObject: /^[a-zA-Z]+((\.|\[)[a-zA-Z0-9]+(\.|\])?){1,}[a-zA-z]$/
    },
    show: {
        true: /^[a-zA-Z]+$/,
        false: /^\![a-zA-Z]+$/,
    },
    attr: {
        isMagic: /^(\$magics)/,
        isMethod: /^[a-zA-Z]+\(/,
        methodName: /(?=.)(\w+)(?=\()/,
        methodArgs: /(?<=\().*(?=\))/
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
__exportStar(__webpack_require__(/*! ./Helper */ "./src/ts/utils/Helper.ts"), exports);
__exportStar(__webpack_require__(/*! ./Magics */ "./src/ts/utils/Magics.ts"), exports);
__exportStar(__webpack_require__(/*! ./ChildsHelper */ "./src/ts/utils/ChildsHelper.ts"), exports);
__exportStar(__webpack_require__(/*! ./InlineParser */ "./src/ts/utils/InlineParser.ts"), exports);
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
    findItsData(attr, data) {
        let search = data.find((d) => d.name == attr.trim().replace(/\(.*\)/, ""));
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
            .map((element) => ({ elem: element, dataAttr: element.getAttribute("data-attached") }));
        //Create a ChevereNode for each data-attached
        elements.forEach((el) => {
            const node = this.findItsData(el.dataAttr, data);
            if ((node.init == undefined) && (_helpers_1.Helper.htmlArgsDataAttr(el.dataAttr) != undefined))
                throw new Error(`There's no init method defined in your '${node.name}' component`);
            //If the init method isn't undefined
            if (node.init != undefined) {
                //Check for arguments
                let args = {
                    initArgs: _helpers_1.Helper.methodArguments(node.init),
                    HTMLArgs: _helpers_1.Helper.htmlArgsDataAttr(el.dataAttr)
                };
                /**
                * Check the diff between the aruments at the HTML and those ones declared at
                * the init() method
                */
                let checkForInitArguments = _helpers_1.Helper.compareArguments({
                    component: node.name,
                    method: "init()",
                    htmlArgs: args.HTMLArgs,
                    methodArgs: args.initArgs
                });
                (async () => {
                    //If there's no errors, parse the arguments, and execute the init() method
                    return (checkForInitArguments)
                        ? await node.parseArguments(args.HTMLArgs, args.initArgs)
                        : await node.parseInit({ init: node.init });
                })();
            }
            ;
            this.nodes.push(new _chevere_1.ChevereNode(node, el.elem));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsRUFBRSxDQUFDO2FBQ1I7WUFBQSxDQUFDO1lBRUYsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBVyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxJQUFJLENBQUMsSUFBcUI7UUFDdEIsT0FBTyxJQUFJLHNCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNILENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9CaW5kTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvRXZlbnROb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9Mb29wTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvTW9kZWxOb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9TaG93Tm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvVGV4dE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL2luZGV4LnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvY2hldmVyZS9DaGV2ZXJlRGF0YS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvQ2hldmVyZU5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9jaGV2ZXJlL2luZGV4LnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvQ2hpbGRzSGVscGVyLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvSGVscGVyLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvSW5saW5lUGFyc2VyLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvTWFnaWNzLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvUGF0dGVybnMudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hldmVyZU5vZGUgfSBmcm9tIFwiQGNoZXZlcmVcIjtcclxuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcbmltcG9ydCB7IEJpbmRBdHRyLCBCaW5kQ2hpbGQsIEV4cEF0dHJpYnV0ZSB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBQYXR0ZXJucyB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5cclxuLyoqXHJcbiAqICBDbGFzcyBmb3IgdGhlIGVsZW1lbnRzIHRoYXQgaGF2ZSBlaXRoZXIgdGhlIFwiZGF0YS1iaW5kXCIgb3IgXCJAYmluZFwiIGF0dHJpYnV0ZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJpbmROb2RlIGltcGxlbWVudHMgQmluZENoaWxkIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIFwiZGF0YS1iaW5kXCIvXCJAYmluZFwiIGF0dHJpYnV0ZSBkYXRhXHJcbiAgICAgKiBAcHJvcGVydHkge0V4cEF0dHJ9XHJcbiAgICAgKi9cclxuICAgIGF0dHJpYnV0ZSAgIDogRXhwQXR0cmlidXRlOyBcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJpbmRhYmxlIGF0dHJpYnV0ZSBkYXRhXHJcbiAgICAgKiBAcHJvcGVydHkge0JpbmRBdHRyfVxyXG4gICAgICovXHJcbiAgICBiaW5kQXR0ciAgICA6IEJpbmRBdHRyO1xyXG5cclxuICAgIGVsZW1lbnQgICAgIDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwYXJlbnQgICAgICA6IENoZXZlcmVOb2RlO1xyXG4gICAgdmFyaWFibGVzICAgOiBzdHJpbmdbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBCaW5kQ2hpbGQpIHtcclxuICAgICAgICAoeyBcclxuICAgICAgICAgICAgZWxlbWVudCAgICAgOiB0aGlzLmVsZW1lbnQsIFxyXG4gICAgICAgICAgICBhdHRyaWJ1dGUgICA6IHRoaXMuYXR0cmlidXRlLCBcclxuICAgICAgICAgICAgcGFyZW50ICAgICAgOiB0aGlzLnBhcmVudCxcclxuICAgICAgICAgICAgYXR0cmlidXRlICAgOiB0aGlzLmF0dHJpYnV0ZSxcclxuICAgICAgICB9ID0gZGF0YSk7XHJcblxyXG4gICAgICAgIGlmKCEoW1wic3RyaW5nXCIsIFwib2JqZWN0XCJdLmluY2x1ZGVzKHRoaXMuYXR0cmlidXRlLm1vZGlmaWVyKSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcclxuICAgICAgICAgICAgICAgIGBUaGUgJ2RhdGEtYmluZC9AYmluZCcgYXR0cmlidXRlIG9ubHkgYWNjZXB0IHR3byBtb2RpZmllcnM6ICdzdHJpbmcnIChkZWZhdWx0KSBhbmQgJ29iamVjdCdgKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgUmVtb3ZlIHRoZSAnQGJpbmQnIG9yIHRoZSAnZGF0YS1iaW5kOicgZnJvbSB0aGUgYXR0cmlidXRlIFxyXG4gICAgICAgICAqIGFuZCBnZXQgdGhlICdiaW5kYWJsZScgYXR0cmlidXRlIHNvIHRvIHNwZWFrXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3QgYmluZGFibGU6IHN0cmluZyA9ICh0aGlzLmF0dHJpYnV0ZS5hdHRyaWJ1dGUubWF0Y2goUGF0dGVybnMuYmluZC5iaW5kYWJsZSkgPz8gW1wiXCJdKVswXTtcclxuXHJcbiAgICAgICAgaWYoIWJpbmRhYmxlKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXZhbEVycm9yKFwiQSAnZGF0YS1iaW5kL0BiaW5kJyBtdXN0IGJlIGZvbGxvd2VkIGJ5IGEgdmFsaWQgaHRtbCBhdHRyaWJ1dGVcIik7XHJcblxyXG4gICAgICAgIC8vU2V0IHRoZSAnYmluZEF0dHInIHByb3BlcnR5XHJcbiAgICAgICAgdGhpcy5iaW5kQXR0ciA9IHtcclxuICAgICAgICAgICAgbmFtZTogYmluZGFibGUsXHJcbiAgICAgICAgICAgIGV4aXN0czogdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZShiaW5kYWJsZSksXHJcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKGJpbmRhYmxlKSEsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmluZCBhbGwgdGhlICckdGhpcy5kYXRhJyBwbGFjZWQgaW4gdGhlIGF0dHJpYnV0ZSwgXHJcbiAgICAgICAgICogYW5kIHJldHVybiB0aGUgcmVhbCB2YXJpYWJsZSBuYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSBbLi4ubmV3IFNldChbXHJcbiAgICAgICAgICAgIC4uLlsuLi50aGlzLmF0dHJpYnV0ZS52YWx1ZXMub3JpZ2luYWwubWF0Y2hBbGwoUGF0dGVybnMuYmluZC4kdGhpcyldXHJcbiAgICAgICAgICAgICAgICAubWFwKChtKSA9PiBtWzBdKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgodmFyaWFibGUpID0+IHZhcmlhYmxlLnJlcGxhY2UoXCIkdGhpcy5kYXRhLlwiLCBcIlwiKSlcclxuICAgICAgICBdKV07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0RGF0YSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBoYXNFcnJvcih0eXBlOiBzdHJpbmcsIHJlZ2V4cDogUmVnRXhwKSB7XHJcbiAgICAgICAgaWYoKHRoaXMuYXR0cmlidXRlLm1vZGlmaWVyID09IHR5cGUpICYmICghcmVnZXhwLnRlc3QodGhpcy5hdHRyaWJ1dGUudmFsdWVzLm9yaWdpbmFsKSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEV2YWxFcnJvcihgVGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1iaW5kL0BiaW5kJyBhdHRyaWJ1dGUgbXVzdCBiZSBhICR7dHlwZX1gKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHRoaXMuaGFzRXJyb3IodGhpcy5hdHRyaWJ1dGUubW9kaWZpZXIsIFBhdHRlcm5zLmJpbmRbdGhpcy5hdHRyaWJ1dGUubW9kaWZpZXJdKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5iaW5kQXR0ci5uYW1lID09IFwiY2xhc3NcIikge1xyXG4gICAgICAgICAgICBjb25zdCBvYmplY3RDbGFzcyA9IHZhbHVlLnJlcGxhY2UoL1xce3xcXH0vZywgXCJcIikuc3BsaXQoXCIsXCIpXHJcbiAgICAgICAgICAgICAgICAubWFwKChleHApID0+IGV4cC5zcGxpdChcIjpcIikubWFwKGUgPT4gZS50cmltKCkpKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFBhcnNlci5wYXJzZXIoZGF0YVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFBhcnNlci5wYXJzZXIoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGRhdGFbMV0ubWF0Y2goUGF0dGVybnMuYmluZC4kdGhpcykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBkYXRhWzFdLnJlcGxhY2VBbGwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBhdHRlcm5zLmJpbmQuJHRoaXMsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQYXJzZXIucGFyZW50RXNjYXBlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVtkYXRhWzFdLm1hdGNoKFBhdHRlcm5zLmJpbmQudmFyaWFibGUpIVswXV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBkYXRhWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICBdfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0Q2xhc3MuZmlsdGVyKChlKSA9PiBCb29sZWFuKGVbMV0pKS5tYXAoKGMpID0+IGMuc2hpZnQoKSkuam9pbihcIiBcIik7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMudmFyaWFibGVzLmZvckVhY2goKHZhcmlhYmxlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB2ID0gdGhpcy5wYXJlbnQuZGF0YVt2YXJpYWJsZV0udmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZS52YWx1ZXMuY3VycmVudCA9IHZhbHVlLnJlcGxhY2VBbGwoXHJcbiAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfWAsIFxyXG4gICAgICAgICAgICAgICAgKCh0eXBlb2YgdiA9PSBcInN0cmluZ1wiKSA/IGAnJHt2fSdgIDogdilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFBhcnNlci5wYXJzZXIodGhpcy5hdHRyaWJ1dGUudmFsdWVzLmN1cnJlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmluZCB0aGUgYXR0cmlidXRlXHJcbiAgICAgKi9cclxuICAgIHNldERhdGEoKTogdm9pZCB7XHJcbiAgICAgICAgaWYodGhpcy5hdHRyaWJ1dGUubW9kaWZpZXIgPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAodGhpcy5iaW5kQXR0ci5uYW1lID09IFwic3R5bGVcIikgXHJcbiAgICAgICAgICAgICAgICAmJiBPYmplY3QuYXNzaWduKHRoaXMuZWxlbWVudC5zdHlsZSwgdGhpcy5wYXJzZSh0aGlzLmF0dHJpYnV0ZS52YWx1ZXMub3JpZ2luYWwpKTtcclxuXHJcbiAgICAgICAgICAgICh0aGlzLmJpbmRBdHRyLm5hbWUgPT0gXCJjbGFzc1wiKVxyXG4gICAgICAgICAgICAgICAgJiYgKHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPSBgJHt0aGlzLnBhcnNlKHRoaXMuYXR0cmlidXRlLnZhbHVlcy5vcmlnaW5hbCl9ICR7KHRoaXMuYmluZEF0dHIudmFsdWUgPz8gXCJcIil9YClcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICh0aGlzLmJpbmRBdHRyLm5hbWUgPT0gXCJjbGFzc1wiKVxyXG4gICAgICAgICAgICAmJiAodGhpcy5lbGVtZW50LmNsYXNzTmFtZSA9IGAke3RoaXMucGFyc2UodGhpcy5hdHRyaWJ1dGUudmFsdWVzLm9yaWdpbmFsKX0gJHsodGhpcy5iaW5kQXR0ci52YWx1ZSA/PyBcIlwiKX1gKTtcclxuXHJcbiAgICAgICAgKHRoaXMuYmluZEF0dHIubmFtZSA9PSBcInN0eWxlXCIpIFxyXG4gICAgICAgICAgICAmJiAodGhpcy5lbGVtZW50LnN0eWxlLmNzc1RleHQgPSB0aGlzLnBhcnNlKHRoaXMuYXR0cmlidXRlLnZhbHVlcy5vcmlnaW5hbCkgKyAodGhpcy5iaW5kQXR0ci52YWx1ZSA/PyBcIlwiKSk7XHJcbiAgICB9O1xyXG59IiwiaW1wb3J0IHsgRXZlbnRDaGlsZCwgQXJncywgQXJndW1lbnRzT2JqZWN0LCBNZXRob2REYXRhLCBNZXRob2RJbmZvIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENoZXZlcmVOb2RlIH0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcbmltcG9ydCB7IEhlbHBlciwgTWFnaWNzLCBQYXJzZXIsIFBhdHRlcm5zIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRXZlbnROb2RlIGltcGxlbWVudHMgRXZlbnRDaGlsZCB7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIG1ldGhvZDogTWV0aG9kRGF0YTtcclxuICAgIGV2ZW50OiBzdHJpbmc7XHJcbiAgICBhdHRyVmFsOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogRXZlbnRDaGlsZCkge1xyXG4gICAgICAgICh7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgOiB0aGlzLmVsZW1lbnQsIFxyXG4gICAgICAgICAgICBldmVudCAgIDogdGhpcy5ldmVudCwgXHJcbiAgICAgICAgICAgIGF0dHJWYWwgOiB0aGlzLmF0dHJWYWwsIFxyXG4gICAgICAgICAgICBwYXJlbnQgIDogdGhpcy5wYXJlbnRcclxuICAgICAgICB9ID0gZGF0YSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9HaXZlIGl0IGFuIElEIGZvciB0aGUgZWxlbWVudFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIEhlbHBlci5zZXREYXRhSWQoMTApKTtcclxuXHJcbiAgICAgICAgLy9TZWFyY2ggbWV0aG9kIGFuZCBjaGVjayBpZiBpdCBoYXMgYXJndW1lbnRzXHJcbiAgICAgICAgdGhpcy5tZXRob2QgPSB0aGlzLmdldE1ldGhvZCgpO1xyXG5cclxuICAgICAgICBpZih0aGlzLm1ldGhvZC50eXBlT2ZNZXRob2QgPT0gXCJtYWdpY1wiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudCwgXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1ldGhvZC5mdW5jdGlvbi5vcmlnaW5hbC5iaW5kKHRoaXMsIC4uLnRoaXMubWV0aG9kLmFyZ3MhLnZhbHVlcygpKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypJZiBldmVyeXRoaW5nIGlzIG9rLCB0aGVuIHNldCB0aGUgRXZlbnRcclxuICAgICAgICB0aGlzLnBhcmVudD8uc2V0RXZlbnQoe1xyXG4gICAgICAgICAgICBlbGVtOiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIGFjdGlvbjogdGhpcy5tZXRob2QhLFxyXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmV2ZW50LFxyXG4gICAgICAgICAgICBhcmdzOiB0aGlzLmFyZ3NcclxuICAgICAgICB9KTsqL1xyXG4gICAgfVxyXG5cclxuICAgIGdldE1ldGhvZCgpOiBNZXRob2REYXRhIHtcclxuICAgICAgICBsZXQgbmFtZTogc3RyaW5nID0gdGhpcy5zZWFyY2hNZXRob2ROYW1lKCksXHJcbiAgICAgICAgICAgIGZ1bmM6IE1ldGhvZEluZm8gPSB0aGlzLnNlYXJjaE1ldGhvZChuYW1lKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlT2ZNZXRob2Q6IGZ1bmMudHlwZU9mTWV0aG9kLFxyXG4gICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICBmdW5jdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWw6IGZ1bmMubWV0aG9kLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhcmdzOiB0aGlzLnNlYXJjaEFyZ3VtZW50cyhmdW5jKSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHNlYXJjaE1ldGhvZE5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgbWV0aG9kTmFtZTogc3RyaW5nID0gdGhpcy5hdHRyVmFsLm1hdGNoKFBhdHRlcm5zLmF0dHIubWV0aG9kTmFtZSkhWzBdO1xyXG5cclxuICAgICAgICBpZighbWV0aG9kTmFtZSkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBtZXRob2QgbmFtZSBhdCBvbmUgb2YgeW91ciBcIiR7dGhpcy5wYXJlbnQubmFtZX1cIlwiIGNvbXBvbmVudHNgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1ldGhvZE5hbWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHNlYXJjaEFyZ3VtZW50cyhmdW5jOiBNZXRob2RJbmZvKTogQXJncyB7XHJcbiAgICAgICAgbGV0IG9yaWdpbmFsQXJncyA9IGZ1bmMubWV0aG9kLnRvU3RyaW5nKCkudHJpbSgpLm1hdGNoKFBhdHRlcm5zLmF0dHIubWV0aG9kQXJncyksXHJcbiAgICAgICAgICAgIGh0bWxBcmdzICAgPSB0aGlzLmF0dHJWYWwudHJpbSgpLm1hdGNoKFBhdHRlcm5zLmF0dHIubWV0aG9kQXJncyk7XHJcblxyXG4gICAgICAgIGlmKCghb3JpZ2luYWxBcmdzKSAmJiAoIWh0bWxBcmdzKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBodG1sQXJncyA9IFBhcnNlci5wYXJzZUFyZ3MoaHRtbEFyZ3MhWzBdLnNwbGl0KFwiLFwiKSwgdGhpcy5wYXJlbnQsIGZ1bmMudHlwZU9mTWV0aG9kKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXAoWy4uLm9yaWdpbmFsQXJncyFbMF0uc3BsaXQoXCIsXCIpLm1hcCgodiwgaSkgPT4gW3YsIGh0bWxBcmdzW2ldXSldKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2VhcmNoTWV0aG9kKG5hbWU6IHN0cmluZyk6IE1ldGhvZEluZm8ge1xyXG4gICAgICAgIGxldCB0eXBlT2ZNZXRob2Q6IHN0cmluZyA9IFBhdHRlcm5zLmF0dHIuaXNNZXRob2QudGVzdCh0aGlzLmF0dHJWYWwudHJpbSgpKSBcclxuICAgICAgICAgICAgPyBcIm1ldGhvZFwiIFxyXG4gICAgICAgICAgICA6IChQYXR0ZXJucy5hdHRyLmlzTWFnaWMudGVzdCh0aGlzLmF0dHJWYWwudHJpbSgpKSA/IFwibWFnaWNcIiA6IFwiXCIpO1xyXG5cclxuICAgICAgICBpZighdHlwZU9mTWV0aG9kKSB0aHJvdyBuZXcgRXJyb3IoYFRoZSB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlIGNvbnRhaW5zIGludmFsaWQgZXhwcmVzc2lvbnNgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgbGV0IG1ldGhvZDogRnVuY3Rpb24gPSAoKHR5cGVPZk1ldGhvZCA9PSBcIm1hZ2ljXCIpID8gTWFnaWNzIDogdGhpcy5wYXJlbnQubWV0aG9kcyEpW25hbWVdO1xyXG5cclxuICAgICAgICBpZighbWV0aG9kKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBUaGVyZSdzIG5vIGEgbWV0aG9kIG5hbWVkICcke25hbWV9JyBpbiB0aGUgJHsodHlwZU9mTWV0aG9kID09IFwibWFnaWNcIikgPyBcIk1hZ2ljc1wiIDogYCR7dGhpcy5wYXJlbnQubmFtZX0gY29tcG9uZW50YH1gKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbWV0aG9kLFxyXG4gICAgICAgICAgICB0eXBlT2ZNZXRob2RcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtDaGV2ZXJlTm9kZX0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcbmltcG9ydCB7IExvb3BFbGVtZW50LCBQYXJzZWREYXRhLCBQYXJzZWRGb3IgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgVGV4dE5vZGUgfSBmcm9tIFwiLi9UZXh0Tm9kZVwiO1xyXG5pbXBvcnQgeyBQYXJzZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBMb29wTm9kZSBpbXBsZW1lbnRzIExvb3BFbGVtZW50IHtcclxuICAgIGVsZW1lbnQ6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XHJcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xyXG4gICAgdmFyaWFibGU6IFBhcnNlZERhdGE7XHJcbiAgICBleHByZXNzaW9ucz86IHN0cmluZ1tdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IExvb3BFbGVtZW50KSB7XHJcbiAgICAgICAgKHsgZWxlbWVudDogdGhpcy5lbGVtZW50LCBwYXJlbnQ6IHRoaXMucGFyZW50IH0gPSBkYXRhKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyc2VkOiBQYXJzZWRGb3IgPSBQYXJzZXIucGFyc2VEYXRhRm9yQXR0cih7XHJcbiAgICAgICAgICAgIGF0dHI6IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZvclwiKSEsIFxyXG4gICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAoeyBleHByZXNzaW9uczogdGhpcy5leHByZXNzaW9ucywgdmFyaWFibGU6IHRoaXMudmFyaWFibGUgfSA9IHBhcnNlZCk7XHJcblxyXG4gICAgICAgIGlmKHR5cGVvZiB0aGlzLnZhcmlhYmxlLnZhbHVlID09IFwic3RyaW5nXCIpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXZhbEVycm9yKGBDYW5ub3Qgc2V0IGEgJ2Zvci4uaW4nIGxvb3AgaW4gdHlwZSAke3R5cGVvZiB0aGlzLnZhcmlhYmxlLnZhbHVlfWApOyAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMubG9vcEVsZW1lbnRzKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxvb3BFbGVtZW50cygpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSBBcnJheS5mcm9tKHRoaXMucGFyZW50LmVsZW1lbnQuY2hpbGRyZW4pLmluZGV4T2YodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGU6IERvY3VtZW50RnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQuY29udGVudC5xdWVyeVNlbGVjdG9yKFwiZGl2OmZpcnN0LWNoaWxkXCIpO1xyXG5cclxuICAgICAgICBpZighZWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGZpcnN0IGNoaWxkIG9mIHlvdXIgZGF0YS1mb3IgZWxlbWVudCBtdXN0IGJlIGEgZGl2IGVsZW1lbnRcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IHRoaXNDaGlsZHMgPSBbLi4uZWxlbWVudCEucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS10ZXh0XVwiKV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IExvb3BUZXh0ID0gdGhpc0NoaWxkc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChjaGlsZCkgPT4gY2hpbGQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpPy5zdGFydHNXaXRoKHRoaXMuZXhwcmVzc2lvbnMhWzBdKSk7XHJcblxyXG4gICAgICAgIExvb3BUZXh0LmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIiwgXHJcbiAgICAgICAgICAgIGAke3RoaXMudmFyaWFibGUubm9tYnJlfVtdYCArIGVsLmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8ucmVwbGFjZSh0aGlzLmV4cHJlc3Npb25zIVswXSwgXCJcIikhKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpIGluIHRoaXMudmFyaWFibGUudmFsdWUpIHtcclxuICAgICAgICAgICAgTG9vcFRleHRcclxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhdHRyVmFsOiBzdHJpbmcgPSAoKyhpKSA9PSAwKSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBlbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8ucmVwbGFjZShcIltdXCIgLCBgWyR7aX1dYCkhIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpPy5yZXBsYWNlKC9cXFtbMC05XStcXF0vLCBgWyR7aX1dYCkhXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIiwgYXR0clZhbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmNoaWxkcyFbXCJkYXRhLXRleHRcIl0ucHVzaChuZXcgVGV4dE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0ZW1wbGF0ZS5hcHBlbmRDaGlsZChkb2N1bWVudC5pbXBvcnROb2RlKGVsZW1lbnQsIHRydWUpKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFyZW50LmVsZW1lbnQucHJlcGVuZCh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50LmNhblNldCA9IHRydWU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZSB9IGZyb20gXCJAY2hldmVyZVwiO1xuaW1wb3J0IHsgSW5wdXRNb2RlbCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XG5cbi8qKlxuICogVGhlIGNsYXNzIGZvciB0aG9zZSBpbnB1dHMgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBgZGF0YS1tb2RlbGAgYXR0cmlidXRlXG4gKiAgQGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2RlbE5vZGUgaW1wbGVtZW50cyBJbnB1dE1vZGVsIHtcbiAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50O1xuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XG4gICAgdmFyaWFibGU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGlucHV0OiBJbnB1dE1vZGVsKSB7XG4gICAgICAgICh7IHBhcmVudDogdGhpcy5wYXJlbnQsIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCB9ID0gaW5wdXQpO1xuXG4gICAgICAgIC8vU2VhcmNoIGlmIHRoZSBpbmRpY2F0ZWQgdmFyaWFibGUgb2YgdGhlIGRhdGEtbW9kZWwgYXR0cmlidXRlIGV4aXN0cyBpbiB0aGUgc2NvcGVcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZ2V0VmFyaWFibGUoKTtcblxuICAgICAgICB0aGlzLmFzc2lnblRleHQodGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZS50b1N0cmluZygpKTtcblxuICAgICAgICAvL0FkZCB0aGUgbGlzdGVuZXJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLnN5bmNUZXh0LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIGlucHV0IGlzIG5laXRoZXIgdHlwZSAncmFkaW8nIG5vciB0eXBlICdjaGVja2JveCcsIHNldHMgaXRzIHZhbHVlIGFjY29yZGluZyB0byB0aGUgdmFyaWFibGVcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgVGhlIHZhbHVlXG4gICAgICovXG4gICAgYXNzaWduVGV4dCh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gICAgfVxuXG4gICAgc3luY1RleHQoKTogdm9pZCB7XG4gICAgICAgIGlmKHRoaXMuZWxlbWVudC50eXBlID09IFwiY2hlY2tib3hcIikge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRlZCA9IFsuLi50aGlzLnBhcmVudC5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgYGlucHV0W3R5cGU9XCJjaGVja2JveFwiXVtkYXRhLW1vZGVsPVwiJHt0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1tb2RlbFwiKX1cIl1gXG4gICAgICAgICAgICApXS5maWx0ZXIoKGUpID0+IGUgIT0gdGhpcy5lbGVtZW50KSBhcyBIVE1MSW5wdXRFbGVtZW50W107XG5cbiAgICAgICAgICAgIGlmKHJlbGF0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZSA9IChyZWxhdGVkLnNvbWUoKGUpID0+IChlLmNoZWNrZWQgPT0gdHJ1ZSkgJiYgKGUgIT0gdGhpcy5lbGVtZW50KSkpXG4gICAgICAgICAgICAgICAgICAgID8gcmVsYXRlZC5maWx0ZXIoKGUpID0+IGUuY2hlY2tlZCA9PSB0cnVlKS5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIDogKCh0aGlzLmVsZW1lbnQuY2hlY2tlZCkgPyB0aGlzLmVsZW1lbnQudmFsdWUgOiBcIlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZSA9ICh0aGlzLmVsZW1lbnQudmFsdWUgPT0gXCJvblwiKVxuICAgICAgICAgICAgICAgICAgICA/IFN0cmluZyh0aGlzLmVsZW1lbnQuY2hlY2tlZClcbiAgICAgICAgICAgICAgICAgICAgOiAodGhpcy5lbGVtZW50LmNoZWNrZWQpID8gdGhpcy5lbGVtZW50LnZhbHVlIDogXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUgPSBTdHJpbmcodGhpcy5lbGVtZW50LnZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgdmFyaWFibGUgdGhhdCB3YXMgaW5kaWNhdGVkIGluIHRoZSAnZGF0YS1tb2RlbCcgYXR0cmlidXRlIFxuICAgICAqIEByZXR1cm5zIFRoZSB2YXJpYWJsZSB0byBtb2RlbFxuICAgICAqL1xuICAgIGdldFZhcmlhYmxlKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBhdHRyID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtbW9kZWxcIikhO1xuXG4gICAgICAgIEhlbHBlci5jaGVja0ZvckVycm9ySW5WYXJpYWJsZShhdHRyKTtcblxuICAgICAgICBsZXQgdmFyaWFibGUgPSBPYmplY3Qua2V5cyh0aGlzLnBhcmVudC5kYXRhKS5maW5kKChkYXRhKSA9PiBkYXRhID09IGF0dHIpO1xuXG4gICAgICAgIGlmICghdmFyaWFibGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgICAgICAgYFRoZXJlJ3Mgbm8gYSAnJHthdHRyfScgdmFyaWFibGUgaW4gdGhlIGRhdGEtYXR0YWNoZWQgc2NvcGVgLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdmFyaWFibGU7XG4gICAgfVxufSIsImltcG9ydCB7IENoZXZlcmVOb2RlIH0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcbmltcG9ydCB7IFBhcnNlciB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5pbXBvcnQgeyBQYXJzZWREYXRhLCBQYXJzZWRTaG93LCBTaG93Q2hpbGQgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBTaG93Tm9kZSBpbXBsZW1lbnRzIFNob3dDaGlsZCB7XHJcbiAgICBlbGVtZW50IDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwYXJlbnQgIDogQ2hldmVyZU5vZGU7XHJcbiAgICB2YXJpYWJsZTogUGFyc2VkRGF0YTtcclxuICAgIHZhbHVlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogU2hvd0NoaWxkKSB7XHJcbiAgICAgICAgKHsgZWxlbWVudCA6IHRoaXMuZWxlbWVudCwgIHBhcmVudCA6IHRoaXMucGFyZW50IH0gPSBkYXRhKTtcclxuXHJcbiAgICAgICAgbGV0IHBhcnNlZEF0dHI6IFBhcnNlZFNob3cgPSBQYXJzZXIucGFyc2VkRGF0YVNob3dBdHRyKHtcclxuICAgICAgICAgICAgYXR0cjogdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtc2hvd1wiKSEsXHJcbiAgICAgICAgICAgIG5vZGU6IHRoaXMucGFyZW50XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICh7IHZhbHVlOiB0aGlzLnZhbHVlLCB2YXJpYWJsZTogdGhpcy52YXJpYWJsZSB9ID0gcGFyc2VkQXR0cik7XHJcblxyXG4gICAgICAgIHRoaXMudG9nZ2xlSGlkZGVuKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRvZ2dsZUhpZGRlbigpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuaGlkZGVuID0gIShQYXJzZXIucGFyc2VyKGBcclxuICAgICAgICAgICAgJHsodHlwZW9mIHRoaXMudmFyaWFibGUudmFsdWUgPT0gXCJzdHJpbmdcIikgXHJcbiAgICAgICAgICAgICAgICA/IGBcIiR7dGhpcy52YXJpYWJsZS52YWx1ZX1cImAgXHJcbiAgICAgICAgICAgICAgICA6IHRoaXMudmFyaWFibGUudmFsdWV9ICR7dGhpcy52YWx1ZX1gXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59OyIsIlxyXG5pbXBvcnQgeyBUZXh0UmVsYXRpb24sIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7Q2hldmVyZU5vZGV9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIsIFBhcnNlciB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRleHROb2RlIGltcGxlbWVudHMgVGV4dFJlbGF0aW9uIHtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xyXG4gICAgX3ZhcmlhYmxlPzogYW55O1xyXG4gICAgX3ZhbHVlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogVGV4dFJlbGF0aW9uKSB7XHJcbiAgICAgICAgKHsgZWxlbWVudDogdGhpcy5lbGVtZW50LCBwYXJlbnQ6IHRoaXMucGFyZW50IH0gPSBkYXRhKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBIZWxwZXIuc2V0RGF0YUlkKDEwKSk7XHJcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIikhO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5fdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCB2YXJpYWJsZShhdHRyOiBzdHJpbmcpIHtcclxuICAgICAgICBIZWxwZXIuY2hlY2tGb3JFcnJvckluVmFyaWFibGUoYXR0cik7XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBQYXJzZXIucGFyc2VEYXRhVGV4dEF0dHIoe1xyXG4gICAgICAgICAgICBhdHRyOiBhdHRyLCBcclxuICAgICAgICAgICAgbm9kZTogdGhpcy5wYXJlbnRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgKHt2YXJpYWJsZTogdGhpcy5fdmFyaWFibGUsIHZhbHVlOiB0aGlzLnZhbHVlfSA9IGRhdGEpO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0ICogZnJvbSBcIi4vRXZlbnROb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0xvb3BOb2RlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL01vZGVsTm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9UZXh0Tm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9TaG93Tm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9CaW5kTm9kZVwiOyIsImltcG9ydCB7IENoZXZlcmVOb2RlRGF0YSwgRGF0YVR5cGUsIE1ldGhvZFR5cGUsIEFyZ3VtZW50c09iamVjdCwgSW5pdCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbi8qKlxyXG4gKiAgVGhlIGNsYXNzIHRoYXQgdXNlcnMgY3JlYXRlIHRoZWlyIGNvbXBvbmVudHNcclxuICogIEBjbGFzc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENoZXZlcmVEYXRhIGltcGxlbWVudHMgQ2hldmVyZU5vZGVEYXRhIHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGRhdGE6IERhdGFUeXBlO1xyXG4gICAgaW5pdD86IEZ1bmN0aW9uO1xyXG4gICAgbWV0aG9kcz86IE1ldGhvZFR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZU5vZGVEYXRhKSB7XHJcbiAgICAgICAgKHsgbmFtZTogdGhpcy5uYW1lLCBkYXRhOiB0aGlzLmRhdGEsIGluaXQ6IHRoaXMuaW5pdCwgbWV0aG9kczogdGhpcy5tZXRob2RzIH0gPSBkYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBhcmd1bWVudHMgb2YgdGggaW5pdCgpIG1ldGhvZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gaHRtbEFyZ3MgVGhlIGFyZ3VtZW50cyBvZiBkZSBkYXRhLWF0dGFjaGVkIGF0dHJpYnV0ZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gaW5pdEFyZ3MgVGhlIGFyZ3VtZW50cyBkZWZpbmVkIGluIHRoZSBpbml0KCkgbWV0aG9kXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHBhcnNlQXJndW1lbnRzKGh0bWxBcmdzOiBzdHJpbmdbXSwgbWV0aG9kQXJnczogc3RyaW5nW10pOiBQcm9taXNlPEZ1bmN0aW9uPiB7XHJcblxyXG4gICAgICAgIC8vR2V0IGEgdmFsaWQgdmFsdWUgZm9yIHRoZSBhcmd1bWVudCwgZm9yIGV4YW1wbGUsIGNoZWNrIGZvciBzdHJpbmdzIHdpdGggdW5jbG9zZWQgcXVvdGVzXHJcbiAgICAgICAgbGV0IGZpbmFsID0gSGVscGVyLmdldFJlYWxWYWx1ZXNJbkFyZ3VtZW50cyh7XHJcbiAgICAgICAgICAgIGFyZ3M6IGh0bWxBcmdzLFxyXG4gICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJpbml0KClcIlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL0NyZWF0ZSB0aGUgYXJndW1lbnQgb2JqZWN0XHJcbiAgICAgICAgbGV0IGFyZ3NPYmo6IEFyZ3VtZW50c09iamVjdCA9IHt9O1xyXG5cclxuICAgICAgICBmb3IobGV0IGkgaW4gbWV0aG9kQXJncykgYXJnc09ialttZXRob2RBcmdzW2ldXSA9IGZpbmFsW2ldO1xyXG5cclxuICAgICAgICAvLy4uLmFuZCBwYXNzIGl0IHRvIHRoZSB1bnBhcnNlZCBpbml0IGZ1bmN0aW9uXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucGFyc2VJbml0KHtcclxuICAgICAgICAgICAgaW5pdDogdGhpcy5pbml0ISxcclxuICAgICAgICAgICAgYXJnczogYXJnc09iaixcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBpbml0IGZ1bmN0aW9uIGFuZCBleGVjdXRlcyBpdFxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaW5pdCBUaGUgdW5wYXJzZWQgaW5pdCBmdW5jdGlvblxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGFyZ3MgVGhlIHBhcnNlZCBjdXN0b20gYXJndW1lbnRzXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgaW5pdCBmdW5jdGlvblxyXG4gICAgICovXHJcbiAgICBhc3luYyBwYXJzZUluaXQoaW5pdDogSW5pdCk6IFByb21pc2U8RnVuY3Rpb24+IHtcclxuXHJcbiAgICAgICAgbGV0IGluaXRGdW5jOiBzdHJpbmcgPSBIZWxwZXIuY29udGVudE9mRnVuY3Rpb24oaW5pdC5pbml0KTtcclxuXHJcbiAgICAgICAgLy9GaW5kcyB0aGUgcmVhbCBhcmd1bWVudHMgYW5kIG5vIGV4cHJlc3Npb25zIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICAgIGlmIChpbml0LmFyZ3MpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoaW5pdC5hcmdzKS5mb3JFYWNoKChhcmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzdHI6IHN0cmluZyA9IGAoPzw9KD1cXFxccyl8KFxcXFwoKXwoPSkpKCR7YXJnfSlgO1xyXG4gICAgICAgICAgICAgICAgaW5pdEZ1bmMgPSBpbml0RnVuYy5yZXBsYWNlKG5ldyBSZWdFeHAoc3RyLCBcImdcIiksIGAkYXJncy4ke2FyZ31gKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vQ3JlYXRlIHRoZSBuZXcgcGFyc2VkIGluaXQgZnVuY3Rpb25cclxuICAgICAgICBsZXQgbmV3RnVuYzogRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oXHJcbiAgICAgICAgICAgIFwieyR0aGlzID0gdW5kZWZpbmVkLCAkYXJncyA9IHVuZGVmaW5lZH1cIixcclxuICAgICAgICAgICAgYHJldHVybiBhc3luYygpID0+IHsgJHtpbml0RnVuY30gfTtgLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vUmV0dXJuIHRoZSBuZXcgaW5pdCBmdW5jdGlvbiBhbmQgZXhlY3V0ZXMgaXRcclxuICAgICAgICByZXR1cm4gYXdhaXQgbmV3RnVuYyh7XHJcbiAgICAgICAgICAgICR0aGlzOiB0aGlzLFxyXG4gICAgICAgICAgICAkYXJnczogaW5pdC5hcmdzLFxyXG4gICAgICAgIH0pKCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBDaGV2ZXJlRWxlbWVudCwgTWV0aG9kVHlwZSwgRGF0YVR5cGUsIENoaWxkLCBDaGV2ZXJlRXZlbnQsIFBhcnNlZERhdGEsIEV2ZW50RWxlbWVudHMsIFBhcnNlZEFyZ3MsIEJpbmRDaGlsZCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQge0NoZXZlcmVEYXRhfSBmcm9tIFwiLi9DaGV2ZXJlRGF0YVwiO1xyXG5pbXBvcnQge0V2ZW50Tm9kZSwgVGV4dE5vZGUsIE1vZGVsTm9kZSwgTG9vcE5vZGUsIFNob3dOb2RlLCBCaW5kTm9kZSB9IGZyb20gXCJAYWN0aW9uc1wiO1xyXG5pbXBvcnQgeyBIZWxwZXIsIENoaWxkc0hlbHBlciwgTWFnaWNzLCBQYXJzZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlTm9kZSBpbXBsZW1lbnRzIENoZXZlcmVFbGVtZW50IHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGRhdGE6IERhdGFUeXBlO1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIG1ldGhvZHM/OiBNZXRob2RUeXBlO1xyXG4gICAgZWxlbWVudDogRWxlbWVudDtcclxuICAgIGFyZ3M6IHsgW21ldGhvZDogc3RyaW5nXTogUGFyc2VkQXJncyB9ID0ge307XHJcbiAgICBjaGlsZHM/OiBDaGlsZCA9IHtcclxuICAgICAgICBcImV2ZW50XCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS10ZXh0XCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1tb2RlbFwiOiBbXSxcclxuICAgICAgICBcImRhdGEtZm9yXCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1zaG93XCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1yZWZcIjogW10sXHJcbiAgICAgICAgXCJkYXRhLWJpbmRcIjogW10sXHJcbiAgICB9O1xyXG4gICAgcmVmczogeyBbbmFtZTogc3RyaW5nXTogRWxlbWVudCB9ID0ge307XHJcbiAgICBjYW5TZXQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlRGF0YSwgZWw6IEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wYXJzZURhdGEoZGF0YS5kYXRhKTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgUGFyc2UgYWxsICR0aGlzLCAkc2VsZiwgJGRhdGEuLi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm1ldGhvZHMgPSB0aGlzLnBhcnNlTWV0aG9kcyhkYXRhLm1ldGhvZHMpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgdGhlIHBhcmVudCBgZGl2YCBhbmQgZ2l2ZSBpdCBhIHZhbHVlIGZvciB0aGUgZGF0YS1pZCBhdHRyaWJ1dGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbDtcclxuICAgICAgICB0aGlzLmlkID0gSGVscGVyLnNldERhdGFJZCgxMCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgdGhpcy5pZCk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBHZXQgdGhlIGV2ZW50cyBhbmQgYWN0aW9ucyBvZiB0aGUgY29tcG9uZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIGFsbCB0aGUgZGF0YSwgdGhleSBuZWVkIGdldHRlciBhbmQgYSBzZXR0ZXJcclxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBwcmltaXRpdmUgZGF0YVxyXG4gICAgICovXHJcbiAgICBwYXJzZURhdGEoZGF0YTogRGF0YVR5cGUpIHtcclxuICAgICAgICBsZXQgb2JqOiBbc3RyaW5nLCBQYXJzZWREYXRhXVtdID0gW107XHJcblxyXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKGRhdGEpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xyXG4gICAgICAgICAgICBvYmoucHVzaChba2V5LCB0aGlzLnBhcnNlZE9iaihrZXksIHZhbHVlKV0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKG9iaik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZWQgdGhlIG1ldGhvZHMgZGVzY3JpYmVkIGluIHRoZSBtZXRob2QgcHJvcGVydHkgb2YgdGhlIGRhdGFcclxuICAgICAqIEBwYXJhbSB7TWV0aG9kVHlwZX0gbWV0aG9kc1xyXG4gICAgICogQHJldHVybnMgVGhlIG1ldGhvZHMgcGFyc2VkXHJcbiAgICAgKi9cclxuICAgIHBhcnNlTWV0aG9kcyhtZXRob2RzPzogTWV0aG9kVHlwZSk6IE1ldGhvZFR5cGUgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGlmIChtZXRob2RzID09IHVuZGVmaW5lZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBPYmplY3Qua2V5cyhtZXRob2RzKS5mb3JFYWNoKChtZXRob2QpID0+IHtcclxuICAgICAgICAgICAgLy9JZiB0aGUgbWV0aG9kIHdhcyBhbHJlYWR5IHBhcnNlZFxyXG4gICAgICAgICAgICBsZXQgd2FzUGFyc2VkOiBudW1iZXIgPSBtZXRob2RzW21ldGhvZF1cclxuICAgICAgICAgICAgICAgIC50b1N0cmluZygpXHJcbiAgICAgICAgICAgICAgICAuc2VhcmNoKFwiYW5vbnltb3VzXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHdhc1BhcnNlZCA9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFyZ3M6IFBhcnNlZEFyZ3MgPSBIZWxwZXIubWV0aG9kQXJndW1lbnRzKG1ldGhvZHNbbWV0aG9kXSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYoYXJncykgdGhpcy5hcmdzW21ldGhvZF0gPSBhcmdzO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwYXJzZWQ6IHN0cmluZyA9IG1ldGhvZHNbbWV0aG9kXVxyXG4gICAgICAgICAgICAgICAgICAgIC50b1N0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14uKnxbXFx9XSQvZywgXCJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5kYXRhKS5mb3JFYWNoKCh2YXJpYWJsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlZCA9IHBhcnNlZC5yZXBsYWNlQWxsKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGAkdGhpcy5kYXRhLiR7dmFyaWFibGV9LnZhbHVlYCxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5hcmdzW21ldGhvZF0gIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcmdzW21ldGhvZF0/LmZvckVhY2goKGFyZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RyOiBzdHJpbmcgPSBgKD88PSg9XFxcXHMpfChcXFxcKCl8KD0pKSgke2FyZ30pYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkID0gcGFyc2VkLnJlcGxhY2UobmV3IFJlZ0V4cChzdHIsIFwiZ1wiKSwgYCRhcmdzLiR7YXJnfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIFwieyR0aGlzID0gdW5kZWZpbmVkLCAkZXZlbnQgPSB1bmRlZmluZWQsICRhcmdzID0gdW5kZWZpbmVkfVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlZCxcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWV0aG9kc1ttZXRob2RdID0gbmV3RnVuYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gbWV0aG9kcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgYWxsIHRoZSBjaGlsZHJlbnMgdGhhdCBoYXZlIGFuIGFjdGlvbiBhbmQgZGF0YVxyXG4gICAgICovXHJcbiAgICBjaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsIHRoZSBlbGVtZW50cyBzdXBwb3J0ZWQgd2l0aCBDaGV2ZXJleFxyXG4gICAgICAgICAqIEBjb25zdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGxvb3BOb2RlcyAgIDogTm9kZUxpc3RPZjxIVE1MVGVtcGxhdGVFbGVtZW50PiA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YUZvcih0aGlzLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICAvL0ZvciBub2Rlc1xyXG4gICAgICAgIGlmIChsb29wTm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxvb3BOb2Rlcy5mb3JFYWNoKChsb29wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLWZvclwiXS5wdXNoKG5ldyBMb29wTm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogbG9vcCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXNcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHRoaXMuY2FuU2V0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5jYW5TZXQpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50Tm9kZXMgIDogRXZlbnRFbGVtZW50cyAgICAgICA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YU9uQXR0cih0aGlzLmVsZW1lbnQpLCBcclxuICAgICAgICAgICAgICAgIHRleHROb2RlcyAgIDogTm9kZUxpc3RPZjxFbGVtZW50PiAgID0gQ2hpbGRzSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhVGV4dEF0dHIodGhpcy5lbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIG1vZGVsTm9kZXMgIDogTm9kZUxpc3RPZjxFbGVtZW50PiAgID0gQ2hpbGRzSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhTW9kZWxBdHRyKHRoaXMuZWxlbWVudCksXHJcbiAgICAgICAgICAgICAgICBzaG93Tm9kZXMgICA6IE5vZGVMaXN0T2Y8RWxlbWVudD4gICA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YVNob3codGhpcy5lbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGJpbmROb2RlcyAgIDogQmluZENoaWxkW10gICA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YUJpbmQodGhpcy5lbGVtZW50LCB0aGlzKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vRXZlbnROb2Rlc1xyXG4gICAgICAgICAgICBpZiAoZXZlbnROb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZXZlbnRcIl0ucHVzaChuZXcgRXZlbnROb2RlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogbm9kZVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudDogbm9kZVsxXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0clZhbDogbm9kZVsyXSxcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vRGF0YS10ZXh0XHJcbiAgICAgICAgICAgIGlmICh0ZXh0Tm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZXMuZm9yRWFjaCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtdGV4dFwiXS5wdXNoKG5ldyBUZXh0Tm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vRGF0YS1zaG93XHJcbiAgICAgICAgICAgIGlmIChzaG93Tm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBzaG93Tm9kZXMuZm9yRWFjaCgoc2hvdykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtc2hvd1wiXS5wdXNoKG5ldyBTaG93Tm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHNob3cgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vVGV4dCBJbnB1dHMgd2l0aCBtb2RlbFxyXG4gICAgICAgICAgICBpZiAobW9kZWxOb2Rlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsTm9kZXMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLW1vZGVsXCJdLnB1c2gobmV3IE1vZGVsTm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGlucHV0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZihiaW5kTm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBiaW5kTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4gdGhpcy5jaGlsZHMhW1wiZGF0YS1iaW5kXCJdLnB1c2gobmV3IEJpbmROb2RlKG5vZGUpKSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlZnMgPSBPYmplY3QuZnJvbUVudHJpZXMoWy4uLkNoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YVJlZih0aGlzLmVsZW1lbnQpXVxyXG4gICAgICAgICAgICAgICAgLm1hcCgocmVmKSA9PiBbIHJlZi5nZXRBdHRyaWJ1dGUoXCJkYXRhLXJlZlwiKSEsIHJlZl0pKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHBhcnNlZCBkYXRhLCB3aXRoIHRoZSBnZXR0ZXIgYW5kIHNldHRlclxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IG9mIHRoZSB1bnBhcnNlZCBkYXRhIG9iamVjdFxyXG4gICAgICogQHBhcmFtIHthbnl9IHZhbHVlIHRoZSB2YWx1ZSBvZiB0aGF0IHByb3BlcnR5XHJcbiAgICAgKiBAcmV0dXJucyBUaGUgcGFyc2VkIGRhdGFcclxuICAgICAqL1xyXG4gICAgcGFyc2VkT2JqKG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IFBhcnNlZERhdGEge1xyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBub21icmU6IG5hbWUsXHJcbiAgICAgICAgICAgIF92YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU3luYyB0ZXh0IHdpdGggYWxsIGlucHV0cyB0aGF0IGhhdmUgdGhpcyB2YXJpYWJsZSBhcyBtb2RlbCBpbiB0aGVpciAnZGF0YS1tb2RlbCcgYXR0cmlidXRlXHJcbiAgICAgICAgICAgICAgICBzZWxmLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0uZmlsdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgICh0ZXh0KSA9PiAodGV4dC5fdmFyaWFibGUubm9tYnJlID09IHRoaXMubm9tYnJlKSAmJiAhKFtcInJhZGlvXCIsIFwiY2hlY2tib3hcIl0uaW5jbHVkZXModGV4dC5lbGVtZW50LnR5cGUpKVxyXG4gICAgICAgICAgICAgICAgKS5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5jaGlsZHMhW1wiZGF0YS1iaW5kXCJdLmZpbHRlcigobm9kZTogQmluZE5vZGUpID0+IG5vZGUudmFyaWFibGVzLmluY2x1ZGVzKHRoaXMubm9tYnJlKSlcclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgobm9kZSkgPT4gbm9kZS5zZXREYXRhKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgc2VsZi5jaGlsZHMhW1wiZGF0YS1tb2RlbFwiXS5maWx0ZXIoKGlucHV0KSA9PiBpbnB1dC52YXJpYWJsZSA9PSB0aGlzLm5vbWJyZSlcclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgoaW5wdXQpID0+IGlucHV0LmFzc2lnblRleHQodmFsdWUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmNoaWxkcyFbXCJkYXRhLXNob3dcIl0uZmlsdGVyKChub2RlKSA9PiBub2RlLnZhcmlhYmxlLm5vbWJyZSA9PSB0aGlzLm5vbWJyZSlcclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgoc2hvdykgPT4gc2hvdy50b2dnbGVIaWRkZW4oKSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldCB2YWx1ZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGEgY3VzdG9tIGV2ZW50IGluIHRoZSBzY29wZSBvZiB0aGUgZGF0YS1hdHRhY2hlZFxyXG4gICAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0eXBlLCB0aGUgZWxlbWVudCwgYW5kIHRoZSBmdW5jdGlvbiB3aXRob3V0IGV4ZWN1dGluZ1xyXG4gICAgICovXHJcbiAgICBzZXRFdmVudChldmVudDogQ2hldmVyZUV2ZW50KSB7XHJcbiAgICAgICAgZXZlbnQuZWxlbS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LnR5cGUsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LmFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgICAgICRhcmdzOiBldmVudC5hcmdzLFxyXG4gICAgICAgICAgICAgICAgJG1hZ2ljczogTWFnaWNzLFxyXG4gICAgICAgICAgICAgICAgJGV2ZW50OiBlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZURhdGFcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZU5vZGVcIjsiLCJpbXBvcnQgeyBCaW5kQ2hpbGQsIEV2ZW50RWxlbWVudHMgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgQ2hldmVyZU5vZGUgfSBmcm9tIFwiQGNoZXZlcmVcIjtcclxuaW1wb3J0IHsgUGF0dGVybnMgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBDaGlsZHNIZWxwZXIgPSB7XHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YU9uQXR0cihlbGVtZW50OiBFbGVtZW50KTogRXZlbnRFbGVtZW50cyB7XHJcbiAgICAgICAgbGV0IG5vZGVzOiBFdmVudEVsZW1lbnRzID0gW107XHJcblxyXG4gICAgICAgIC8vR2V0IGFsbCBjaGlsZHMgb2YgdGhlIGVsZW1lbnRcclxuICAgICAgICBjb25zdCBjaGlsZHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpO1xyXG5cclxuICAgICAgICAvL1B1c2ggdG8gYG5vZGVzYCBhbGwgZWxlbWVudHMgd2l0aCB0aGUgJ2RhdGEtb24nIG9yICdAb24nIGF0dHJpYnV0ZVxyXG4gICAgICAgIGZvcihsZXQgY2hpbGQgb2YgY2hpbGRzKSB7XHJcbiAgICAgICAgICAgIGZvcihsZXQgYXR0ciBvZiBjaGlsZC5hdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZihhdHRyLm5hbWUuc3RhcnRzV2l0aChcImRhdGEtb25cIikpIFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goW2NoaWxkLCBhdHRyLm5hbWUuc3BsaXQoXCI6XCIpWzFdLCBhdHRyLm5vZGVWYWx1ZSFdKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJAb25cIikpIFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goW2NoaWxkLCBhdHRyLm5hbWUucmVwbGFjZShcIkBvblwiLCBcIlwiKS50b0xvd2VyQ2FzZSgpLCBhdHRyLm5vZGVWYWx1ZSFdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gKG5vZGVzLmxlbmd0aCA9PSAwKSA/IHVuZGVmaW5lZCA6IG5vZGVzO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhQmluZChlbGVtZW50OiBFbGVtZW50LCBub2RlOiBDaGV2ZXJlTm9kZSk6IEJpbmRDaGlsZFtdIHtcclxuICAgICAgICByZXR1cm4gWy4uLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipcIildLmZpbHRlcigoZSkgPT4gXHJcbiAgICAgICAgICAgIFsuLi5lLmF0dHJpYnV0ZXNdLnNvbWUoKGF0dHIpID0+IFBhdHRlcm5zLmJpbmQuYXR0ci50ZXN0KGF0dHIubmFtZSkpXHJcbiAgICAgICAgKS5tYXAoKGVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgbGV0IGF0dHI6IHN0cmluZyA9IFsuLi5lbGVtZW50LmF0dHJpYnV0ZXNdLm1hcCgoYXR0cikgPT4gYXR0ci5uYW1lKS5maW5kKChhdHRyKSA9PiBQYXR0ZXJucy5iaW5kLmF0dHIudGVzdChhdHRyKSkhO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG1vZGlmaWVyID0gUGF0dGVybnMuYmluZC5zdHJpbmcudGVzdChlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKSEpIFxyXG4gICAgICAgICAgICAgICAgPyBcInN0cmluZ1wiXHJcbiAgICAgICAgICAgICAgICA6IFBhdHRlcm5zLmJpbmQub2JqZWN0LnRlc3QoZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cikhKSA/IFwib2JqZWN0XCJcclxuICAgICAgICAgICAgICAgIDogXCJcIjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7IFxyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogbm9kZSxcclxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZTogYXR0cixcclxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllcjogbW9kaWZpZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKSEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHIpISxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFUZXh0QXR0cihlbGVtZW50OiBFbGVtZW50KTogTm9kZUxpc3RPZjxFbGVtZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS10ZXh0XVwiKTtcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YU1vZGVsQXR0cihlbGVtZW50OiBFbGVtZW50KTogTm9kZUxpc3RPZjxFbGVtZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlucHV0W2RhdGEtbW9kZWxdLCB0ZXh0YXJlYVtkYXRhLW1vZGVsXSwgc2VsZWN0W2RhdGEtbW9kZWxdXCIpO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhRm9yKGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEhUTUxUZW1wbGF0ZUVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbZGF0YS1mb3JdXCIpO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhU2hvdyhlbGVtZW50OiBFbGVtZW50KTogTm9kZUxpc3RPZjxFbGVtZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS1zaG93XVwiKTtcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YVJlZihlbGVtZW50OiBFbGVtZW50KTogTm9kZUxpc3RPZjxFbGVtZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS1yZWZdXCIpO1xyXG4gICAgfVxyXG59OyIsImltcG9ydCB7IEFyZ3NFcnJvcnMsIENvbXBhcmVBcmd1bWVudHMsIFBhcnNlZEFyZ3MgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuLyoqXHJcbiAqIEhlbHBlciBjbGFzcywgaXQgcHJvdmlkZSB1c2VmdWxsIG1ldGhvZHMgdG8gQ2hldmVyZSBlbGVtZW50c1xyXG4gKiBAY2xhc3NcclxuICovXHJcbmV4cG9ydCBjb25zdCBIZWxwZXIgPSB7XHJcbiAgICBpc0VtcHR5KG9iajogb2JqZWN0KSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09IDA7XHJcbiAgICB9LFxyXG4gICAgc2V0RGF0YUlkKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgZmluYWw6IHN0cmluZyA9IFwiXCI7XHJcblxyXG4gICAgICAgIGNvbnN0IHJvdW5kZWQ6IEZ1bmN0aW9uID0gKG51bTogbnVtYmVyKTogbnVtYmVyID0+IH5+KE1hdGgucmFuZG9tKCkgKiBudW0pO1xyXG5cclxuICAgICAgICBjb25zdCBjaGFyczogeyBbdHlwZTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XHJcbiAgICAgICAgICAgIGxldHRlcnMgOiBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCIsXHJcbiAgICAgICAgICAgIG1heXVzICAgOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXHJcbiAgICAgICAgICAgIG51bWJlcnMgOiBcIjAxMjM0NTY3ODlcIixcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsZW5ndGg7IGkrKykgZmluYWwgKz0gY2hhcnNbT2JqZWN0LmtleXMoY2hhcnMpW3JvdW5kZWQoMildXVtyb3VuZGVkKGxlbmd0aCldO1xyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9LFxyXG4gICAgY2hlY2tGb3JFcnJvckluVmFyaWFibGUoc3RyOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAoL15bMC05XXxcXFcvZy50ZXN0KHN0cikpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcclxuICAgICAgICAgICAgICAgIFwiVmFyaWFibGUgbmFtZSBjYW5ub3Qgc3RhcnQgd2l0aCBhIG51bWJlciBvciBoYXZlIHNwYWNlc1wiLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgfSxcclxuICAgIGh0bWxBcmdzRGF0YUF0dHIoZGF0YUF0dGFjaGVkOiBzdHJpbmcpOiBQYXJzZWRBcmdzIHtcclxuICAgICAgICBpZighZGF0YUF0dGFjaGVkLm1hdGNoKC9cXCguK1xcKS9nKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgb25seUF0dHJzOiBzdHJpbmcgPSBkYXRhQXR0YWNoZWQudHJpbSgpLnJlcGxhY2UoLy4qXFwofFxcKS4qL2csIFwiXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gKG9ubHlBdHRycykgPyBvbmx5QXR0cnMuc3BsaXQoXCIsXCIpIDogdW5kZWZpbmVkO1xyXG4gICAgfSxcclxuICAgIG1ldGhvZEFyZ3VtZW50cyhtZXRob2Q6IEZ1bmN0aW9uKTogUGFyc2VkQXJncyB7XHJcbiAgICAgICAgbGV0IG9ubHlBcmdzOiBzdHJpbmcgPSBtZXRob2QudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFx7LiovZ3MsIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8uK1xcKHxcXCkuKy9nLCBcIlwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChvbmx5QXJncykgPyBvbmx5QXJncy5zcGxpdChcIixcIikgOiB1bmRlZmluZWQ7ICAgICAgICAgICAgXHJcbiAgICB9LFxyXG4gICAgZ2V0UmVhbFZhbHVlc0luQXJndW1lbnRzKGRhdGE6IEFyZ3NFcnJvcnMpOiBhbnlbXSB7XHJcbiAgICAgICAgbGV0IGZpbmFsOiBhbnlbXSA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZpbmFsID0gZGF0YS5hcmdzLm1hcCgoYXJnKSA9PiBuZXcgRnVuY3Rpb24oYHJldHVybiAke2FyZ31gKSgpKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgICBgJHtlcnJvcn0sIGNoZWNrIHRoZSB2YWx1ZXMgb2YgeW91ciAke2RhdGEubWV0aG9kfSwgYXQgb25lIG9mIHlvdXIgJyR7ZGF0YS5uYW1lfScgY29tcG9uZW50c2AsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9LFxyXG4gICAgY29tcGFyZUFyZ3VtZW50cyhkYXRhOiBDb21wYXJlQXJndW1lbnRzKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGVycm9yUHJlOiBzdHJpbmcgPSBgVGhlICR7ZGF0YS5tZXRob2R9IGZ1bmN0aW9uIG9mIHRoZSAke2RhdGEuY29tcG9uZW50fSgpIGNvbXBvbmVudCBgOyAgICAgICAgXHJcblxyXG4gICAgICAgIHN3aXRjaCh0cnVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgKCghZGF0YS5odG1sQXJncykgJiYgKCFkYXRhLm1ldGhvZEFyZ3MpKToge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoZGF0YS5odG1sQXJncyAhPSB1bmRlZmluZWQpICYmICghZGF0YS5tZXRob2RBcmdzKSk6IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclByZSArIGBkb2Vzbid0IHJlY2VpdmUgYW55IHBhcmFtZXRlcmApO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoIWRhdGEuaHRtbEFyZ3MpICYmIChkYXRhLm1ldGhvZEFyZ3MgIT0gdW5kZWZpbmVkKSk6IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclByZSArIGBuZWVkcyB0byByZWNlaXZlICR7ZGF0YS5tZXRob2RBcmdzfSBwYXJhbWV0ZXJzLCAwIHBhc3NlZGApO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoZGF0YS5tZXRob2RBcmdzPy5sZW5ndGgpICE9IChkYXRhLmh0bWxBcmdzPy5sZW5ndGgpKToge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yUHJlICsgYG5lZWRzIHRvIHJlY2VpdmUgICR7ZGF0YS5tZXRob2RBcmdzPy5sZW5ndGh9IHBhcmFtZXRlcnMsIFxyXG4gICAgICAgICAgICAgICAgICAgICR7ZGF0YS5odG1sQXJncz8ubGVuZ3RofSBwYXNzZWRgKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb250ZW50T2ZGdW5jdGlvbihmdW5jOiBGdW5jdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmMudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvLitcXHt8XFx9JC9ncywgXCJcIilcclxuICAgICAgICAgICAgLnRyaW0oKTtcclxuICAgIH0sXHJcbiAgICBuYW1lT2ZGdW5jdGlvbihhdHRyOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBhdHRyLnRyaW0oKS5yZXBsYWNlKC9cXCguKy8sXCJcIik7XHJcbiAgICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZSB9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBJbmxpbmVQYXJzZXIsIFBhcnNlZEZvciwgUGFyc2VkVGV4dCwgQXR0cmlidXRlLCBQYXJzZWRTaG93LCBQYXJzZWREYXRhIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IFBhdHRlcm5zIH0gZnJvbSBcIi4vUGF0dGVybnNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBQYXJzZXI6IElubGluZVBhcnNlciA9IHtcclxuICAgIGVzY2FwZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlQWxsKFwiJFwiLCBcIlxcXFwkXCIpLnJlcGxhY2VBbGwoXCIuXCIsIFwiXFxcXC5cIik7XHJcbiAgICB9LFxyXG4gICAgcGFyZW50RXNjYXBlKHBhcmVudDogUGFyc2VkRGF0YSk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgcGFyZW50LnZhbHVlID09IFwic3RyaW5nXCIpID8gYFwiJHtwYXJlbnQudmFsdWV9XCJgOiBwYXJlbnQudmFsdWU7IFxyXG4gICAgfSxcclxuICAgIHBhcnNlQXJncyhhcmdzOiBzdHJpbmdbXSwgZGF0YTogQ2hldmVyZU5vZGUsIHR5cGVPZk1ldGhvZDogc3RyaW5nKTogYW55W10ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzLm1hcCgodikgPT5cclxuICAgICAgICAgICAgICAgICghUGF0dGVybnMuYmluZC4kdGhpcy50ZXN0KHYpKSBcclxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMucGFyc2VyKHYpIFxyXG4gICAgICAgICAgICAgICAgICAgIDogKCh0eXBlT2ZNZXRob2QgIT0gXCJtYWdpY1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMucGFyc2VyKHYucmVwbGFjZUFsbChQYXR0ZXJucy5iaW5kLiR0aGlzLCB0aGlzLnBhcmVudEVzY2FwZShkYXRhLmRhdGFbdi5yZXBsYWNlKFwiJHRoaXMuZGF0YS5cIiwgXCJcIildKSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZGF0YS5kYXRhW3YucmVwbGFjZShcIiR0aGlzLmRhdGEuXCIsIFwiXCIpXSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhcmdzO1xyXG4gICAgfSxcclxuICAgIHBhcnNlcihleHByOiBhbnkpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oYHJldHVybiAke2V4cHJ9YCkoKTtcclxuICAgIH0sXHJcbiAgICBwYXJzZWREYXRhU2hvd0F0dHIoZGF0YTogQXR0cmlidXRlKTogUGFyc2VkU2hvdyB7XHJcbiAgICAgICAgbGV0IHZhbCA9IChQYXR0ZXJucy52YXJzLnZhcmlhYmxlRXhwcmVzc2lvbi50ZXN0KGRhdGEuYXR0cikpIFxyXG4gICAgICAgICAgICA/IGRhdGEuYXR0ci5yZXBsYWNlKFBhdHRlcm5zLnZhcnMudmFsdWUsIFwiXCIpLnRyaW0oKVxyXG4gICAgICAgICAgICA6IE9iamVjdC5lbnRyaWVzKFBhdHRlcm5zLnNob3cpLmZpbmQoKFssIHJlZ2V4cF0pID0+IHJlZ2V4cC50ZXN0KGRhdGEuYXR0cikpIVswXTtcclxuXHJcbiAgICAgICAgbGV0IHBhcnNlID0gYCR7KChQYXR0ZXJucy52YXJzLmVxdWFsaXR5LmV4ZWMoZGF0YS5hdHRyKSkgfHwgW1wiPT1cIl0pWzBdfSAke3ZhbH1gO1xyXG5cclxuICAgICAgICBjb25zdCB2YXJOYW1lOiBzdHJpbmcgPSBkYXRhLmF0dHIubWF0Y2goL1xcdysvKSFbMF0sXHJcbiAgICAgICAgICAgIHBhcmVudFZhciA9IGRhdGEubm9kZS5kYXRhW3Zhck5hbWVdO1xyXG5cclxuICAgICAgICBpZighcGFyZW50VmFyKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYEEgZGF0YSB3aXRoIHRoZSAnJHt2YXJOYW1lfScgY291bGRuJ3QgYmUgZm91bmQgaW4gdGhlICcke2RhdGEubm9kZS5uYW1lfSdgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdmFyaWFibGU6IHBhcmVudFZhciwgXHJcbiAgICAgICAgICAgIHZhbHVlOiBwYXJzZSxcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIHBhcnNlRGF0YVRleHRBdHRyKGRhdGE6IEF0dHJpYnV0ZSk6IFBhcnNlZFRleHQge1xyXG4gICAgICAgIGxldCB0eXBlID0gT2JqZWN0LmtleXMoUGF0dGVybnMudGV4dClcclxuICAgICAgICAgICAgLmZpbmQoKHBhdHRlcm4pID0+IFBhdHRlcm5zLnRleHRbcGF0dGVybl0udGVzdChkYXRhLmF0dHIpKTtcclxuXHJcbiAgICAgICAgaWYoIXR5cGUpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJUaGUgdmFsdWUgb2YgdGhlICdkYXRhLXRleHQnIGF0dHJpYnV0ZSBjb250YWlucyBpbnZhbGlkIGV4cHJlc3Npb25zXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHZhck5hbWU6IHN0cmluZyA9IFBhdHRlcm5zLnRleHQuanVzdFZhcmlhYmxlLmV4ZWMoZGF0YS5hdHRyKSFbMF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBhcnNlZDogUGFyc2VkVGV4dCA9IHsgdmFyaWFibGU6IGRhdGEubm9kZS5kYXRhW3Zhck5hbWVdIH07XHJcblxyXG4gICAgICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJqdXN0VmFyaWFibGVcIiA6IHtcclxuICAgICAgICAgICAgICAgIHBhcnNlZC52YWx1ZSA9IHBhcnNlZC52YXJpYWJsZS52YWx1ZTtcclxuICAgICAgICAgICAgfSBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJzaW5nbGVPYmplY3RcIiA6IHtcclxuICAgICAgICAgICAgICAgIHBhcnNlZC52YWx1ZSA9IHBhcnNlZC52YXJpYWJsZS52YWx1ZVtkYXRhLmF0dHIubWF0Y2goUGF0dGVybnMudGV4dC5pbmRleFZhbHVlKSFbMF1dO1xyXG4gICAgICAgICAgICB9IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBcIm5lc3RlZE9iamVjdFwiIDoge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBzZXBhcmVkOiBzdHJpbmdbXSA9IGRhdGEuYXR0ci5zcGxpdCgvXFxbfFxcXXxcXC58XFwnL2cpLmZpbHRlcih3ID0+IHcgIT09IFwiXCIpLnNsaWNlKDEpLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogbnVtYmVyID0gc2VwYXJlZC5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZmluZE5lc3RlZFByb3AodmFyaWFibGU6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9LCBwb3M6IG51bWJlciA9IDApOiBhbnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBvYmogPSB2YXJpYWJsZVtzZXBhcmVkW3Bvc11dO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAocG9zID09IGxlbmd0aC0xKSA/IG9iaiA6IGZpbmROZXN0ZWRQcm9wKG9iaiwgcG9zICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcnNlZC52YWx1ZSA9IGZpbmROZXN0ZWRQcm9wKHBhcnNlZC52YXJpYWJsZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcGFyc2VkO1xyXG4gICAgfSxcclxuICAgIHBhcnNlRGF0YUZvckF0dHIoZGF0YTogQXR0cmlidXRlKTogUGFyc2VkRm9yIHtcclxuICAgICAgICBsZXQgcGFyc2VkRGF0YTogUGFyc2VkRm9yID0ge307XHJcblxyXG4gICAgICAgIGxldCBleHByZXNzaW9uczogc3RyaW5nW10gPSBkYXRhLmF0dHIuc3BsaXQoXCIgXCIpO1xyXG5cclxuICAgICAgICBpZihleHByZXNzaW9ucy5sZW5ndGggPiAzKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1mb3InIGF0dHJpYnV0ZSBjb250YWlucyBpbnZhbGlkIGV4cHJlc3Npb25zXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHBhcnNlZERhdGEuZXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucztcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdmFyaWFibGUgPSBPYmplY3Qua2V5cyhkYXRhLm5vZGUuZGF0YSkuZmluZCgodmFyaWFibGUpID0+IHZhcmlhYmxlID09IGV4cHJlc3Npb25zWzJdKTtcclxuXHJcbiAgICAgICAgaWYoIXZhcmlhYmxlKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBBIHZhcmlhYmxlIHdpdGggdGhlIG5hbWUgJHtleHByZXNzaW9uc1syXX0gY291bGRuJ3QgYmUgZm91bmQgaW4gdGhlIGRhdGEgb2YgeW91ciAke2RhdGEubm9kZS5uYW1lfSgpIGNvbXBvbmVudGApO1xyXG4gICAgICAgIGVsc2UgcGFyc2VkRGF0YS52YXJpYWJsZSA9IGRhdGEubm9kZS5kYXRhW3ZhcmlhYmxlXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZERhdGE7XHJcbiAgICB9LFxyXG59OyIsImltcG9ydCB7IFBhcnNlZERhdGEgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBNYWdpY3M6IHsgW2Z1bmM6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7XHJcbiAgICBpbmNyZW1lbnQodmFyaWFibGU6IFBhcnNlZERhdGEpOiB2b2lkIHtcclxuICAgICAgICB2YXJpYWJsZS52YWx1ZSsrO1xyXG4gICAgfSxcclxuICAgIGRlY3JlbWVudCh2YXJpYWJsZTogUGFyc2VkRGF0YSk6IHZvaWQge1xyXG4gICAgICAgIHZhcmlhYmxlLnZhbHVlLS07XHJcbiAgICB9LFxyXG4gICAgdG9nZ2xlKHZhcmlhYmxlOiBQYXJzZWREYXRhKTogdm9pZCB7XHJcbiAgICAgICAgdmFyaWFibGUudmFsdWUgPSAhdmFyaWFibGUudmFsdWU7XHJcbiAgICB9LFxyXG4gICAgc2V0KHZhcmlhYmxlOiBQYXJzZWREYXRhLCB2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICAgICAgdmFyaWFibGUudmFsdWUgPSB2YWx1ZTtcclxuICAgIH0sXHJcbn07IiwiaW1wb3J0IHsgUGF0dGVybiB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBhdHRlcm5zOiBQYXR0ZXJuID0ge1xyXG4gICAgbWFnaWNzOiB7XHJcbiAgICAgICAgZWw6IC9cXCRlbC8sXHJcbiAgICAgICAgY2hlY2tNYWdpYzogL15cXCRtYWdpY3MuLyxcclxuICAgIH0sXHJcbiAgICB2YXJzOiB7XHJcbiAgICAgICAgdmFyaWFibGVFeHByZXNzaW9uOiAvXlthLXpBLVpdKyhcXHMpPyg8fD58IXw9KT89L2csXHJcbiAgICAgICAgdmFyaWFibGVOYW1lOiAvXlthLXpBLVpdKy8sXHJcbiAgICAgICAgZXF1YWxpdHk6IC8oPHw+fCEpPz17MSwzfS9nLFxyXG4gICAgICAgIHZhbHVlOiAvXi4qKDx8Pnw9KS9nLFxyXG4gICAgfSxcclxuICAgIHRleHQ6IHtcclxuICAgICAgICBqdXN0VmFyaWFibGU6IC9eW2EtekEtWl0rJC8sXHJcbiAgICAgICAgc2luZ2xlT2JqZWN0IDogL15bYS16QS1aXSsoKFxcLlthLXpBLXpdKil8KFxcW1swLTldezEsfVxcXSkpJC8sXHJcbiAgICAgICAgbmVzdGVkT2JqZWN0OiAvXlthLXpBLVpdKygoXFwufFxcWylbYS16QS1aMC05XSsoXFwufFxcXSk/KXsxLH1bYS16QS16XSQvXHJcbiAgICB9LFxyXG4gICAgc2hvdzoge1xyXG4gICAgICAgIHRydWU6IC9eW2EtekEtWl0rJC8sXHJcbiAgICAgICAgZmFsc2U6IC9eXFwhW2EtekEtWl0rJC8sXHJcbiAgICB9LFxyXG4gICAgYXR0cjoge1xyXG4gICAgICAgIGlzTWFnaWM6IC9eKFxcJG1hZ2ljcykvLFxyXG4gICAgICAgIGlzTWV0aG9kOiAvXlthLXpBLVpdK1xcKC8sXHJcbiAgICAgICAgbWV0aG9kTmFtZTogLyg/PS4pKFxcdyspKD89XFwoKS8sXHJcbiAgICAgICAgbWV0aG9kQXJnczogLyg/PD1cXCgpLiooPz1cXCkpL1xyXG4gICAgfSxcclxuICAgIGJpbmQ6IHtcclxuICAgICAgICBzdHJpbmc6IC9eKFxcYCkuKlxcMSQvLFxyXG4gICAgICAgIG9iamVjdDogL15cXHsuKlxcfSQvLFxyXG4gICAgICAgICR0aGlzOiAvXFwkdGhpc1xcLmRhdGFcXC5bYS16QS1aXSsvZyxcclxuICAgICAgICBhdHRyOiAvXihAfGRhdGEtKWJpbmQoOik/LyxcclxuICAgICAgICBiaW5kYWJsZTogLyg/PD1eKEB8ZGF0YS0pYmluZCg6KT8pXFx3Ky8sXHJcbiAgICAgICAgbW9kaWZpZXI6IC8oPzw9XFwuKS4qLyxcclxuICAgICAgICB2YXJpYWJsZTogLyg/PD1cXCR0aGlzXFwuZGF0YVxcLilcXHcrLyxcclxuICAgIH1cclxufTsiLCJleHBvcnQgKiBmcm9tIFwiLi9IZWxwZXJcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vTWFnaWNzXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0NoaWxkc0hlbHBlclwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9JbmxpbmVQYXJzZXJcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUGF0dGVybnNcIjsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgQ2hldmVyZVdpbmRvdywgQ2hldmVyZU5vZGVEYXRhLCBDaGV2ZXJleE5vZGVMaXN0LCBDaGV2ZXJleERhdGFOb2RlLCBBcmd1bWVudHMgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcbmltcG9ydCB7Q2hldmVyZU5vZGUsIENoZXZlcmVEYXRhfSBmcm9tIFwiQGNoZXZlcmVcIjtcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCJAaGVscGVyc1wiO1xuXG5jb25zdCBDaGV2ZXJlOiBDaGV2ZXJlV2luZG93ID0ge1xuICAgbm9kZXM6IFtdLFxuICAgLyoqXG4gICAgKiBGaW5kIGEgQ2hldmVyZURhdGEgYnkgdGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1hdHRhY2hlZCcgYXR0cmlidXRlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0clxuICAgICogQHBhcmFtIHtDaGV2ZXJlRGF0YVtdfSBkYXRhXG4gICAgKiBAcmV0dXJucyBUaGUgZGF0YSByZWFkeSBmb3IgaW5zdGFuY2UgYSBOb2RlTGlzdE9mPEVsZW1lbnQ+XG4gICAgKi9cbiAgIGZpbmRJdHNEYXRhKGF0dHI6IHN0cmluZywgZGF0YTogQ2hldmVyZURhdGFbXSk6IENoZXZlcmVEYXRhIHtcbiAgICAgICBsZXQgc2VhcmNoOiBDaGV2ZXJlRGF0YSB8IHVuZGVmaW5lZCA9IGRhdGEuZmluZCgoZCkgPT4gZC5uYW1lID09IGF0dHIudHJpbSgpLnJlcGxhY2UoL1xcKC4qXFwpLywgXCJcIikpO1xuXG4gICAgICAgIGlmKCFzZWFyY2gpIFxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGAnJHthdHRyfScgY291bGRuJ3QgYmUgZm91bmQgaW4gYW55IG9mIHlvdXIgZGVjbGFyZWQgY29tcG9uZW50c2ApO1xuXG4gICAgICAgcmV0dXJuIHNlYXJjaDtcbiAgIH0sXG4gICAvKipcbiAgICAqIFNlYXJjaCBmb3IgQ2hldmVyZSBOb2RlcyBhdCB0aGUgc2l0ZVxuICAgICogQHBhcmFtIGRhdGEgQWxsIHRoZSBDaGV2ZXJlIGNvbXBvbmVudHNcbiAgICAqL1xuICAgIHN0YXJ0KC4uLmRhdGE6IENoZXZlcmVEYXRhW10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHM6IENoZXZlcmV4Tm9kZUxpc3QgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdltkYXRhLWF0dGFjaGVkXVwiKV1cbiAgICAgICAgICAgIC5tYXAoKGVsZW1lbnQpID0+ICh7IGVsZW06IGVsZW1lbnQsIGRhdGFBdHRyOiBlbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtYXR0YWNoZWRcIil9KSk7XG5cbiAgICAgICAvL0NyZWF0ZSBhIENoZXZlcmVOb2RlIGZvciBlYWNoIGRhdGEtYXR0YWNoZWRcbiAgICAgICBlbGVtZW50cy5mb3JFYWNoKChlbDogQ2hldmVyZXhEYXRhTm9kZSkgPT4ge1xuICAgICAgICAgICBjb25zdCBub2RlOiBDaGV2ZXJlRGF0YSA9IHRoaXMuZmluZEl0c0RhdGEoZWwuZGF0YUF0dHIhLCBkYXRhKTtcblxuICAgICAgICAgICBpZigobm9kZS5pbml0ID09IHVuZGVmaW5lZCkgJiYgKEhlbHBlci5odG1sQXJnc0RhdGFBdHRyKGVsLmRhdGFBdHRyISkgIT0gdW5kZWZpbmVkKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZXJlJ3Mgbm8gaW5pdCBtZXRob2QgZGVmaW5lZCBpbiB5b3VyICcke25vZGUubmFtZX0nIGNvbXBvbmVudGApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAvL0lmIHRoZSBpbml0IG1ldGhvZCBpc24ndCB1bmRlZmluZWRcbiAgICAgICAgICAgaWYobm9kZS5pbml0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vQ2hlY2sgZm9yIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgIGxldCBhcmdzOiBBcmd1bWVudHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRBcmdzOiBIZWxwZXIubWV0aG9kQXJndW1lbnRzKG5vZGUuaW5pdCksXG4gICAgICAgICAgICAgICAgICAgIEhUTUxBcmdzOiBIZWxwZXIuaHRtbEFyZ3NEYXRhQXR0cihlbC5kYXRhQXR0ciEpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICogQ2hlY2sgdGhlIGRpZmYgYmV0d2VlbiB0aGUgYXJ1bWVudHMgYXQgdGhlIEhUTUwgYW5kIHRob3NlIG9uZXMgZGVjbGFyZWQgYXQgXG4gICAgICAgICAgICAgICAgKiB0aGUgaW5pdCgpIG1ldGhvZFxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrRm9ySW5pdEFyZ3VtZW50czogYm9vbGVhbiA9IEhlbHBlci5jb21wYXJlQXJndW1lbnRzKHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJpbml0KClcIixcbiAgICAgICAgICAgICAgICAgICAgaHRtbEFyZ3M6IGFyZ3MuSFRNTEFyZ3MsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZEFyZ3M6IGFyZ3MuaW5pdEFyZ3NcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIChhc3luYygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy9JZiB0aGVyZSdzIG5vIGVycm9ycywgcGFyc2UgdGhlIGFyZ3VtZW50cywgYW5kIGV4ZWN1dGUgdGhlIGluaXQoKSBtZXRob2RcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChjaGVja0ZvckluaXRBcmd1bWVudHMpIFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBhd2FpdCBub2RlLnBhcnNlQXJndW1lbnRzKGFyZ3MuSFRNTEFyZ3MhLCBhcmdzLmluaXRBcmdzISkgXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGF3YWl0IG5vZGUucGFyc2VJbml0KHsgaW5pdDogbm9kZS5pbml0ISB9KTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5ldyBDaGV2ZXJlTm9kZShub2RlLCBlbC5lbGVtKSk7XG4gICAgICAgfSk7XG4gICB9LFxuICAgZGF0YShkYXRhOiBDaGV2ZXJlTm9kZURhdGEpOiBDaGV2ZXJlRGF0YSB7XG4gICAgICAgcmV0dXJuIG5ldyBDaGV2ZXJlRGF0YShkYXRhKTtcbiAgIH0sXG59O1xuXG53aW5kb3cuQ2hldmVyZSA9IENoZXZlcmU7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9