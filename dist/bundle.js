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
        switch (this.bindAttr.name) {
            case "style":
                (this.attribute.modifier == "object")
                    ? Object.assign(this.element.style, this.parse(this.attribute.values.original))
                    : (this.element.style.cssText =
                        this.parse(this.attribute.values.original) + (this.bindAttr.value ?? ""));
                break;
            case "class":
                {
                    this.element.className = `${this.parse(this.attribute.values.original)} ${(this.bindAttr.value ?? "")}`;
                }
                break;
        }
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
        this.method = this.searchMethod();
        this.args = this.findArguments();
        //If everything is ok, then set the Event
        this.parent?.setEvent({
            elem: this.element,
            action: this.method,
            type: this.event,
            args: this.args
        });
    }
    findArguments() {
        let methodName = this.attrVal.trim().replace(/\(.*/, "");
        if ((!this.parent.args[methodName]) || (_helpers_1.Helper.isEmpty(this.parent.args[methodName])))
            return;
        //The args
        const args = {
            htmlArgs: _helpers_1.Helper.htmlArgsDataAttr(this.attrVal),
            parentArgs: this.parent.args[methodName]
        };
        //Check for errors in the argments
        _helpers_1.Helper.compareArguments({
            method: methodName,
            component: this.parent.name,
            htmlArgs: args.htmlArgs,
            methodArgs: args.parentArgs,
        });
        let final = _helpers_1.Helper.getRealValuesInArguments({
            args: args.htmlArgs,
            name: this.parent.name,
            method: methodName
        });
        //Create the argument object
        let argsObj = {};
        for (let i in args.parentArgs)
            argsObj[args.parentArgs[+(i)]] = final[+(i)];
        return argsObj;
    }
    searchMethod() {
        let val = this.attrVal.trim().replace(/\(.*/g, "");
        let method = this.parent.methods[val];
        if (!method)
            throw new ReferenceError(`There's no a method named '${val}' in the data-attached scope`);
        return method;
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
            return {
                element: element,
                parent: node,
                attribute: {
                    attribute: attr,
                    modifier: (attr.match(_helpers_1.Patterns.bind.modifier) ?? ["string"])[0],
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
    bind: {
        string: /^(\`).*\1$/,
        object: /^\{.*\}$/,
        $this: /\$this\.data\.[a-zA-Z]+/g,
        attr: /^(@|data-)bind(:)?/,
        bindable: /(?<=^(@|data-)bind(:)?)\w+/,
        modifier: /(?<=\.).*/,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsUUFBUyxDQUFDO2lCQUNsRCxDQUFDO2dCQUVGOzs7a0JBR0U7Z0JBQ0YsSUFBSSxxQkFBcUIsR0FBWSxpQkFBTSxDQUFDLGdCQUFnQixDQUFDO29CQUN6RCxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ3BCLE1BQU0sRUFBRSxRQUFRO29CQUNoQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7b0JBQ3ZCLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUTtpQkFDNUIsQ0FBQyxDQUFDO2dCQUVILENBQUMsS0FBSyxJQUFHLEVBQUU7b0JBQ1AsMEVBQTBFO29CQUMxRSxPQUFPLENBQUMscUJBQXFCLENBQUM7d0JBQzFCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVMsRUFBRSxJQUFJLENBQUMsUUFBUyxDQUFDO3dCQUMzRCxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQ1I7WUFBQSxDQUFDO1lBRUYsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBVyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxJQUFJLENBQUMsSUFBcUI7UUFDdEIsT0FBTyxJQUFJLHNCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNILENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9CaW5kTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvRXZlbnROb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9Mb29wTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvTW9kZWxOb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9TaG93Tm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvVGV4dE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL2luZGV4LnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvY2hldmVyZS9DaGV2ZXJlRGF0YS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvQ2hldmVyZU5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9jaGV2ZXJlL2luZGV4LnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvQ2hpbGRzSGVscGVyLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvSGVscGVyLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvSW5saW5lUGFyc2VyLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvTWFnaWNzLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvUGF0dGVybnMudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hldmVyZU5vZGUgfSBmcm9tIFwiQGNoZXZlcmVcIjtcclxuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcbmltcG9ydCB7IEJpbmRBdHRyLCBCaW5kQ2hpbGQsIEV4cEF0dHJpYnV0ZSB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBQYXR0ZXJucyB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5cclxuLyoqXHJcbiAqICBDbGFzcyBmb3IgdGhlIGVsZW1lbnRzIHRoYXQgaGF2ZSBlaXRoZXIgdGhlIFwiZGF0YS1iaW5kXCIgb3IgXCJAYmluZFwiIGF0dHJpYnV0ZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJpbmROb2RlIGltcGxlbWVudHMgQmluZENoaWxkIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIFwiZGF0YS1iaW5kXCIvXCJAYmluZFwiIGF0dHJpYnV0ZSBkYXRhXHJcbiAgICAgKiBAcHJvcGVydHkge0V4cEF0dHJ9XHJcbiAgICAgKi9cclxuICAgIGF0dHJpYnV0ZSAgIDogRXhwQXR0cmlidXRlOyBcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJpbmRhYmxlIGF0dHJpYnV0ZSBkYXRhXHJcbiAgICAgKiBAcHJvcGVydHkge0JpbmRBdHRyfVxyXG4gICAgICovXHJcbiAgICBiaW5kQXR0ciAgICA6IEJpbmRBdHRyO1xyXG5cclxuICAgIGVsZW1lbnQgICAgIDogSFRNTEVsZW1lbnR8SFRNTElucHV0RWxlbWVudDtcclxuICAgIHBhcmVudCAgICAgIDogQ2hldmVyZU5vZGU7XHJcbiAgICB2YXJpYWJsZXMgICA6IHN0cmluZ1tdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IEJpbmRDaGlsZCkge1xyXG4gICAgICAgICh7IFxyXG4gICAgICAgICAgICBlbGVtZW50ICAgICA6IHRoaXMuZWxlbWVudCwgXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZSAgIDogdGhpcy5hdHRyaWJ1dGUsIFxyXG4gICAgICAgICAgICBwYXJlbnQgICAgICA6IHRoaXMucGFyZW50LFxyXG4gICAgICAgICAgICBhdHRyaWJ1dGUgICA6IHRoaXMuYXR0cmlidXRlLFxyXG4gICAgICAgIH0gPSBkYXRhKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFJlbW92ZSB0aGUgJ0BiaW5kJyBvciB0aGUgJ2RhdGEtYmluZDonIGZyb20gdGhlIGF0dHJpYnV0ZSBcclxuICAgICAgICAgKiBhbmQgZ2V0IHRoZSAnYmluZGFibGUnIGF0dHJpYnV0ZSBzbyB0byBzcGVha1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGJpbmRhYmxlOiBzdHJpbmcgPSAodGhpcy5hdHRyaWJ1dGUuYXR0cmlidXRlLm1hdGNoKFBhdHRlcm5zLmJpbmQuYmluZGFibGUpID8/IFtcIlwiXSlbMF07XHJcblxyXG4gICAgICAgIGlmKCFiaW5kYWJsZSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEV2YWxFcnJvcihcIkEgJ2RhdGEtYmluZC9AYmluZCcgbXVzdCBiZSBmb2xsb3dlZCBieSBhIHZhbGlkIGh0bWwgYXR0cmlidXRlXCIpO1xyXG5cclxuICAgICAgICAvL1NldCB0aGUgJ2JpbmRBdHRyJyBwcm9wZXJ0eVxyXG4gICAgICAgIHRoaXMuYmluZEF0dHIgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IGJpbmRhYmxlLFxyXG4gICAgICAgICAgICBleGlzdHM6IHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoYmluZGFibGUpLFxyXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShiaW5kYWJsZSkhLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpbmQgYWxsIHRoZSAnJHRoaXMuZGF0YScgcGxhY2VkIGluIHRoZSBhdHRyaWJ1dGUsIFxyXG4gICAgICAgICAqIGFuZCByZXR1cm4gdGhlIHJlYWwgdmFyaWFibGUgbmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gWy4uLm5ldyBTZXQoW1xyXG4gICAgICAgICAgICAuLi5bLi4udGhpcy5hdHRyaWJ1dGUudmFsdWVzLm9yaWdpbmFsLm1hdGNoQWxsKFBhdHRlcm5zLmJpbmQuJHRoaXMpXVxyXG4gICAgICAgICAgICAgICAgLm1hcCgobSkgPT4gbVswXSlcclxuICAgICAgICAgICAgICAgIC5tYXAoKHZhcmlhYmxlKSA9PiB2YXJpYWJsZS5yZXBsYWNlKFwiJHRoaXMuZGF0YS5cIiwgXCJcIikpXHJcbiAgICAgICAgXSldO1xyXG5cclxuICAgICAgICB0aGlzLnNldERhdGEoKTtcclxuICAgIH07XHJcblxyXG4gICAgaGFzRXJyb3IodHlwZTogc3RyaW5nLCByZWdleHA6IFJlZ0V4cCkge1xyXG4gICAgICAgIGlmKCh0aGlzLmF0dHJpYnV0ZS5tb2RpZmllciA9PSB0eXBlKSAmJiAoIXJlZ2V4cC50ZXN0KHRoaXMuYXR0cmlidXRlLnZhbHVlcy5vcmlnaW5hbCkpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFdmFsRXJyb3IoYFRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtYmluZC9AYmluZCcgYXR0cmlidXRlIG11c3QgYmUgYSAke3R5cGV9YCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICB0aGlzLmhhc0Vycm9yKHRoaXMuYXR0cmlidXRlLm1vZGlmaWVyLCBQYXR0ZXJucy5iaW5kW3RoaXMuYXR0cmlidXRlLm1vZGlmaWVyXSk7XHJcblxyXG4gICAgICAgIHRoaXMudmFyaWFibGVzLmZvckVhY2goKHZhcmlhYmxlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB2ID0gdGhpcy5wYXJlbnQuZGF0YVt2YXJpYWJsZV0udmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZS52YWx1ZXMuY3VycmVudCA9IHZhbHVlLnJlcGxhY2VBbGwoXHJcbiAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfWAsIFxyXG4gICAgICAgICAgICAgICAgKCh0eXBlb2YgdiA9PSBcInN0cmluZ1wiKSA/IGAnJHt2fSdgIDogdilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFBhcnNlci5wYXJzZXIodGhpcy5hdHRyaWJ1dGUudmFsdWVzLmN1cnJlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmluZCB0aGUgYXR0cmlidXRlXHJcbiAgICAgKi9cclxuICAgIHNldERhdGEoKTogdm9pZCB7XHJcbiAgICAgICAgc3dpdGNoKHRoaXMuYmluZEF0dHIubmFtZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic3R5bGVcIjpcclxuICAgICAgICAgICAgICAgICh0aGlzLmF0dHJpYnV0ZS5tb2RpZmllciA9PSBcIm9iamVjdFwiKSBcclxuICAgICAgICAgICAgICAgICAgICA/IE9iamVjdC5hc3NpZ24odGhpcy5lbGVtZW50LnN0eWxlLCB0aGlzLnBhcnNlKHRoaXMuYXR0cmlidXRlLnZhbHVlcy5vcmlnaW5hbCkpXHJcbiAgICAgICAgICAgICAgICAgICAgOiAodGhpcy5lbGVtZW50LnN0eWxlLmNzc1RleHQgPSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZSh0aGlzLmF0dHJpYnV0ZS52YWx1ZXMub3JpZ2luYWwpICsgKHRoaXMuYmluZEF0dHIudmFsdWUgPz8gXCJcIikpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJjbGFzc1wiOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gYCR7dGhpcy5wYXJzZSh0aGlzLmF0dHJpYnV0ZS52YWx1ZXMub3JpZ2luYWwpfSAkeyh0aGlzLmJpbmRBdHRyLnZhbHVlID8/IFwiXCIpfWA7XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSIsImltcG9ydCB7IEV2ZW50Q2hpbGQsIFBhcnNlZEFyZ3MsIEFyZ3VtZW50c09iamVjdCwgQXJndW1lbnRzIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENoZXZlcmVOb2RlIH0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcbmltcG9ydCB7IEhlbHBlciwgTWFnaWNzLCBQYXJzZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudE5vZGUgaW1wbGVtZW50cyBFdmVudENoaWxkIHtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xyXG4gICAgbWV0aG9kPzogRnVuY3Rpb247XHJcbiAgICBldmVudDogc3RyaW5nO1xyXG4gICAgYXR0clZhbDogc3RyaW5nO1xyXG4gICAgYXJncz86IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IEV2ZW50Q2hpbGQpIHtcclxuICAgICAgICAoe1xyXG4gICAgICAgICAgICBlbGVtZW50IDogdGhpcy5lbGVtZW50LCBcclxuICAgICAgICAgICAgZXZlbnQgICA6IHRoaXMuZXZlbnQsIFxyXG4gICAgICAgICAgICBhdHRyVmFsIDogdGhpcy5hdHRyVmFsLCBcclxuICAgICAgICAgICAgcGFyZW50ICA6IHRoaXMucGFyZW50XHJcbiAgICAgICAgfSA9IGRhdGEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vR2l2ZSBpdCBhbiBJRCBmb3IgdGhlIGVsZW1lbnRcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBIZWxwZXIuc2V0RGF0YUlkKDEwKSk7XHJcblxyXG4gICAgICAgIC8vU2VhcmNoIG1ldGhvZCBhbmQgY2hlY2sgaWYgaXQgaGFzIGFyZ3VtZW50c1xyXG4gICAgICAgIHRoaXMubWV0aG9kID0gdGhpcy5zZWFyY2hNZXRob2QoKTtcclxuICAgICAgICB0aGlzLmFyZ3MgPSB0aGlzLmZpbmRBcmd1bWVudHMoKTtcclxuXHJcbiAgICAgICAgLy9JZiBldmVyeXRoaW5nIGlzIG9rLCB0aGVuIHNldCB0aGUgRXZlbnRcclxuICAgICAgICB0aGlzLnBhcmVudD8uc2V0RXZlbnQoe1xyXG4gICAgICAgICAgICBlbGVtOiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIGFjdGlvbjogdGhpcy5tZXRob2QhLFxyXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmV2ZW50LFxyXG4gICAgICAgICAgICBhcmdzOiB0aGlzLmFyZ3NcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmaW5kQXJndW1lbnRzKCk6IEFyZ3VtZW50c09iamVjdHx1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCBtZXRob2ROYW1lOiBzdHJpbmcgPSB0aGlzLmF0dHJWYWwudHJpbSgpLnJlcGxhY2UoL1xcKC4qLywgXCJcIik7XHJcblxyXG4gICAgICAgIGlmKCghdGhpcy5wYXJlbnQuYXJnc1ttZXRob2ROYW1lXSkgfHwgKEhlbHBlci5pc0VtcHR5KHRoaXMucGFyZW50LmFyZ3NbbWV0aG9kTmFtZV0hKSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy9UaGUgYXJnc1xyXG4gICAgICAgIGNvbnN0IGFyZ3M6IEFyZ3VtZW50cyA9IHtcclxuICAgICAgICAgICAgaHRtbEFyZ3M6IEhlbHBlci5odG1sQXJnc0RhdGFBdHRyKHRoaXMuYXR0clZhbCksXHJcbiAgICAgICAgICAgIHBhcmVudEFyZ3M6IHRoaXMucGFyZW50LmFyZ3NbbWV0aG9kTmFtZV1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvL0NoZWNrIGZvciBlcnJvcnMgaW4gdGhlIGFyZ21lbnRzXHJcbiAgICAgICAgSGVscGVyLmNvbXBhcmVBcmd1bWVudHMoe1xyXG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZE5hbWUsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudDogdGhpcy5wYXJlbnQubmFtZSxcclxuICAgICAgICAgICAgaHRtbEFyZ3M6IGFyZ3MuaHRtbEFyZ3MsXHJcbiAgICAgICAgICAgIG1ldGhvZEFyZ3M6IGFyZ3MucGFyZW50QXJncyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IGZpbmFsOiBhbnlbXSA9IEhlbHBlci5nZXRSZWFsVmFsdWVzSW5Bcmd1bWVudHMoe1xyXG4gICAgICAgICAgICBhcmdzOiBhcmdzLmh0bWxBcmdzIGFzIHN0cmluZ1tdLFxyXG4gICAgICAgICAgICBuYW1lOiB0aGlzLnBhcmVudC5uYW1lLFxyXG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZE5hbWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgdGhlIGFyZ3VtZW50IG9iamVjdFxyXG4gICAgICAgIGxldCBhcmdzT2JqOiBBcmd1bWVudHNPYmplY3QgPSB7fTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpIGluIGFyZ3MucGFyZW50QXJncykgYXJnc09ialthcmdzLnBhcmVudEFyZ3NbKyhpKV1dID0gZmluYWxbKyhpKV07XHJcblxyXG4gICAgICAgIHJldHVybiBhcmdzT2JqO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZWFyY2hNZXRob2QoKTogRnVuY3Rpb24ge1xyXG4gICAgICAgIGxldCB2YWw6IHN0cmluZyA9IHRoaXMuYXR0clZhbC50cmltKCkucmVwbGFjZSgvXFwoLiovZywgXCJcIik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIGxldCBtZXRob2Q6IEZ1bmN0aW9uID0gdGhpcy5wYXJlbnQubWV0aG9kcyFbdmFsXTtcclxuXHJcbiAgICAgICAgaWYoIW1ldGhvZCkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlcmUncyBubyBhIG1ldGhvZCBuYW1lZCAnJHt2YWx9JyBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZDtcclxuICAgIH1cclxufSIsImltcG9ydCB7Q2hldmVyZU5vZGV9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBMb29wRWxlbWVudCwgUGFyc2VkRGF0YSwgUGFyc2VkRm9yIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IFRleHROb2RlIH0gZnJvbSBcIi4vVGV4dE5vZGVcIjtcclxuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTG9vcE5vZGUgaW1wbGVtZW50cyBMb29wRWxlbWVudCB7XHJcbiAgICBlbGVtZW50OiBIVE1MVGVtcGxhdGVFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIHZhcmlhYmxlOiBQYXJzZWREYXRhO1xyXG4gICAgZXhwcmVzc2lvbnM/OiBzdHJpbmdbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBMb29wRWxlbWVudCkge1xyXG4gICAgICAgICh7IGVsZW1lbnQ6IHRoaXMuZWxlbWVudCwgcGFyZW50OiB0aGlzLnBhcmVudCB9ID0gZGF0YSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcnNlZDogUGFyc2VkRm9yID0gUGFyc2VyLnBhcnNlRGF0YUZvckF0dHIoe1xyXG4gICAgICAgICAgICBhdHRyOiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1mb3JcIikhLCBcclxuICAgICAgICAgICAgbm9kZTogdGhpcy5wYXJlbnRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgKHsgZXhwcmVzc2lvbnM6IHRoaXMuZXhwcmVzc2lvbnMsIHZhcmlhYmxlOiB0aGlzLnZhcmlhYmxlIH0gPSBwYXJzZWQpO1xyXG5cclxuICAgICAgICBpZih0eXBlb2YgdGhpcy52YXJpYWJsZS52YWx1ZSA9PSBcInN0cmluZ1wiKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEV2YWxFcnJvcihgQ2Fubm90IHNldCBhICdmb3IuLmluJyBsb29wIGluIHR5cGUgJHt0eXBlb2YgdGhpcy52YXJpYWJsZS52YWx1ZX1gKTsgICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLmxvb3BFbGVtZW50cygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBsb29wRWxlbWVudHMoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHBvczogbnVtYmVyID0gQXJyYXkuZnJvbSh0aGlzLnBhcmVudC5lbGVtZW50LmNoaWxkcmVuKS5pbmRleE9mKHRoaXMuZWxlbWVudCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlOiBEb2N1bWVudEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxyXG4gICAgICAgICAgICBlbGVtZW50ID0gdGhpcy5lbGVtZW50LmNvbnRlbnQucXVlcnlTZWxlY3RvcihcImRpdjpmaXJzdC1jaGlsZFwiKTtcclxuXHJcbiAgICAgICAgaWYoIWVsZW1lbnQpIHRocm93IG5ldyBFcnJvcihcIlRoZSBmaXJzdCBjaGlsZCBvZiB5b3VyIGRhdGEtZm9yIGVsZW1lbnQgbXVzdCBiZSBhIGRpdiBlbGVtZW50XCIpO1xyXG5cclxuICAgICAgICBjb25zdCB0aGlzQ2hpbGRzID0gWy4uLmVsZW1lbnQhLnF1ZXJ5U2VsZWN0b3JBbGwoXCIqW2RhdGEtdGV4dF1cIildO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICBjb25zdCBMb29wVGV4dCA9IHRoaXNDaGlsZHNcclxuICAgICAgICAgICAgLmZpbHRlcigoY2hpbGQpID0+IGNoaWxkLmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8uc3RhcnRzV2l0aCh0aGlzLmV4cHJlc3Npb25zIVswXSkpO1xyXG5cclxuICAgICAgICBMb29wVGV4dC5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIsIFxyXG4gICAgICAgICAgICBgJHt0aGlzLnZhcmlhYmxlLm5vbWJyZX1bXWAgKyBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIik/LnJlcGxhY2UodGhpcy5leHByZXNzaW9ucyFbMF0sIFwiXCIpISlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSBpbiB0aGlzLnZhcmlhYmxlLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIExvb3BUZXh0XHJcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYXR0clZhbDogc3RyaW5nID0gKCsoaSkgPT0gMCkgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIik/LnJlcGxhY2UoXCJbXVwiICwgYFske2l9XWApISBcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBlbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8ucmVwbGFjZSgvXFxbWzAtOV0rXFxdLywgYFske2l9XWApIVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIsIGF0dHJWYWwpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5jaGlsZHMhW1wiZGF0YS10ZXh0XCJdLnB1c2gobmV3IFRleHROb2RlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLnBhcmVudFxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGVtcGxhdGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZShlbGVtZW50LCB0cnVlKSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBhcmVudC5lbGVtZW50LnByZXBlbmQodGVtcGxhdGUpO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudC5jYW5TZXQgPSB0cnVlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZU5vZGUgfSBmcm9tIFwiQGNoZXZlcmVcIjtcbmltcG9ydCB7IElucHV0TW9kZWwgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCJAaGVscGVyc1wiO1xuXG4vKipcbiAqIFRoZSBjbGFzcyBmb3IgdGhvc2UgaW5wdXRzIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgYGRhdGEtbW9kZWxgIGF0dHJpYnV0ZVxuICogIEBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgTW9kZWxOb2RlIGltcGxlbWVudHMgSW5wdXRNb2RlbCB7XG4gICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudDtcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xuICAgIHZhcmlhYmxlOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihpbnB1dDogSW5wdXRNb2RlbCkge1xuICAgICAgICAoeyBwYXJlbnQ6IHRoaXMucGFyZW50LCBlbGVtZW50OiB0aGlzLmVsZW1lbnQgfSA9IGlucHV0KTtcblxuICAgICAgICAvL1NlYXJjaCBpZiB0aGUgaW5kaWNhdGVkIHZhcmlhYmxlIG9mIHRoZSBkYXRhLW1vZGVsIGF0dHJpYnV0ZSBleGlzdHMgaW4gdGhlIHNjb3BlXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmdldFZhcmlhYmxlKCk7XG5cbiAgICAgICAgdGhpcy5hc3NpZ25UZXh0KHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUudG9TdHJpbmcoKSk7XG5cbiAgICAgICAgLy9BZGQgdGhlIGxpc3RlbmVyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGhpcy5zeW5jVGV4dC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiBpbnB1dCBpcyBuZWl0aGVyIHR5cGUgJ3JhZGlvJyBub3IgdHlwZSAnY2hlY2tib3gnLCBzZXRzIGl0cyB2YWx1ZSBhY2NvcmRpbmcgdG8gdGhlIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIHthbnl9IHZhbHVlIFRoZSB2YWx1ZVxuICAgICAqL1xuICAgIGFzc2lnblRleHQodmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuICAgIH1cblxuICAgIHN5bmNUZXh0KCk6IHZvaWQge1xuICAgICAgICBpZih0aGlzLmVsZW1lbnQudHlwZSA9PSBcImNoZWNrYm94XCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0ZWQgPSBbLi4udGhpcy5wYXJlbnQuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgIGBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl1bZGF0YS1tb2RlbD1cIiR7dGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtbW9kZWxcIil9XCJdYFxuICAgICAgICAgICAgKV0uZmlsdGVyKChlKSA9PiBlICE9IHRoaXMuZWxlbWVudCkgYXMgSFRNTElucHV0RWxlbWVudFtdO1xuXG4gICAgICAgICAgICBpZihyZWxhdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUgPSAocmVsYXRlZC5zb21lKChlKSA9PiAoZS5jaGVja2VkID09IHRydWUpICYmIChlICE9IHRoaXMuZWxlbWVudCkpKVxuICAgICAgICAgICAgICAgICAgICA/IHJlbGF0ZWQuZmlsdGVyKChlKSA9PiBlLmNoZWNrZWQgPT0gdHJ1ZSkubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICA6ICgodGhpcy5lbGVtZW50LmNoZWNrZWQpID8gdGhpcy5lbGVtZW50LnZhbHVlIDogXCJcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUgPSAodGhpcy5lbGVtZW50LnZhbHVlID09IFwib25cIilcbiAgICAgICAgICAgICAgICAgICAgPyBTdHJpbmcodGhpcy5lbGVtZW50LmNoZWNrZWQpXG4gICAgICAgICAgICAgICAgICAgIDogKHRoaXMuZWxlbWVudC5jaGVja2VkKSA/IHRoaXMuZWxlbWVudC52YWx1ZSA6IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdLnZhbHVlID0gU3RyaW5nKHRoaXMuZWxlbWVudC52YWx1ZSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmQgdGhlIHZhcmlhYmxlIHRoYXQgd2FzIGluZGljYXRlZCBpbiB0aGUgJ2RhdGEtbW9kZWwnIGF0dHJpYnV0ZSBcbiAgICAgKiBAcmV0dXJucyBUaGUgdmFyaWFibGUgdG8gbW9kZWxcbiAgICAgKi9cbiAgICBnZXRWYXJpYWJsZSgpOiBzdHJpbmcge1xuICAgICAgICBsZXQgYXR0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLW1vZGVsXCIpITtcblxuICAgICAgICBIZWxwZXIuY2hlY2tGb3JFcnJvckluVmFyaWFibGUoYXR0cik7XG5cbiAgICAgICAgbGV0IHZhcmlhYmxlID0gT2JqZWN0LmtleXModGhpcy5wYXJlbnQuZGF0YSkuZmluZCgoZGF0YSkgPT4gZGF0YSA9PSBhdHRyKTtcblxuICAgICAgICBpZiAoIXZhcmlhYmxlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgIGBUaGVyZSdzIG5vIGEgJyR7YXR0cn0nIHZhcmlhYmxlIGluIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHZhcmlhYmxlO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZSB9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBQYXJzZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuaW1wb3J0IHsgUGFyc2VkRGF0YSwgUGFyc2VkU2hvdywgU2hvd0NoaWxkIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU2hvd05vZGUgaW1wbGVtZW50cyBTaG93Q2hpbGQge1xyXG4gICAgZWxlbWVudCA6IEhUTUxFbGVtZW50O1xyXG4gICAgcGFyZW50ICA6IENoZXZlcmVOb2RlO1xyXG4gICAgdmFyaWFibGU6IFBhcnNlZERhdGE7XHJcbiAgICB2YWx1ZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IFNob3dDaGlsZCkge1xyXG4gICAgICAgICh7IGVsZW1lbnQgOiB0aGlzLmVsZW1lbnQsICBwYXJlbnQgOiB0aGlzLnBhcmVudCB9ID0gZGF0YSk7XHJcblxyXG4gICAgICAgIGxldCBwYXJzZWRBdHRyOiBQYXJzZWRTaG93ID0gUGFyc2VyLnBhcnNlZERhdGFTaG93QXR0cih7XHJcbiAgICAgICAgICAgIGF0dHI6IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNob3dcIikhLFxyXG4gICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAoeyB2YWx1ZTogdGhpcy52YWx1ZSwgdmFyaWFibGU6IHRoaXMudmFyaWFibGUgfSA9IHBhcnNlZEF0dHIpO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZUhpZGRlbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0b2dnbGVIaWRkZW4oKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmhpZGRlbiA9ICEoUGFyc2VyLnBhcnNlcihgXHJcbiAgICAgICAgICAgICR7KHR5cGVvZiB0aGlzLnZhcmlhYmxlLnZhbHVlID09IFwic3RyaW5nXCIpIFxyXG4gICAgICAgICAgICAgICAgPyBgXCIke3RoaXMudmFyaWFibGUudmFsdWV9XCJgIFxyXG4gICAgICAgICAgICAgICAgOiB0aGlzLnZhcmlhYmxlLnZhbHVlfSAke3RoaXMudmFsdWV9YFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTsiLCJcclxuaW1wb3J0IHsgVGV4dFJlbGF0aW9uLCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQge0NoZXZlcmVOb2RlfSBmcm9tIFwiQGNoZXZlcmVcIjtcclxuaW1wb3J0IHsgSGVscGVyLCBQYXJzZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUZXh0Tm9kZSBpbXBsZW1lbnRzIFRleHRSZWxhdGlvbiB7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIF92YXJpYWJsZT86IGFueTtcclxuICAgIF92YWx1ZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IFRleHRSZWxhdGlvbikge1xyXG4gICAgICAgICh7IGVsZW1lbnQ6IHRoaXMuZWxlbWVudCwgcGFyZW50OiB0aGlzLnBhcmVudCB9ID0gZGF0YSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldERhdGFJZCgxMCkpO1xyXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpITtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuX3ZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFyaWFibGUoYXR0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgSGVscGVyLmNoZWNrRm9yRXJyb3JJblZhcmlhYmxlKGF0dHIpO1xyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0gUGFyc2VyLnBhcnNlRGF0YVRleHRBdHRyKHtcclxuICAgICAgICAgICAgYXR0cjogYXR0ciwgXHJcbiAgICAgICAgICAgIG5vZGU6IHRoaXMucGFyZW50XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICh7dmFyaWFibGU6IHRoaXMuX3ZhcmlhYmxlLCB2YWx1ZTogdGhpcy52YWx1ZX0gPSBkYXRhKTtcclxuICAgIH1cclxufSIsImV4cG9ydCAqIGZyb20gXCIuL0V2ZW50Tm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Mb29wTm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Nb2RlbE5vZGVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vVGV4dE5vZGVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vU2hvd05vZGVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQmluZE5vZGVcIjsiLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZURhdGEsIERhdGFUeXBlLCBNZXRob2RUeXBlLCBBcmd1bWVudHNPYmplY3QsIEluaXQgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG4vKipcclxuICogIFRoZSBjbGFzcyB0aGF0IHVzZXJzIGNyZWF0ZSB0aGVpciBjb21wb25lbnRzXHJcbiAqICBAY2xhc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlRGF0YSBpbXBsZW1lbnRzIENoZXZlcmVOb2RlRGF0YSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBkYXRhOiBEYXRhVHlwZTtcclxuICAgIGluaXQ/OiBGdW5jdGlvbjtcclxuICAgIG1ldGhvZHM/OiBNZXRob2RUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVOb2RlRGF0YSkge1xyXG4gICAgICAgICh7IG5hbWU6IHRoaXMubmFtZSwgZGF0YTogdGhpcy5kYXRhLCBpbml0OiB0aGlzLmluaXQsIG1ldGhvZHM6IHRoaXMubWV0aG9kcyB9ID0gZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgYXJndW1lbnRzIG9mIHRoIGluaXQoKSBtZXRob2RcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGh0bWxBcmdzIFRoZSBhcmd1bWVudHMgb2YgZGUgZGF0YS1hdHRhY2hlZCBhdHRyaWJ1dGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGluaXRBcmdzIFRoZSBhcmd1bWVudHMgZGVmaW5lZCBpbiB0aGUgaW5pdCgpIG1ldGhvZFxyXG4gICAgICovXHJcbiAgICBhc3luYyBwYXJzZUFyZ3VtZW50cyhodG1sQXJnczogc3RyaW5nW10sIG1ldGhvZEFyZ3M6IHN0cmluZ1tdKTogUHJvbWlzZTxGdW5jdGlvbj4ge1xyXG5cclxuICAgICAgICAvL0dldCBhIHZhbGlkIHZhbHVlIGZvciB0aGUgYXJndW1lbnQsIGZvciBleGFtcGxlLCBjaGVjayBmb3Igc3RyaW5ncyB3aXRoIHVuY2xvc2VkIHF1b3Rlc1xyXG4gICAgICAgIGxldCBmaW5hbCA9IEhlbHBlci5nZXRSZWFsVmFsdWVzSW5Bcmd1bWVudHMoe1xyXG4gICAgICAgICAgICBhcmdzOiBodG1sQXJncyxcclxuICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiaW5pdCgpXCJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgdGhlIGFyZ3VtZW50IG9iamVjdFxyXG4gICAgICAgIGxldCBhcmdzT2JqOiBBcmd1bWVudHNPYmplY3QgPSB7fTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpIGluIG1ldGhvZEFyZ3MpIGFyZ3NPYmpbbWV0aG9kQXJnc1tpXV0gPSBmaW5hbFtpXTtcclxuXHJcbiAgICAgICAgLy8uLi5hbmQgcGFzcyBpdCB0byB0aGUgdW5wYXJzZWQgaW5pdCBmdW5jdGlvblxyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnBhcnNlSW5pdCh7XHJcbiAgICAgICAgICAgIGluaXQ6IHRoaXMuaW5pdCEsXHJcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3NPYmosXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgaW5pdCBmdW5jdGlvbiBhbmQgZXhlY3V0ZXMgaXRcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGluaXQgVGhlIHVucGFyc2VkIGluaXQgZnVuY3Rpb25cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIFRoZSBwYXJzZWQgY3VzdG9tIGFyZ3VtZW50c1xyXG4gICAgICogQHJldHVybnMgdGhlIGluaXQgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgYXN5bmMgcGFyc2VJbml0KGluaXQ6IEluaXQpOiBQcm9taXNlPEZ1bmN0aW9uPiB7XHJcblxyXG4gICAgICAgIGxldCBpbml0RnVuYzogc3RyaW5nID0gSGVscGVyLmNvbnRlbnRPZkZ1bmN0aW9uKGluaXQuaW5pdCk7XHJcblxyXG4gICAgICAgIC8vRmluZHMgdGhlIHJlYWwgYXJndW1lbnRzIGFuZCBubyBleHByZXNzaW9ucyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAgICBpZiAoaW5pdC5hcmdzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGluaXQuYXJncykuZm9yRWFjaCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RyOiBzdHJpbmcgPSBgKD88PSg9XFxcXHMpfChcXFxcKCl8KD0pKSgke2FyZ30pYDtcclxuICAgICAgICAgICAgICAgIGluaXRGdW5jID0gaW5pdEZ1bmMucmVwbGFjZShuZXcgUmVnRXhwKHN0ciwgXCJnXCIpLCBgJGFyZ3MuJHthcmd9YCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL0NyZWF0ZSB0aGUgbmV3IHBhcnNlZCBpbml0IGZ1bmN0aW9uXHJcbiAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgICAgICBcInskdGhpcyA9IHVuZGVmaW5lZCwgJGFyZ3MgPSB1bmRlZmluZWR9XCIsXHJcbiAgICAgICAgICAgIGByZXR1cm4gYXN5bmMoKSA9PiB7ICR7aW5pdEZ1bmN9IH07YCxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL1JldHVybiB0aGUgbmV3IGluaXQgZnVuY3Rpb24gYW5kIGV4ZWN1dGVzIGl0XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IG5ld0Z1bmMoe1xyXG4gICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgJGFyZ3M6IGluaXQuYXJncyxcclxuICAgICAgICB9KSgpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZUVsZW1lbnQsIE1ldGhvZFR5cGUsIERhdGFUeXBlLCBDaGlsZCwgQ2hldmVyZUV2ZW50LCBQYXJzZWREYXRhLCBFdmVudEVsZW1lbnRzLCBQYXJzZWRBcmdzLCBCaW5kQ2hpbGQgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHtDaGV2ZXJlRGF0YX0gZnJvbSBcIi4vQ2hldmVyZURhdGFcIjtcclxuaW1wb3J0IHtFdmVudE5vZGUsIFRleHROb2RlLCBNb2RlbE5vZGUsIExvb3BOb2RlLCBTaG93Tm9kZSwgQmluZE5vZGUgfSBmcm9tIFwiQGFjdGlvbnNcIjtcclxuaW1wb3J0IHsgSGVscGVyLCBDaGlsZHNIZWxwZXIsIE1hZ2ljcywgUGFyc2VyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2hldmVyZU5vZGUgaW1wbGVtZW50cyBDaGV2ZXJlRWxlbWVudCB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBkYXRhOiBEYXRhVHlwZTtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBtZXRob2RzPzogTWV0aG9kVHlwZTtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBhcmdzOiB7IFttZXRob2Q6IHN0cmluZ106IFBhcnNlZEFyZ3MgfSA9IHt9O1xyXG4gICAgY2hpbGRzPzogQ2hpbGQgPSB7XHJcbiAgICAgICAgXCJldmVudFwiOiBbXSxcclxuICAgICAgICBcImRhdGEtdGV4dFwiOiBbXSxcclxuICAgICAgICBcImRhdGEtbW9kZWxcIjogW10sXHJcbiAgICAgICAgXCJkYXRhLWZvclwiOiBbXSxcclxuICAgICAgICBcImRhdGEtc2hvd1wiOiBbXSxcclxuICAgICAgICBcImRhdGEtcmVmXCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1iaW5kXCI6IFtdLFxyXG4gICAgfTtcclxuICAgIHJlZnM6IHsgW25hbWU6IHN0cmluZ106IEVsZW1lbnQgfSA9IHt9O1xyXG4gICAgY2FuU2V0OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZURhdGEsIGVsOiBFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucGFyc2VEYXRhKGRhdGEuZGF0YSk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFBhcnNlIGFsbCAkdGhpcywgJHNlbGYsICRkYXRhLi4uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5tZXRob2RzID0gdGhpcy5wYXJzZU1ldGhvZHMoZGF0YS5tZXRob2RzKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHRoZSBwYXJlbnQgYGRpdmAgYW5kIGdpdmUgaXQgYSB2YWx1ZSBmb3IgdGhlIGRhdGEtaWQgYXR0cmlidXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IEhlbHBlci5zZXREYXRhSWQoMTApO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIHRoaXMuaWQpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgR2V0IHRoZSBldmVudHMgYW5kIGFjdGlvbnMgb2YgdGhlIGNvbXBvbmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2hlY2tGb3JBY3Rpb25zQW5kQ2hpbGRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSBhbGwgdGhlIGRhdGEsIHRoZXkgbmVlZCBnZXR0ZXIgYW5kIGEgc2V0dGVyXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgcHJpbWl0aXZlIGRhdGFcclxuICAgICAqL1xyXG4gICAgcGFyc2VEYXRhKGRhdGE6IERhdGFUeXBlKSB7XHJcbiAgICAgICAgbGV0IG9iajogW3N0cmluZywgUGFyc2VkRGF0YV1bXSA9IFtdO1xyXG5cclxuICAgICAgICBPYmplY3QuZW50cmllcyhkYXRhKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcclxuICAgICAgICAgICAgb2JqLnB1c2goW2tleSwgdGhpcy5wYXJzZWRPYmooa2V5LCB2YWx1ZSldKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhvYmopO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VkIHRoZSBtZXRob2RzIGRlc2NyaWJlZCBpbiB0aGUgbWV0aG9kIHByb3BlcnR5IG9mIHRoZSBkYXRhXHJcbiAgICAgKiBAcGFyYW0ge01ldGhvZFR5cGV9IG1ldGhvZHNcclxuICAgICAqIEByZXR1cm5zIFRoZSBtZXRob2RzIHBhcnNlZFxyXG4gICAgICovXHJcbiAgICBwYXJzZU1ldGhvZHMobWV0aG9kcz86IE1ldGhvZFR5cGUpOiBNZXRob2RUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAobWV0aG9kcyA9PSB1bmRlZmluZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaCgobWV0aG9kKSA9PiB7XHJcbiAgICAgICAgICAgIC8vSWYgdGhlIG1ldGhvZCB3YXMgYWxyZWFkeSBwYXJzZWRcclxuICAgICAgICAgICAgbGV0IHdhc1BhcnNlZDogbnVtYmVyID0gbWV0aG9kc1ttZXRob2RdXHJcbiAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgLnNlYXJjaChcImFub255bW91c1wiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXNQYXJzZWQgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhcmdzOiBQYXJzZWRBcmdzID0gSGVscGVyLm1ldGhvZEFyZ3VtZW50cyhtZXRob2RzW21ldGhvZF0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmKGFyZ3MpIHRoaXMuYXJnc1ttZXRob2RdID0gYXJncztcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyc2VkOiBzdHJpbmcgPSBtZXRob2RzW21ldGhvZF1cclxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLip8W1xcfV0kL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZWQgPSBwYXJzZWQucmVwbGFjZUFsbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCR0aGlzLmRhdGEuJHt2YXJpYWJsZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfS52YWx1ZWAsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuYXJnc1ttZXRob2RdICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXJnc1ttZXRob2RdPy5mb3JFYWNoKChhcmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0cjogc3RyaW5nID0gYCg/PD0oPVxcXFxzKXwoXFxcXCgpfCg9KSkoJHthcmd9KWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZCA9IHBhcnNlZC5yZXBsYWNlKG5ldyBSZWdFeHAoc3RyLCBcImdcIiksIGAkYXJncy4ke2FyZ31gKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBuZXdGdW5jOiBGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbihcclxuICAgICAgICAgICAgICAgICAgICBcInskdGhpcyA9IHVuZGVmaW5lZCwgJGV2ZW50ID0gdW5kZWZpbmVkLCAkYXJncyA9IHVuZGVmaW5lZH1cIixcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZWQsXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIG1ldGhvZHNbbWV0aG9kXSA9IG5ld0Z1bmM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1ldGhvZHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIGFsbCB0aGUgY2hpbGRyZW5zIHRoYXQgaGF2ZSBhbiBhY3Rpb24gYW5kIGRhdGFcclxuICAgICAqL1xyXG4gICAgY2hlY2tGb3JBY3Rpb25zQW5kQ2hpbGRzKCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsbCB0aGUgZWxlbWVudHMgc3VwcG9ydGVkIHdpdGggQ2hldmVyZXhcclxuICAgICAgICAgKiBAY29uc3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdCBsb29wTm9kZXMgICA6IE5vZGVMaXN0T2Y8SFRNTFRlbXBsYXRlRWxlbWVudD4gPSBDaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFGb3IodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgLy9Gb3Igbm9kZXNcclxuICAgICAgICBpZiAobG9vcE5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBsb29wTm9kZXMuZm9yRWFjaCgobG9vcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZGF0YS1mb3JcIl0ucHVzaChuZXcgTG9vcE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGxvb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB0aGlzLmNhblNldCA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY2FuU2V0KSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBldmVudE5vZGVzICA6IEV2ZW50RWxlbWVudHMgICAgICAgPSBDaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFPbkF0dHIodGhpcy5lbGVtZW50KSwgXHJcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZXMgICA6IE5vZGVMaXN0T2Y8RWxlbWVudD4gICA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YVRleHRBdHRyKHRoaXMuZWxlbWVudCksXHJcbiAgICAgICAgICAgICAgICBtb2RlbE5vZGVzICA6IE5vZGVMaXN0T2Y8RWxlbWVudD4gICA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YU1vZGVsQXR0cih0aGlzLmVsZW1lbnQpLFxyXG4gICAgICAgICAgICAgICAgc2hvd05vZGVzICAgOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ICAgPSBDaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFTaG93KHRoaXMuZWxlbWVudCksXHJcbiAgICAgICAgICAgICAgICBiaW5kTm9kZXMgICA6IEJpbmRDaGlsZFtdICAgPSBDaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFCaW5kKHRoaXMuZWxlbWVudCwgdGhpcyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL0V2ZW50Tm9kZXNcclxuICAgICAgICAgICAgaWYgKGV2ZW50Tm9kZXMpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50Tm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImV2ZW50XCJdLnB1c2gobmV3IEV2ZW50Tm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG5vZGVbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG5vZGVbMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJWYWw6IG5vZGVbMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0RhdGEtdGV4dFxyXG4gICAgICAgICAgICBpZiAodGV4dE5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dE5vZGVzLmZvckVhY2goKHRleHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0ucHVzaChuZXcgVGV4dE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiB0ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0RhdGEtc2hvd1xyXG4gICAgICAgICAgICBpZiAoc2hvd05vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgc2hvd05vZGVzLmZvckVhY2goKHNob3cpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLXNob3dcIl0ucHVzaChuZXcgU2hvd05vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBzaG93IGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1RleHQgSW5wdXRzIHdpdGggbW9kZWxcclxuICAgICAgICAgICAgaWYgKG1vZGVsTm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbE5vZGVzLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZGF0YS1tb2RlbFwiXS5wdXNoKG5ldyBNb2RlbE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBpbnB1dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYoYmluZE5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgYmluZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHRoaXMuY2hpbGRzIVtcImRhdGEtYmluZFwiXS5wdXNoKG5ldyBCaW5kTm9kZShub2RlKSkpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZWZzID0gT2JqZWN0LmZyb21FbnRyaWVzKFsuLi5DaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFSZWYodGhpcy5lbGVtZW50KV1cclxuICAgICAgICAgICAgICAgIC5tYXAoKHJlZikgPT4gWyByZWYuZ2V0QXR0cmlidXRlKFwiZGF0YS1yZWZcIikhLCByZWZdKSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBwYXJzZWQgZGF0YSwgd2l0aCB0aGUgZ2V0dGVyIGFuZCBzZXR0ZXJcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBvZiB0aGUgdW5wYXJzZWQgZGF0YSBvYmplY3RcclxuICAgICAqIEBwYXJhbSB7YW55fSB2YWx1ZSB0aGUgdmFsdWUgb2YgdGhhdCBwcm9wZXJ0eVxyXG4gICAgICogQHJldHVybnMgVGhlIHBhcnNlZCBkYXRhXHJcbiAgICAgKi9cclxuICAgIHBhcnNlZE9iaihuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBQYXJzZWREYXRhIHtcclxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbm9tYnJlOiBuYW1lLFxyXG4gICAgICAgICAgICBfdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1N5bmMgdGV4dCB3aXRoIGFsbCBpbnB1dHMgdGhhdCBoYXZlIHRoaXMgdmFyaWFibGUgYXMgbW9kZWwgaW4gdGhlaXIgJ2RhdGEtbW9kZWwnIGF0dHJpYnV0ZVxyXG4gICAgICAgICAgICAgICAgc2VsZi5jaGlsZHMhW1wiZGF0YS10ZXh0XCJdLmZpbHRlcihcclxuICAgICAgICAgICAgICAgICAgICAodGV4dCkgPT4gKHRleHQuX3ZhcmlhYmxlLm5vbWJyZSA9PSB0aGlzLm5vbWJyZSkgJiYgIShbXCJyYWRpb1wiLCBcImNoZWNrYm94XCJdLmluY2x1ZGVzKHRleHQuZWxlbWVudC50eXBlKSlcclxuICAgICAgICAgICAgICAgICkuZm9yRWFjaCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuY2hpbGRzIVtcImRhdGEtYmluZFwiXS5maWx0ZXIoKG5vZGU6IEJpbmROb2RlKSA9PiBub2RlLnZhcmlhYmxlcy5pbmNsdWRlcyh0aGlzLm5vbWJyZSkpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKG5vZGUpID0+IG5vZGUuc2V0RGF0YSgpKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHNlbGYuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl0uZmlsdGVyKChpbnB1dCkgPT4gaW5wdXQudmFyaWFibGUgPT0gdGhpcy5ub21icmUpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKGlucHV0KSA9PiBpbnB1dC5hc3NpZ25UZXh0KHZhbHVlKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5jaGlsZHMhW1wiZGF0YS1zaG93XCJdLmZpbHRlcigobm9kZSkgPT4gbm9kZS52YXJpYWJsZS5ub21icmUgPT0gdGhpcy5ub21icmUpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKHNob3cpID0+IHNob3cudG9nZ2xlSGlkZGVuKCkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQgdmFsdWUoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIGN1c3RvbSBldmVudCBpbiB0aGUgc2NvcGUgb2YgdGhlIGRhdGEtYXR0YWNoZWRcclxuICAgICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdHlwZSwgdGhlIGVsZW1lbnQsIGFuZCB0aGUgZnVuY3Rpb24gd2l0aG91dCBleGVjdXRpbmdcclxuICAgICAqL1xyXG4gICAgc2V0RXZlbnQoZXZlbnQ6IENoZXZlcmVFdmVudCkge1xyXG4gICAgICAgIGV2ZW50LmVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudC50eXBlLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBldmVudC5hY3Rpb24oe1xyXG4gICAgICAgICAgICAgICAgJHRoaXM6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAkYXJnczogZXZlbnQuYXJncyxcclxuICAgICAgICAgICAgICAgICRtYWdpY3M6IE1hZ2ljcyxcclxuICAgICAgICAgICAgICAgICRldmVudDogZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImV4cG9ydCAqIGZyb20gXCIuL0NoZXZlcmVEYXRhXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0NoZXZlcmVOb2RlXCI7IiwiaW1wb3J0IHsgQmluZENoaWxkLCBFdmVudEVsZW1lbnRzIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENoZXZlcmVOb2RlIH0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcbmltcG9ydCB7IFBhdHRlcm5zIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgQ2hpbGRzSGVscGVyID0ge1xyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFPbkF0dHIoZWxlbWVudDogRWxlbWVudCk6IEV2ZW50RWxlbWVudHMge1xyXG4gICAgICAgIGxldCBub2RlczogRXZlbnRFbGVtZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAvL0dldCBhbGwgY2hpbGRzIG9mIHRoZSBlbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRzOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKTtcclxuXHJcbiAgICAgICAgLy9QdXNoIHRvIGBub2Rlc2AgYWxsIGVsZW1lbnRzIHdpdGggdGhlICdkYXRhLW9uJyBvciAnQG9uJyBhdHRyaWJ1dGVcclxuICAgICAgICBmb3IobGV0IGNoaWxkIG9mIGNoaWxkcykge1xyXG4gICAgICAgICAgICBmb3IobGV0IGF0dHIgb2YgY2hpbGQuYXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJkYXRhLW9uXCIpKSBcclxuICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKFtjaGlsZCwgYXR0ci5uYW1lLnNwbGl0KFwiOlwiKVsxXSwgYXR0ci5ub2RlVmFsdWUhXSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKGF0dHIubmFtZS5zdGFydHNXaXRoKFwiQG9uXCIpKSBcclxuICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKFtjaGlsZCwgYXR0ci5uYW1lLnJlcGxhY2UoXCJAb25cIiwgXCJcIikudG9Mb3dlckNhc2UoKSwgYXR0ci5ub2RlVmFsdWUhXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIChub2Rlcy5sZW5ndGggPT0gMCkgPyB1bmRlZmluZWQgOiBub2RlcztcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YUJpbmQoZWxlbWVudDogRWxlbWVudCwgbm9kZTogQ2hldmVyZU5vZGUpOiBCaW5kQ2hpbGRbXSB7XHJcbiAgICAgICAgcmV0dXJuIFsuLi5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpXS5maWx0ZXIoKGUpID0+IFxyXG4gICAgICAgICAgICBbLi4uZS5hdHRyaWJ1dGVzXS5zb21lKChhdHRyKSA9PiBQYXR0ZXJucy5iaW5kLmF0dHIudGVzdChhdHRyLm5hbWUpKVxyXG4gICAgICAgICkubWFwKChlbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBhdHRyOiBzdHJpbmcgPSBbLi4uZWxlbWVudC5hdHRyaWJ1dGVzXS5tYXAoKGF0dHIpID0+IGF0dHIubmFtZSkuZmluZCgoYXR0cikgPT4gUGF0dGVybnMuYmluZC5hdHRyLnRlc3QoYXR0cikpITtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB7IFxyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogbm9kZSxcclxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZTogYXR0cixcclxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllcjogKGF0dHIubWF0Y2goUGF0dGVybnMuYmluZC5tb2RpZmllcikgPz8gW1wic3RyaW5nXCJdKVswXSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHIpISxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cikhLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YVRleHRBdHRyKGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLXRleHRdXCIpO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhTW9kZWxBdHRyKGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRbZGF0YS1tb2RlbF0sIHRleHRhcmVhW2RhdGEtbW9kZWxdLCBzZWxlY3RbZGF0YS1tb2RlbF1cIik7XHJcbiAgICB9LFxyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFGb3IoZWxlbWVudDogRWxlbWVudCk6IE5vZGVMaXN0T2Y8SFRNTFRlbXBsYXRlRWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtkYXRhLWZvcl1cIik7XHJcbiAgICB9LFxyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFTaG93KGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLXNob3ddXCIpO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhUmVmKGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLXJlZl1cIik7XHJcbiAgICB9XHJcbn07IiwiaW1wb3J0IHsgQXJnc0Vycm9ycywgQ29tcGFyZUFyZ3VtZW50cywgUGFyc2VkQXJncyB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG4vKipcclxuICogSGVscGVyIGNsYXNzLCBpdCBwcm92aWRlIHVzZWZ1bGwgbWV0aG9kcyB0byBDaGV2ZXJlIGVsZW1lbnRzXHJcbiAqIEBjbGFzc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEhlbHBlciA9IHtcclxuICAgIGlzRW1wdHkob2JqOiBvYmplY3QpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT0gMDtcclxuICAgIH0sXHJcbiAgICBzZXREYXRhSWQobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBmaW5hbDogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgY29uc3Qgcm91bmRlZDogRnVuY3Rpb24gPSAobnVtOiBudW1iZXIpOiBudW1iZXIgPT4gfn4oTWF0aC5yYW5kb20oKSAqIG51bSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNoYXJzOiB7IFt0eXBlOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcclxuICAgICAgICAgICAgbGV0dGVycyA6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcclxuICAgICAgICAgICAgbWF5dXMgICA6IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcIixcclxuICAgICAgICAgICAgbnVtYmVycyA6IFwiMDEyMzQ1Njc4OVwiLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxlbmd0aDsgaSsrKSBmaW5hbCArPSBjaGFyc1tPYmplY3Qua2V5cyhjaGFycylbcm91bmRlZCgyKV1dW3JvdW5kZWQobGVuZ3RoKV07XHJcblxyXG4gICAgICAgIHJldHVybiBmaW5hbDtcclxuICAgIH0sXHJcbiAgICBjaGVja0ZvckVycm9ySW5WYXJpYWJsZShzdHI6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICgvXlswLTldfFxcVy9nLnRlc3Qoc3RyKSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxyXG4gICAgICAgICAgICAgICAgXCJWYXJpYWJsZSBuYW1lIGNhbm5vdCBzdGFydCB3aXRoIGEgbnVtYmVyIG9yIGhhdmUgc3BhY2VzXCIsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9LFxyXG4gICAgaHRtbEFyZ3NEYXRhQXR0cihkYXRhQXR0YWNoZWQ6IHN0cmluZyk6IFBhcnNlZEFyZ3Mge1xyXG4gICAgICAgIGlmKCFkYXRhQXR0YWNoZWQubWF0Y2goL1xcKC4rXFwpL2cpKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBvbmx5QXR0cnM6IHN0cmluZyA9IGRhdGFBdHRhY2hlZC50cmltKCkucmVwbGFjZSgvLipcXCh8XFwpLiovZywgXCJcIik7XHJcblxyXG4gICAgICAgIHJldHVybiAob25seUF0dHJzKSA/IG9ubHlBdHRycy5zcGxpdChcIixcIikgOiB1bmRlZmluZWQ7XHJcbiAgICB9LFxyXG4gICAgbWV0aG9kQXJndW1lbnRzKG1ldGhvZDogRnVuY3Rpb24pOiBQYXJzZWRBcmdzIHtcclxuICAgICAgICBsZXQgb25seUFyZ3M6IHN0cmluZyA9IG1ldGhvZC50b1N0cmluZygpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHsuKi9ncywgXCJcIilcclxuICAgICAgICAgICAgLnJlcGxhY2UoLy4rXFwofFxcKS4rL2csIFwiXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gKG9ubHlBcmdzKSA/IG9ubHlBcmdzLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZDsgICAgICAgICAgICBcclxuICAgIH0sXHJcbiAgICBnZXRSZWFsVmFsdWVzSW5Bcmd1bWVudHMoZGF0YTogQXJnc0Vycm9ycyk6IGFueVtdIHtcclxuICAgICAgICBsZXQgZmluYWw6IGFueVtdID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZmluYWwgPSBkYXRhLmFyZ3MubWFwKChhcmcpID0+IG5ldyBGdW5jdGlvbihgcmV0dXJuICR7YXJnfWApKCkpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgIGAke2Vycm9yfSwgY2hlY2sgdGhlIHZhbHVlcyBvZiB5b3VyICR7ZGF0YS5tZXRob2R9LCBhdCBvbmUgb2YgeW91ciAnJHtkYXRhLm5hbWV9JyBjb21wb25lbnRzYCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmaW5hbDtcclxuICAgIH0sXHJcbiAgICBjb21wYXJlQXJndW1lbnRzKGRhdGE6IENvbXBhcmVBcmd1bWVudHMpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZXJyb3JQcmU6IHN0cmluZyA9IGBUaGUgJHtkYXRhLm1ldGhvZH0gZnVuY3Rpb24gb2YgdGhlICR7ZGF0YS5jb21wb25lbnR9KCkgY29tcG9uZW50IGA7ICAgICAgICBcclxuXHJcbiAgICAgICAgc3dpdGNoKHRydWUpIHtcclxuICAgICAgICAgICAgY2FzZSAoKCFkYXRhLmh0bWxBcmdzKSAmJiAoIWRhdGEubWV0aG9kQXJncykpOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNhc2UgKChkYXRhLmh0bWxBcmdzICE9IHVuZGVmaW5lZCkgJiYgKCFkYXRhLm1ldGhvZEFyZ3MpKToge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yUHJlICsgYGRvZXNuJ3QgcmVjZWl2ZSBhbnkgcGFyYW1ldGVyYCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNhc2UgKCghZGF0YS5odG1sQXJncykgJiYgKGRhdGEubWV0aG9kQXJncyAhPSB1bmRlZmluZWQpKToge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yUHJlICsgYG5lZWRzIHRvIHJlY2VpdmUgJHtkYXRhLm1ldGhvZEFyZ3N9IHBhcmFtZXRlcnMsIDAgcGFzc2VkYCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNhc2UgKChkYXRhLm1ldGhvZEFyZ3M/Lmxlbmd0aCkgIT0gKGRhdGEuaHRtbEFyZ3M/Lmxlbmd0aCkpOiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JQcmUgKyBgbmVlZHMgdG8gcmVjZWl2ZSAgJHtkYXRhLm1ldGhvZEFyZ3M/Lmxlbmd0aH0gcGFyYW1ldGVycywgXHJcbiAgICAgICAgICAgICAgICAgICAgJHtkYXRhLmh0bWxBcmdzPy5sZW5ndGh9IHBhc3NlZGApXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvbnRlbnRPZkZ1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gZnVuYy50b1N0cmluZygpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8uK1xce3xcXH0kL2dzLCBcIlwiKVxyXG4gICAgICAgICAgICAudHJpbSgpO1xyXG4gICAgfSxcclxuICAgIG5hbWVPZkZ1bmN0aW9uKGF0dHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGF0dHIudHJpbSgpLnJlcGxhY2UoL1xcKC4rLyxcIlwiKTtcclxuICAgIH0sXHJcbn07XHJcbiIsImltcG9ydCB7IElubGluZVBhcnNlciwgUGFyc2VkRm9yLCBQYXJzZWRUZXh0LCBBdHRyaWJ1dGUsIFBhcnNlZFNob3cgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgUGF0dGVybnMgfSBmcm9tIFwiLi9QYXR0ZXJuc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBhcnNlcjogSW5saW5lUGFyc2VyID0ge1xyXG4gICAgZXNjYXBlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2VBbGwoXCIkXCIsIFwiXFxcXCRcIikucmVwbGFjZUFsbChcIi5cIiwgXCJcXFxcLlwiKTtcclxuICAgIH0sXHJcbiAgICBwYXJzZXIoZXhwcjogYW55KTogYW55IHtcclxuICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKGByZXR1cm4gJHtleHByfWApKCk7XHJcbiAgICB9LFxyXG4gICAgcGFyc2VkRGF0YVNob3dBdHRyKGRhdGE6IEF0dHJpYnV0ZSk6IFBhcnNlZFNob3cge1xyXG4gICAgICAgIGxldCB2YWwgPSAoUGF0dGVybnMudmFycy52YXJpYWJsZUV4cHJlc3Npb24udGVzdChkYXRhLmF0dHIpKSBcclxuICAgICAgICAgICAgPyBkYXRhLmF0dHIucmVwbGFjZShQYXR0ZXJucy52YXJzLnZhbHVlLCBcIlwiKS50cmltKClcclxuICAgICAgICAgICAgOiBPYmplY3QuZW50cmllcyhQYXR0ZXJucy5zaG93KS5maW5kKChbLCByZWdleHBdKSA9PiByZWdleHAudGVzdChkYXRhLmF0dHIpKSFbMF07XHJcblxyXG4gICAgICAgIGxldCBwYXJzZSA9IGAkeygoUGF0dGVybnMudmFycy5lcXVhbGl0eS5leGVjKGRhdGEuYXR0cikpIHx8IFtcIj09XCJdKVswXX0gJHt2YWx9YDtcclxuXHJcbiAgICAgICAgY29uc3QgdmFyTmFtZTogc3RyaW5nID0gZGF0YS5hdHRyLm1hdGNoKC9cXHcrLykhWzBdLFxyXG4gICAgICAgICAgICBwYXJlbnRWYXIgPSBkYXRhLm5vZGUuZGF0YVt2YXJOYW1lXTtcclxuXHJcbiAgICAgICAgaWYoIXBhcmVudFZhcilcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBBIGRhdGEgd2l0aCB0aGUgJyR7dmFyTmFtZX0nIGNvdWxkbid0IGJlIGZvdW5kIGluIHRoZSAnJHtkYXRhLm5vZGUubmFtZX0nYCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHZhcmlhYmxlOiBwYXJlbnRWYXIsIFxyXG4gICAgICAgICAgICB2YWx1ZTogcGFyc2UsXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBwYXJzZURhdGFUZXh0QXR0cihkYXRhOiBBdHRyaWJ1dGUpOiBQYXJzZWRUZXh0IHtcclxuICAgICAgICBsZXQgdHlwZSA9IE9iamVjdC5rZXlzKFBhdHRlcm5zLnRleHQpXHJcbiAgICAgICAgICAgIC5maW5kKChwYXR0ZXJuKSA9PiBQYXR0ZXJucy50ZXh0W3BhdHRlcm5dLnRlc3QoZGF0YS5hdHRyKSk7XHJcblxyXG4gICAgICAgIGlmKCF0eXBlKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlIHZhbHVlIG9mIHRoZSAnZGF0YS10ZXh0JyBhdHRyaWJ1dGUgY29udGFpbnMgaW52YWxpZCBleHByZXNzaW9uc1wiKTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB2YXJOYW1lOiBzdHJpbmcgPSBQYXR0ZXJucy50ZXh0Lmp1c3RWYXJpYWJsZS5leGVjKGRhdGEuYXR0cikhWzBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwYXJzZWQ6IFBhcnNlZFRleHQgPSB7IHZhcmlhYmxlOiBkYXRhLm5vZGUuZGF0YVt2YXJOYW1lXSB9O1xyXG5cclxuICAgICAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwianVzdFZhcmlhYmxlXCIgOiB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZWQudmFsdWUgPSBwYXJzZWQudmFyaWFibGUudmFsdWU7XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIFwic2luZ2xlT2JqZWN0XCIgOiB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZWQudmFsdWUgPSBwYXJzZWQudmFyaWFibGUudmFsdWVbZGF0YS5hdHRyLm1hdGNoKFBhdHRlcm5zLnRleHQuaW5kZXhWYWx1ZSkhWzBdXTtcclxuICAgICAgICAgICAgfSBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJuZXN0ZWRPYmplY3RcIiA6IHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgc2VwYXJlZDogc3RyaW5nW10gPSBkYXRhLmF0dHIuc3BsaXQoL1xcW3xcXF18XFwufFxcJy9nKS5maWx0ZXIodyA9PiB3ICE9PSBcIlwiKS5zbGljZSgxKSxcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG51bWJlciA9IHNlcGFyZWQubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpbmROZXN0ZWRQcm9wKHZhcmlhYmxlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSwgcG9zOiBudW1iZXIgPSAwKTogYW55IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgb2JqID0gdmFyaWFibGVbc2VwYXJlZFtwb3NdXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHBvcyA9PSBsZW5ndGgtMSkgPyBvYmogOiBmaW5kTmVzdGVkUHJvcChvYmosIHBvcyArIDEpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJzZWQudmFsdWUgPSBmaW5kTmVzdGVkUHJvcChwYXJzZWQudmFyaWFibGUudmFsdWUpO1xyXG4gICAgICAgICAgICB9IGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcclxuICAgIH0sXHJcbiAgICBwYXJzZURhdGFGb3JBdHRyKGRhdGE6IEF0dHJpYnV0ZSk6IFBhcnNlZEZvciB7XHJcbiAgICAgICAgbGV0IHBhcnNlZERhdGE6IFBhcnNlZEZvciA9IHt9O1xyXG5cclxuICAgICAgICBsZXQgZXhwcmVzc2lvbnM6IHN0cmluZ1tdID0gZGF0YS5hdHRyLnNwbGl0KFwiIFwiKTtcclxuXHJcbiAgICAgICAgaWYoZXhwcmVzc2lvbnMubGVuZ3RoID4gMykgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIlRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtZm9yJyBhdHRyaWJ1dGUgY29udGFpbnMgaW52YWxpZCBleHByZXNzaW9uc1wiKTtcclxuICAgICAgICBcclxuICAgICAgICBwYXJzZWREYXRhLmV4cHJlc3Npb25zID0gZXhwcmVzc2lvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHZhcmlhYmxlID0gT2JqZWN0LmtleXMoZGF0YS5ub2RlLmRhdGEpLmZpbmQoKHZhcmlhYmxlKSA9PiB2YXJpYWJsZSA9PSBleHByZXNzaW9uc1syXSk7XHJcblxyXG4gICAgICAgIGlmKCF2YXJpYWJsZSkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgQSB2YXJpYWJsZSB3aXRoIHRoZSBuYW1lICR7ZXhwcmVzc2lvbnNbMl19IGNvdWxkbid0IGJlIGZvdW5kIGluIHRoZSBkYXRhIG9mIHlvdXIgJHtkYXRhLm5vZGUubmFtZX0oKSBjb21wb25lbnRgKTtcclxuICAgICAgICBlbHNlIHBhcnNlZERhdGEudmFyaWFibGUgPSBkYXRhLm5vZGUuZGF0YVt2YXJpYWJsZV07XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZWREYXRhO1xyXG4gICAgfSxcclxufTsiLCJpbXBvcnQgeyBQYXJzZWREYXRhIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgTWFnaWNzOiB7IFtmdW5jOiBzdHJpbmddOiBGdW5jdGlvbiB9ID0ge1xyXG4gICAgaW5jcmVtZW50KHZhcmlhYmxlOiBQYXJzZWREYXRhKTogdm9pZCB7XHJcbiAgICAgICAgdmFyaWFibGUudmFsdWUrKztcclxuICAgIH0sXHJcbiAgICBkZWNyZW1lbnQodmFyaWFibGU6IFBhcnNlZERhdGEpOiB2b2lkIHtcclxuICAgICAgICB2YXJpYWJsZS52YWx1ZS0tO1xyXG4gICAgfSxcclxuICAgIHRvZ2dsZSh2YXJpYWJsZTogUGFyc2VkRGF0YSk6IHZvaWQge1xyXG4gICAgICAgIHZhcmlhYmxlLnZhbHVlID0gIXZhcmlhYmxlLnZhbHVlO1xyXG4gICAgfSxcclxuICAgIHNldCh2YXJpYWJsZTogUGFyc2VkRGF0YSwgdmFsdWU6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIHZhcmlhYmxlLnZhbHVlID0gdmFsdWU7XHJcbiAgICB9LFxyXG59OyIsImltcG9ydCB7IFBhdHRlcm4gfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBQYXR0ZXJuczogUGF0dGVybiA9IHtcclxuICAgIG1hZ2ljczoge1xyXG4gICAgICAgIGVsOiAvXFwkZWwvLFxyXG4gICAgICAgIGNoZWNrTWFnaWM6IC9eXFwkbWFnaWNzLi8sXHJcbiAgICB9LFxyXG4gICAgdmFyczoge1xyXG4gICAgICAgIHZhcmlhYmxlRXhwcmVzc2lvbjogL15bYS16QS1aXSsoXFxzKT8oPHw+fCF8PSk/PS9nLFxyXG4gICAgICAgIHZhcmlhYmxlTmFtZTogL15bYS16QS1aXSsvLFxyXG4gICAgICAgIGVxdWFsaXR5OiAvKDx8PnwhKT89ezEsM30vZyxcclxuICAgICAgICB2YWx1ZTogL14uKig8fD58PSkvZyxcclxuICAgIH0sXHJcbiAgICB0ZXh0OiB7XHJcbiAgICAgICAganVzdFZhcmlhYmxlOiAvXlthLXpBLVpdKyQvLFxyXG4gICAgICAgIHNpbmdsZU9iamVjdCA6IC9eW2EtekEtWl0rKChcXC5bYS16QS16XSopfChcXFtbMC05XXsxLH1cXF0pKSQvLFxyXG4gICAgICAgIG5lc3RlZE9iamVjdDogL15bYS16QS1aXSsoKFxcLnxcXFspW2EtekEtWjAtOV0rKFxcLnxcXF0pPyl7MSx9W2EtekEtel0kL1xyXG4gICAgfSxcclxuICAgIHNob3c6IHtcclxuICAgICAgICB0cnVlOiAvXlthLXpBLVpdKyQvLFxyXG4gICAgICAgIGZhbHNlOiAvXlxcIVthLXpBLVpdKyQvLFxyXG4gICAgfSxcclxuICAgIGJpbmQ6IHtcclxuICAgICAgICBzdHJpbmc6IC9eKFxcYCkuKlxcMSQvLFxyXG4gICAgICAgIG9iamVjdDogL15cXHsuKlxcfSQvLFxyXG4gICAgICAgICR0aGlzOiAvXFwkdGhpc1xcLmRhdGFcXC5bYS16QS1aXSsvZyxcclxuICAgICAgICBhdHRyOiAvXihAfGRhdGEtKWJpbmQoOik/LyxcclxuICAgICAgICBiaW5kYWJsZTogLyg/PD1eKEB8ZGF0YS0pYmluZCg6KT8pXFx3Ky8sXHJcbiAgICAgICAgbW9kaWZpZXI6IC8oPzw9XFwuKS4qLyxcclxuICAgIH1cclxufTsiLCJleHBvcnQgKiBmcm9tIFwiLi9IZWxwZXJcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vTWFnaWNzXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0NoaWxkc0hlbHBlclwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9JbmxpbmVQYXJzZXJcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUGF0dGVybnNcIjsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgQ2hldmVyZVdpbmRvdywgQ2hldmVyZU5vZGVEYXRhLCBDaGV2ZXJleE5vZGVMaXN0LCBDaGV2ZXJleERhdGFOb2RlLCBBcmd1bWVudHMgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcbmltcG9ydCB7Q2hldmVyZU5vZGUsIENoZXZlcmVEYXRhfSBmcm9tIFwiQGNoZXZlcmVcIjtcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCJAaGVscGVyc1wiO1xuXG5jb25zdCBDaGV2ZXJlOiBDaGV2ZXJlV2luZG93ID0ge1xuICAgbm9kZXM6IFtdLFxuICAgLyoqXG4gICAgKiBGaW5kIGEgQ2hldmVyZURhdGEgYnkgdGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1hdHRhY2hlZCcgYXR0cmlidXRlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0clxuICAgICogQHBhcmFtIHtDaGV2ZXJlRGF0YVtdfSBkYXRhXG4gICAgKiBAcmV0dXJucyBUaGUgZGF0YSByZWFkeSBmb3IgaW5zdGFuY2UgYSBOb2RlTGlzdE9mPEVsZW1lbnQ+XG4gICAgKi9cbiAgIGZpbmRJdHNEYXRhKGF0dHI6IHN0cmluZywgZGF0YTogQ2hldmVyZURhdGFbXSk6IENoZXZlcmVEYXRhIHtcbiAgICAgICBsZXQgc2VhcmNoOiBDaGV2ZXJlRGF0YSB8IHVuZGVmaW5lZCA9IGRhdGEuZmluZCgoZCkgPT4gZC5uYW1lID09IGF0dHIudHJpbSgpLnJlcGxhY2UoL1xcKC4qXFwpLywgXCJcIikpO1xuXG4gICAgICAgIGlmKCFzZWFyY2gpIFxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGAnJHthdHRyfScgY291bGRuJ3QgYmUgZm91bmQgaW4gYW55IG9mIHlvdXIgZGVjbGFyZWQgY29tcG9uZW50c2ApO1xuXG4gICAgICAgcmV0dXJuIHNlYXJjaDtcbiAgIH0sXG4gICAvKipcbiAgICAqIFNlYXJjaCBmb3IgQ2hldmVyZSBOb2RlcyBhdCB0aGUgc2l0ZVxuICAgICogQHBhcmFtIGRhdGEgQWxsIHRoZSBDaGV2ZXJlIGNvbXBvbmVudHNcbiAgICAqL1xuICAgIHN0YXJ0KC4uLmRhdGE6IENoZXZlcmVEYXRhW10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHM6IENoZXZlcmV4Tm9kZUxpc3QgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdltkYXRhLWF0dGFjaGVkXVwiKV1cbiAgICAgICAgICAgIC5tYXAoKGVsZW1lbnQpID0+ICh7IGVsZW06IGVsZW1lbnQsIGRhdGFBdHRyOiBlbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtYXR0YWNoZWRcIil9KSk7XG5cbiAgICAgICAvL0NyZWF0ZSBhIENoZXZlcmVOb2RlIGZvciBlYWNoIGRhdGEtYXR0YWNoZWRcbiAgICAgICBlbGVtZW50cy5mb3JFYWNoKChlbDogQ2hldmVyZXhEYXRhTm9kZSkgPT4ge1xuICAgICAgICAgICBjb25zdCBub2RlOiBDaGV2ZXJlRGF0YSA9IHRoaXMuZmluZEl0c0RhdGEoZWwuZGF0YUF0dHIhLCBkYXRhKTtcblxuICAgICAgICAgICBpZigobm9kZS5pbml0ID09IHVuZGVmaW5lZCkgJiYgKEhlbHBlci5odG1sQXJnc0RhdGFBdHRyKGVsLmRhdGFBdHRyISkgIT0gdW5kZWZpbmVkKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZXJlJ3Mgbm8gaW5pdCBtZXRob2QgZGVmaW5lZCBpbiB5b3VyICcke25vZGUubmFtZX0nIGNvbXBvbmVudGApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAvL0lmIHRoZSBpbml0IG1ldGhvZCBpc24ndCB1bmRlZmluZWRcbiAgICAgICAgICAgaWYobm9kZS5pbml0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vQ2hlY2sgZm9yIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgIGxldCBhcmdzOiBBcmd1bWVudHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRBcmdzOiBIZWxwZXIubWV0aG9kQXJndW1lbnRzKG5vZGUuaW5pdCksXG4gICAgICAgICAgICAgICAgICAgIEhUTUxBcmdzOiBIZWxwZXIuaHRtbEFyZ3NEYXRhQXR0cihlbC5kYXRhQXR0ciEpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICogQ2hlY2sgdGhlIGRpZmYgYmV0d2VlbiB0aGUgYXJ1bWVudHMgYXQgdGhlIEhUTUwgYW5kIHRob3NlIG9uZXMgZGVjbGFyZWQgYXQgXG4gICAgICAgICAgICAgICAgKiB0aGUgaW5pdCgpIG1ldGhvZFxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrRm9ySW5pdEFyZ3VtZW50czogYm9vbGVhbiA9IEhlbHBlci5jb21wYXJlQXJndW1lbnRzKHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJpbml0KClcIixcbiAgICAgICAgICAgICAgICAgICAgaHRtbEFyZ3M6IGFyZ3MuSFRNTEFyZ3MsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZEFyZ3M6IGFyZ3MuaW5pdEFyZ3NcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIChhc3luYygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy9JZiB0aGVyZSdzIG5vIGVycm9ycywgcGFyc2UgdGhlIGFyZ3VtZW50cywgYW5kIGV4ZWN1dGUgdGhlIGluaXQoKSBtZXRob2RcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChjaGVja0ZvckluaXRBcmd1bWVudHMpIFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBhd2FpdCBub2RlLnBhcnNlQXJndW1lbnRzKGFyZ3MuSFRNTEFyZ3MhLCBhcmdzLmluaXRBcmdzISkgXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGF3YWl0IG5vZGUucGFyc2VJbml0KHsgaW5pdDogbm9kZS5pbml0ISB9KTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5ldyBDaGV2ZXJlTm9kZShub2RlLCBlbC5lbGVtKSk7XG4gICAgICAgfSk7XG4gICB9LFxuICAgZGF0YShkYXRhOiBDaGV2ZXJlTm9kZURhdGEpOiBDaGV2ZXJlRGF0YSB7XG4gICAgICAgcmV0dXJuIG5ldyBDaGV2ZXJlRGF0YShkYXRhKTtcbiAgIH0sXG59O1xuXG53aW5kb3cuQ2hldmVyZSA9IENoZXZlcmU7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9