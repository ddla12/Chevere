/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
        //Give it an ID for the element
        this.element = data.element;
        this.element.setAttribute("data-id", _helpers_1.Helper.setDataId(10));
        //Get the type of event
        this.event = data.event;
        //The value of the attribure
        this.attrVal = data.attrVal;
        this.parent = data.parent;
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
        let methodName = this.attrVal.replace(/\(.+/, "");
        if ((!this.parent.args[methodName]) || (_helpers_1.Helper.isEmpty(this.parent.args[methodName])))
            return;
        //The args
        let htmlArgs = _helpers_1.Helper.htmlArgsDataAttr(this.attrVal), parentArgs = this.parent.args[methodName];
        //Check for errors in the argments
        _helpers_1.Helper.compareArguments({
            method: methodName,
            component: this.parent.name,
            htmlArgs: htmlArgs,
            methodArgs: parentArgs,
        });
        let final = _helpers_1.Helper.getRealValuesInArguments({
            args: htmlArgs,
            name: this.parent.name,
            method: methodName
        });
        //Create the argument object
        let argsObj = {};
        for (let i in parentArgs)
            argsObj[parentArgs[+(i)]] = final[+(i)];
        return argsObj;
    }
    searchMethod() {
        let val = this.attrVal.replace(/\(.+/, "");
        let method = this.parent.methods[val];
        if (!method)
            throw new ReferenceError(`There's no method ${val} in the data-attached scope`);
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
        this.element = data.element;
        this.parent = data.parent;
        let parsed = _helpers_1.Parser.parseDataForAttr(this.element.getAttribute("data-for"), this.parent);
        this.variable = parsed.variable;
        this.expressions = parsed.expressions;
        if (typeof this.variable.value == "string")
            throw new EvalError(`Cannot set a 'for..in' loop in type ${typeof this.variable.value}`);
        this.loopElements();
        this.element.remove();
    }
    ;
    loopElements() {
        let pos = Array.from(this.parent.element.children).indexOf(this.element);
        const template = document.createDocumentFragment(), element = this.element.content.querySelector("div:first-child");
        if (!element)
            throw new Error("The first child of your data-for element must be a div element");
        const thisChilds = [...element.querySelectorAll(`*`)];
        const LoopText = thisChilds
            .filter((child) => child.getAttribute("data-text")?.startsWith(this.expressions[0]));
        const parentText = thisChilds
            .filter((child) => !child.getAttribute("data-text")?.startsWith(this.expressions[0]));
        LoopText.forEach(el => {
            el.setAttribute("data-text", `${this.variable.nombre}[]` + el.getAttribute("data-text")?.replace(this.expressions[0], ""));
            console.log(el.getAttribute("data-text"));
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
            parentText
                .forEach(element => {
                this.parent.childs["data-text"].push(new TextNode_1.TextNode({
                    element: element,
                    parent: this.parent
                }));
            });
            template.appendChild(document.importNode(element, true));
        }
        ;
        this.parent.element.insertBefore(template, this.parent.element.children[pos]);
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
        this.parent = input.parent;
        this.element = input.element;
        //Search if the indicated variable of the data-model attribute exists in the scope
        this.variable = this.getVariable();
        //Set the default value
        this.element.value = this.parent.data[this.variable].value.toString();
        //Add the listener
        this.element.addEventListener("input", () => {
            this.syncText();
        });
    }
    assignText(value) {
        this.element.value = value.toString();
    }
    syncText() {
        this.parent.data[this.variable].value = this.element.value.toString();
    }
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

/***/ "./src/ts/actions/TextNode.ts":
/*!************************************!*\
  !*** ./src/ts/actions/TextNode.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextNode = void 0;
const _helpers_1 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
const _helpers_2 = __webpack_require__(/*! @helpers */ "./src/ts/utils/index.ts");
class TextNode {
    constructor(data) {
        this.element = data.element;
        this.element.setAttribute("data-id", _helpers_2.Helper.setDataId(10));
        this.parent = data.parent;
        this.variable = this.element.getAttribute("data-text");
    }
    set value(value) {
        this._value = value.toString();
        this.element.textContent = this._value;
    }
    set variable(attr) {
        _helpers_2.Helper.checkForErrorInVariable(attr);
        let data = _helpers_1.Parser.parseDataTextAttr(attr, this.parent);
        this._variable = data.variable;
        this.value = data.value;
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
        this.name = data.name;
        this.data = data.data;
        this.init = data.init;
        this.methods = data.methods;
    }
    /**
     * Parse the arguments of th init() method
     * @param {string[]} htmlArgs The arguments of de data-attached attribute
     * @param {string[]} initArgs The arguments defined in the init() method
     */
    parseArguments(htmlArgs, methodArgs) {
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
        this.parseInit({
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
    parseInit(init) {
        let initFunc = _helpers_1.Helper.contentOfFunction(init.init);
        //Finds the real arguments and no expressions with the same name
        if (init.args) {
            Object.keys(init.args).forEach((arg) => {
                let str = `(?<=(=\\s)|(\\()|(=))(${arg})`;
                initFunc = initFunc.replace(new RegExp(str, "g"), `$args.${arg}`);
            });
        }
        //Create the new parsed init function
        let newFunc = new Function("{$this = undefined, $args = undefined}", initFunc);
        //Return the new init function and executes it
        return newFunc({
            $this: this,
            $args: init.args,
        });
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
            "data-for": []
        };
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
        Object.keys(data).forEach((d) => {
            obj.push([d, this.parsedObj(d, data[d])]);
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
        const eventNodes = _helpers_1.ChildsHelper.getElementsByDataOnAttr(this.element), textNodes = _helpers_1.ChildsHelper.getElementsByDataTextAttr(this.element), modelNodes = _helpers_1.ChildsHelper.getElementsByDataModelAttr(this.element), loopNodes = _helpers_1.ChildsHelper.getElementsByDataFor(this.element);
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
        if (textNodes) {
            textNodes.forEach((text) => {
                this.childs["data-text"].push(new _actions_1.TextNode({
                    element: text,
                    parent: this,
                }));
            });
        }
        ;
        //Text Inputs with model
        if (modelNodes) {
            modelNodes.forEach((input) => {
                this.childs["data-model"].push(new _actions_1.ModelNode({
                    element: input,
                    parent: this,
                }));
            });
        }
        ;
        //For nodes
        if (loopNodes) {
            loopNodes.forEach((loop) => {
                this.childs["data-for"].push(new _actions_1.LoopNode({
                    element: loop,
                    parent: this
                }));
            });
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
                //There's a weird delay when you try to sync all inputs, I don't know why
                window.setTimeout(() => {
                    self.childs["data-text"].filter((text) => text._variable.nombre == this.nombre).forEach((text) => {
                        text.value = value;
                    });
                }, 100);
                //Sync text with all inputs that have this variable as model in their 'data-model' attribute
                self.childs["data-model"].filter((input) => input.variable == this.nombre).forEach((input) => {
                    input.assignText(value);
                });
                this._value = value;
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
        event.elem.addEventListener(event.type, () => {
            event.action({
                $this: this,
                $args: event.args
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
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChildsHelper = void 0;
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
        const rounded = (num) => Math.floor(Math.random() * num);
        const chars = {
            letters: "abcdefghijklmnopqrstuvwxyz",
            mayus: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            numbers: "0123456789",
        };
        for (let i = 0; i <= length; i++) {
            let rkey = Object.keys(chars)[rounded(2)];
            final += chars[rkey][rounded(length)];
        }
        return final;
    },
    checkForErrorInVariable(str) {
        const pattern = /^[0-9]|\s/g;
        if (pattern.test(str))
            throw new SyntaxError("Variable name cannot start with a number or have spaces");
    },
    htmlArgsDataAttr(dataAttached) {
        if (!dataAttached.match(/\(.+/))
            return;
        let onlyAttrs = dataAttached.replace(/^(\w+\()|\)+$/g, "").replace(" ", "");
        return (onlyAttrs) ? onlyAttrs.split(",") : undefined;
    },
    methodArguments(method) {
        let onlyArgs = method.toString()
            .replace(/\{.*/gs, "")
            .replace(/\s/g, "")
            .replace(/^(\w+\()|\)+$/g, "");
        return (onlyArgs) ? onlyArgs.split(",") : undefined;
    },
    getRealValuesInArguments(data) {
        let final = data.args.map((arg) => {
            //Try get a valid value
            const func = () => new Function(`return ${arg}`);
            try {
                func()();
            }
            catch (error) {
                throw new Error(`${error}, check the values of your ${data.method}, at one of your '${data.name}' components`);
            }
            //Return the value
            return func()();
        });
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
            .replace(/(^\w.*\{)/g, "")
            .replace(/\}$/, "")
            .trim();
    }
};


/***/ }),

/***/ "./src/ts/utils/InlineParser.ts":
/*!**************************************!*\
  !*** ./src/ts/utils/InlineParser.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Parser = void 0;
exports.Parser = {
    patterns: {
        global: {
            variableExpression: /^\w+|\<\=|\>\=|\=|\<|\>|\![a-zA-z]+|[a-zA-Z]+/,
            variableName: /(\..*)|(\[.*)/,
            indexValue: /(\[{0}([0-9]+)\]{0})|(\.{0}\w+$)/g,
        },
        text: {
            justVariable: /^[a-zA-Z]+$/,
            singleObject: /^[a-zA-Z]+((\.[a-zA-z]*$)|(\[[0-9]{1,}\]$))/,
            nestedObject: /^[a-zA-Z]+((\.[a-zA-Z].+){1}|(\[.+\].+))/
        }
    },
    parseDataTextAttr(attr, node) {
        let type = Object.keys(this.patterns.text)
            .find((pattern) => this.patterns.text[pattern].test(attr));
        if (!type)
            throw new SyntaxError("The value of the 'data-text' attribute contains invalid expressions");
        const varName = attr.replace(this.patterns.global.variableName, "");
        let data = { variable: node.data[varName] };
        switch (type) {
            case "justVariable":
                {
                    data.value = data.variable.value;
                }
                break;
            case "singleObject":
                {
                    data.value = data.variable.value[attr.match(this.patterns.global.indexValue)[0]];
                }
                break;
            case "nestedObject":
                {
                    let separed = attr.split(/\[|\]|\./g).filter(w => w !== "").slice(1), length = separed.length;
                    function findNestedProp(variable, pos = 0) {
                        let obj = variable[separed[pos]];
                        return (pos == length - 1) ? obj : findNestedProp(obj, pos + 1);
                    }
                    ;
                    data.value = findNestedProp(data.variable.value);
                }
                break;
        }
        return data;
    },
    parseDataForAttr(attr, node) {
        let parsedData = {};
        let expressions = attr.split(" ");
        if (expressions.length > 3)
            throw new SyntaxError("The value of the 'data-for' attribute contains invalid expressions");
        parsedData.expressions = expressions;
        let variable = Object.keys(node.data).find((variable) => variable == expressions[2]);
        if (!variable)
            throw new ReferenceError(`A variable with the name ${expressions[2]} couldn't be found in the data of your ${node.name}() component`);
        else
            parsedData.variable = node.data[variable];
        return parsedData;
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
__exportStar(__webpack_require__(/*! ./ChildsHelper */ "./src/ts/utils/ChildsHelper.ts"), exports);
__exportStar(__webpack_require__(/*! ./InlineParser */ "./src/ts/utils/InlineParser.ts"), exports);


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
     * @returns The data ready for instance a CheverexNode
     */
    findItsData(attr, data) {
        let search = data.find((d) => d.name == attr.replace(/\(.*\)/, ""));
        if (search == undefined)
            throw new ReferenceError(`'${attr}' couldn't be found in any of your declared components`);
        else
            return search;
    },
    /**
     * Search for Chevere Nodes at the site
     * @param data All the Chevere components
     */
    start(...data) {
        let [...props] = data;
        const elements = document.querySelectorAll("div[data-attached]");
        //Create a ChevereNode for each data-attached
        elements.forEach((el) => {
            let dataAttachedAttr = el.getAttribute("data-attached");
            const getData = this.findItsData(dataAttachedAttr, props);
            if ((getData.init == undefined) && (_helpers_1.Helper.htmlArgsDataAttr(dataAttachedAttr) != undefined))
                throw new Error(`There's no init method defined in your '${getData.name}' component`);
            //If the init method isn't undefined
            if (getData.init != undefined) {
                //Check for arguments
                let initArgs = _helpers_1.Helper.methodArguments(getData.init);
                let HTMLArgs = _helpers_1.Helper.htmlArgsDataAttr(dataAttachedAttr);
                /**
                 * Check the diff between the aruments at the HTML and those ones declared at
                 * the init() method
                 */
                let checkForInitArguments = _helpers_1.Helper.compareArguments({
                    component: getData.name,
                    method: "init()",
                    htmlArgs: HTMLArgs,
                    methodArgs: initArgs
                });
                //If there's no errors, parse the arguments, and execute the init() method
                if (checkForInitArguments)
                    getData.parseArguments(HTMLArgs, initArgs);
                else
                    getData.parseInit({
                        init: getData.init
                    });
            }
            ;
            let node = new _chevere_1.ChevereNode(getData, el);
            this.nodes.push(node);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFRO29CQUNoQixRQUFRLEVBQUUsUUFBUTtvQkFDbEIsVUFBVSxFQUFFLFFBQVE7aUJBQ3ZCLENBQUMsQ0FBQztnQkFFSCwwRUFBMEU7Z0JBQzFFLElBQUcscUJBQXFCO29CQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUyxFQUFFLFFBQVMsQ0FBQyxDQUFDOztvQkFDbEUsT0FBTyxDQUFDLFNBQVMsQ0FBQzt3QkFDbkIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO3FCQUNyQixDQUFDLENBQUM7YUFDTjtZQUFBLENBQUM7WUFFRixJQUFJLElBQUksR0FBRyxJQUFJLHNCQUFXLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXhDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNELElBQUksQ0FBQyxJQUFxQjtRQUN0QixPQUFPLElBQUksc0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0gsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL0V2ZW50Tm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvTG9vcE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL01vZGVsTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvVGV4dE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL2luZGV4LnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvY2hldmVyZS9DaGV2ZXJlRGF0YS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvQ2hldmVyZU5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9jaGV2ZXJlL2luZGV4LnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvQ2hpbGRzSGVscGVyLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvSGVscGVyLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvSW5saW5lUGFyc2VyLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvdXRpbHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50Q2hpbGQsIFBhcnNlZEFyZ3MsIEFyZ3VtZW50c09iamVjdCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBDaGV2ZXJlTm9kZSB9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudE5vZGUgaW1wbGVtZW50cyBFdmVudENoaWxkIHtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xyXG4gICAgbWV0aG9kPzogRnVuY3Rpb247XHJcbiAgICBldmVudDogc3RyaW5nO1xyXG4gICAgYXR0clZhbDogc3RyaW5nO1xyXG4gICAgYXJncz86IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IEV2ZW50Q2hpbGQpIHtcclxuICAgICAgICAvL0dpdmUgaXQgYW4gSUQgZm9yIHRoZSBlbGVtZW50XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZGF0YS5lbGVtZW50O1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIEhlbHBlci5zZXREYXRhSWQoMTApKTtcclxuXHJcbiAgICAgICAgLy9HZXQgdGhlIHR5cGUgb2YgZXZlbnRcclxuICAgICAgICB0aGlzLmV2ZW50ID0gZGF0YS5ldmVudDtcclxuXHJcbiAgICAgICAgLy9UaGUgdmFsdWUgb2YgdGhlIGF0dHJpYnVyZVxyXG4gICAgICAgIHRoaXMuYXR0clZhbCA9IGRhdGEuYXR0clZhbDtcclxuXHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gZGF0YS5wYXJlbnQ7XHJcblxyXG4gICAgICAgIC8vU2VhcmNoIG1ldGhvZCBhbmQgY2hlY2sgaWYgaXQgaGFzIGFyZ3VtZW50c1xyXG4gICAgICAgIHRoaXMubWV0aG9kID0gdGhpcy5zZWFyY2hNZXRob2QoKTtcclxuICAgICAgICB0aGlzLmFyZ3MgPSB0aGlzLmZpbmRBcmd1bWVudHMoKTtcclxuXHJcbiAgICAgICAgLy9JZiBldmVyeXRoaW5nIGlzIG9rLCB0aGVuIHNldCB0aGUgRXZlbnRcclxuICAgICAgICB0aGlzLnBhcmVudD8uc2V0RXZlbnQoe1xyXG4gICAgICAgICAgICBlbGVtOiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIGFjdGlvbjogdGhpcy5tZXRob2QhLFxyXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmV2ZW50LFxyXG4gICAgICAgICAgICBhcmdzOiB0aGlzLmFyZ3NcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmaW5kQXJndW1lbnRzKCk6IEFyZ3VtZW50c09iamVjdHx1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCBtZXRob2ROYW1lOiBzdHJpbmcgPSB0aGlzLmF0dHJWYWwucmVwbGFjZSgvXFwoLisvLCBcIlwiKTtcclxuXHJcbiAgICAgICAgaWYoKCF0aGlzLnBhcmVudC5hcmdzW21ldGhvZE5hbWVdKSB8fCAoSGVscGVyLmlzRW1wdHkodGhpcy5wYXJlbnQuYXJnc1ttZXRob2ROYW1lXSEpKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL1RoZSBhcmdzXHJcbiAgICAgICAgbGV0IGh0bWxBcmdzOiBQYXJzZWRBcmdzID0gSGVscGVyLmh0bWxBcmdzRGF0YUF0dHIodGhpcy5hdHRyVmFsKSxcclxuICAgICAgICAgICAgcGFyZW50QXJnczogUGFyc2VkQXJncyA9IHRoaXMucGFyZW50LmFyZ3NbbWV0aG9kTmFtZV07XHJcblxyXG4gICAgICAgIC8vQ2hlY2sgZm9yIGVycm9ycyBpbiB0aGUgYXJnbWVudHNcclxuICAgICAgICBIZWxwZXIuY29tcGFyZUFyZ3VtZW50cyh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kTmFtZSxcclxuICAgICAgICAgICAgY29tcG9uZW50OiB0aGlzLnBhcmVudC5uYW1lLFxyXG4gICAgICAgICAgICBodG1sQXJnczogaHRtbEFyZ3MsXHJcbiAgICAgICAgICAgIG1ldGhvZEFyZ3M6IHBhcmVudEFyZ3MsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBmaW5hbCA9IEhlbHBlci5nZXRSZWFsVmFsdWVzSW5Bcmd1bWVudHMoe1xyXG4gICAgICAgICAgICBhcmdzOiBodG1sQXJncyBhcyBzdHJpbmdbXSxcclxuICAgICAgICAgICAgbmFtZTogdGhpcy5wYXJlbnQubmFtZSxcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2ROYW1lXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vQ3JlYXRlIHRoZSBhcmd1bWVudCBvYmplY3RcclxuICAgICAgICBsZXQgYXJnc09iajogQXJndW1lbnRzT2JqZWN0ID0ge307XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSBpbiBwYXJlbnRBcmdzKSBhcmdzT2JqW3BhcmVudEFyZ3NbKyhpKV1dID0gZmluYWxbKyhpKV07XHJcblxyXG4gICAgICAgIHJldHVybiBhcmdzT2JqO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZWFyY2hNZXRob2QoKTogRnVuY3Rpb24ge1xyXG4gICAgICAgIGxldCB2YWw6IHN0cmluZyA9IHRoaXMuYXR0clZhbC5yZXBsYWNlKC9cXCguKy8sIFwiXCIpO1xyXG5cclxuICAgICAgICBsZXQgbWV0aG9kOiBGdW5jdGlvbiA9IHRoaXMucGFyZW50Lm1ldGhvZHMhW3ZhbF07XHJcblxyXG4gICAgICAgIGlmICghbWV0aG9kKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYFRoZXJlJ3Mgbm8gbWV0aG9kICR7dmFsfSBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWApO1xyXG5cclxuICAgICAgICByZXR1cm4gbWV0aG9kO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtDaGV2ZXJlTm9kZX0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcbmltcG9ydCB7IExvb3BFbGVtZW50LCBQYXJzZWREYXRhLCBQYXJzZWRGb3IgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHtUZXh0Tm9kZX0gZnJvbSBcIi4vVGV4dE5vZGVcIjtcclxuaW1wb3J0IHtQYXJzZXJ9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIExvb3BOb2RlIGltcGxlbWVudHMgTG9vcEVsZW1lbnQge1xyXG4gICAgZWxlbWVudDogSFRNTFRlbXBsYXRlRWxlbWVudDtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcbiAgICB2YXJpYWJsZTogUGFyc2VkRGF0YTtcclxuICAgIGV4cHJlc3Npb25zPzogc3RyaW5nW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogTG9vcEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkYXRhLmVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBkYXRhLnBhcmVudDtcclxuXHJcbiAgICAgICAgbGV0IHBhcnNlZDogUGFyc2VkRm9yID0gUGFyc2VyLnBhcnNlRGF0YUZvckF0dHIodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtZm9yXCIpISwgdGhpcy5wYXJlbnQpO1xyXG5cclxuICAgICAgICB0aGlzLnZhcmlhYmxlICAgICAgID0gcGFyc2VkLnZhcmlhYmxlITtcclxuICAgICAgICB0aGlzLmV4cHJlc3Npb25zICAgID0gcGFyc2VkLmV4cHJlc3Npb25zITtcclxuXHJcbiAgICAgICAgaWYodHlwZW9mIHRoaXMudmFyaWFibGUudmFsdWUgPT0gXCJzdHJpbmdcIikgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFdmFsRXJyb3IoYENhbm5vdCBzZXQgYSAnZm9yLi5pbicgbG9vcCBpbiB0eXBlICR7dHlwZW9mIHRoaXMudmFyaWFibGUudmFsdWV9YCk7ICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5sb29wRWxlbWVudHMoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxvb3BFbGVtZW50cygpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSBBcnJheS5mcm9tKHRoaXMucGFyZW50LmVsZW1lbnQuY2hpbGRyZW4pLmluZGV4T2YodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGU6IERvY3VtZW50RnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQuY29udGVudC5xdWVyeVNlbGVjdG9yKFwiZGl2OmZpcnN0LWNoaWxkXCIpO1xyXG5cclxuICAgICAgICBpZighZWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGZpcnN0IGNoaWxkIG9mIHlvdXIgZGF0YS1mb3IgZWxlbWVudCBtdXN0IGJlIGEgZGl2IGVsZW1lbnRcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IHRoaXNDaGlsZHMgPSBbLi4uZWxlbWVudCEucXVlcnlTZWxlY3RvckFsbChgKmApXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgY29uc3QgTG9vcFRleHQgPSB0aGlzQ2hpbGRzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGNoaWxkKSA9PiBjaGlsZC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIik/LnN0YXJ0c1dpdGgodGhpcy5leHByZXNzaW9ucyFbMF0pKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50VGV4dCA9IHRoaXNDaGlsZHNcclxuICAgICAgICAgICAgLmZpbHRlcigoY2hpbGQpID0+ICFjaGlsZC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIik/LnN0YXJ0c1dpdGgodGhpcy5leHByZXNzaW9ucyFbMF0pKTtcclxuXHJcbiAgICAgICAgTG9vcFRleHQuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiLCBcclxuICAgICAgICAgICAgYCR7dGhpcy52YXJpYWJsZS5ub21icmV9W11gICsgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpPy5yZXBsYWNlKHRoaXMuZXhwcmVzc2lvbnMhWzBdLCBcIlwiKSEpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVsLmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSBpbiB0aGlzLnZhcmlhYmxlLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIExvb3BUZXh0XHJcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYXR0clZhbDogc3RyaW5nID0gKCsoaSkgPT0gMCkgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIik/LnJlcGxhY2UoXCJbXVwiICwgYFske2l9XWApISBcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBlbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8ucmVwbGFjZSgvXFxbWzAtOV0rXFxdLywgYFske2l9XWApIVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIsIGF0dHJWYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuY2hpbGRzIVtcImRhdGEtdGV4dFwiXS5wdXNoKG5ldyBUZXh0Tm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHBhcmVudFRleHRcclxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmNoaWxkcyFbXCJkYXRhLXRleHRcIl0ucHVzaChuZXcgVGV4dE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0ZW1wbGF0ZS5hcHBlbmRDaGlsZChkb2N1bWVudC5pbXBvcnROb2RlKGVsZW1lbnQsIHRydWUpKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMucGFyZW50LmVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRlbXBsYXRlLCB0aGlzLnBhcmVudC5lbGVtZW50LmNoaWxkcmVuW3Bvc10pO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZU5vZGUgfSBmcm9tIFwiQGNoZXZlcmVcIjtcbmltcG9ydCB7IElucHV0TW9kZWwgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCJAaGVscGVyc1wiO1xuXG4vKipcbiAqIFRoZSBjbGFzcyBmb3IgdGhvc2UgaW5wdXRzIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgYGRhdGEtbW9kZWxgIGF0dHJpYnV0ZVxuICogIEBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgTW9kZWxOb2RlIGltcGxlbWVudHMgSW5wdXRNb2RlbCB7XG4gICAgZWxlbWVudDogSFRNTFRleHRBcmVhRWxlbWVudCB8IEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcbiAgICB2YXJpYWJsZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoaW5wdXQ6IElucHV0TW9kZWwpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBpbnB1dC5wYXJlbnQ7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGlucHV0LmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudDtcblxuICAgICAgICAvL1NlYXJjaCBpZiB0aGUgaW5kaWNhdGVkIHZhcmlhYmxlIG9mIHRoZSBkYXRhLW1vZGVsIGF0dHJpYnV0ZSBleGlzdHMgaW4gdGhlIHNjb3BlXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmdldFZhcmlhYmxlKCk7XG5cbiAgICAgICAgLy9TZXQgdGhlIGRlZmF1bHQgdmFsdWVcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZS50b1N0cmluZygpO1xuXG4gICAgICAgIC8vQWRkIHRoZSBsaXN0ZW5lclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3luY1RleHQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXNzaWduVGV4dCh2YWx1ZTogYW55KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3luY1RleHQoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUgPSB0aGlzLmVsZW1lbnQudmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBnZXRWYXJpYWJsZSgpOiBzdHJpbmcge1xuICAgICAgICBsZXQgYXR0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLW1vZGVsXCIpITtcblxuICAgICAgICBIZWxwZXIuY2hlY2tGb3JFcnJvckluVmFyaWFibGUoYXR0cik7XG5cbiAgICAgICAgbGV0IHZhcmlhYmxlID0gT2JqZWN0LmtleXModGhpcy5wYXJlbnQuZGF0YSkuZmluZChcbiAgICAgICAgICAgIChkYXRhKSA9PiBkYXRhID09IGF0dHIsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCF2YXJpYWJsZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcbiAgICAgICAgICAgICAgICBgVGhlcmUncyBubyBhICcke2F0dHJ9JyB2YXJpYWJsZSBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB2YXJpYWJsZTtcbiAgICB9XG59IiwiaW1wb3J0IHtQYXJzZXJ9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5pbXBvcnQgeyBUZXh0UmVsYXRpb24sIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7Q2hldmVyZU5vZGV9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUZXh0Tm9kZSBpbXBsZW1lbnRzIFRleHRSZWxhdGlvbiB7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIF92YXJpYWJsZT86IGFueTtcclxuICAgIF92YWx1ZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IFRleHRSZWxhdGlvbikge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGRhdGEuZWxlbWVudDtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBIZWxwZXIuc2V0RGF0YUlkKDEwKSk7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gZGF0YS5wYXJlbnQ7XHJcblxyXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpITtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLl92YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFyaWFibGUoYXR0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgSGVscGVyLmNoZWNrRm9yRXJyb3JJblZhcmlhYmxlKGF0dHIpO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBhcnNlci5wYXJzZURhdGFUZXh0QXR0cihhdHRyLCB0aGlzLnBhcmVudCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3ZhcmlhYmxlID0gZGF0YS52YXJpYWJsZTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gZGF0YS52YWx1ZTtcclxuICAgIH1cclxufSIsImV4cG9ydCAqIGZyb20gXCIuL0V2ZW50Tm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Mb29wTm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Nb2RlbE5vZGVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vVGV4dE5vZGVcIjsiLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZURhdGEsIERhdGFUeXBlLCBNZXRob2RUeXBlLCBBcmd1bWVudHNPYmplY3QsIEluaXQgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG4vKipcclxuICogIFRoZSBjbGFzcyB0aGF0IHVzZXJzIGNyZWF0ZSB0aGVpciBjb21wb25lbnRzXHJcbiAqICBAY2xhc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlRGF0YSBpbXBsZW1lbnRzIENoZXZlcmVOb2RlRGF0YSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBkYXRhOiBEYXRhVHlwZTtcclxuICAgIGluaXQ/OiBGdW5jdGlvbjtcclxuICAgIG1ldGhvZHM/OiBNZXRob2RUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVOb2RlRGF0YSkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhLmRhdGE7XHJcbiAgICAgICAgdGhpcy5pbml0ID0gZGF0YS5pbml0O1xyXG4gICAgICAgIHRoaXMubWV0aG9kcyA9IGRhdGEubWV0aG9kcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBhcmd1bWVudHMgb2YgdGggaW5pdCgpIG1ldGhvZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gaHRtbEFyZ3MgVGhlIGFyZ3VtZW50cyBvZiBkZSBkYXRhLWF0dGFjaGVkIGF0dHJpYnV0ZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gaW5pdEFyZ3MgVGhlIGFyZ3VtZW50cyBkZWZpbmVkIGluIHRoZSBpbml0KCkgbWV0aG9kXHJcbiAgICAgKi9cclxuICAgIHBhcnNlQXJndW1lbnRzKGh0bWxBcmdzOiBzdHJpbmdbXSwgbWV0aG9kQXJnczogc3RyaW5nW10pOiB2b2lkIHtcclxuXHJcbiAgICAgICAgLy9HZXQgYSB2YWxpZCB2YWx1ZSBmb3IgdGhlIGFyZ3VtZW50LCBmb3IgZXhhbXBsZSwgY2hlY2sgZm9yIHN0cmluZ3Mgd2l0aCB1bmNsb3NlZCBxdW90ZXNcclxuICAgICAgICBsZXQgZmluYWwgPSBIZWxwZXIuZ2V0UmVhbFZhbHVlc0luQXJndW1lbnRzKHtcclxuICAgICAgICAgICAgYXJnczogaHRtbEFyZ3MsXHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgbWV0aG9kOiBcImluaXQoKVwiXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vQ3JlYXRlIHRoZSBhcmd1bWVudCBvYmplY3RcclxuICAgICAgICBsZXQgYXJnc09iajogQXJndW1lbnRzT2JqZWN0ID0ge307XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSBpbiBtZXRob2RBcmdzKSBhcmdzT2JqW21ldGhvZEFyZ3NbaV1dID0gZmluYWxbaV07XHJcblxyXG4gICAgICAgIC8vLi4uYW5kIHBhc3MgaXQgdG8gdGhlIHVucGFyc2VkIGluaXQgZnVuY3Rpb25cclxuICAgICAgICB0aGlzLnBhcnNlSW5pdCh7XHJcbiAgICAgICAgICAgIGluaXQ6IHRoaXMuaW5pdCEsXHJcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3NPYmosXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgaW5pdCBmdW5jdGlvbiBhbmQgZXhlY3V0ZXMgaXRcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGluaXQgVGhlIHVucGFyc2VkIGluaXQgZnVuY3Rpb25cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIFRoZSBwYXJzZWQgY3VzdG9tIGFyZ3VtZW50c1xyXG4gICAgICogQHJldHVybnMgdGhlIGluaXQgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgcGFyc2VJbml0KGluaXQ6IEluaXQpOiBGdW5jdGlvbiB7XHJcblxyXG4gICAgICAgIGxldCBpbml0RnVuYzogc3RyaW5nID0gSGVscGVyLmNvbnRlbnRPZkZ1bmN0aW9uKGluaXQuaW5pdCk7XHJcblxyXG4gICAgICAgIC8vRmluZHMgdGhlIHJlYWwgYXJndW1lbnRzIGFuZCBubyBleHByZXNzaW9ucyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAgICBpZiAoaW5pdC5hcmdzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGluaXQuYXJncykuZm9yRWFjaCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RyOiBzdHJpbmcgPSBgKD88PSg9XFxcXHMpfChcXFxcKCl8KD0pKSgke2FyZ30pYDtcclxuICAgICAgICAgICAgICAgIGluaXRGdW5jID0gaW5pdEZ1bmMucmVwbGFjZShuZXcgUmVnRXhwKHN0ciwgXCJnXCIpLCBgJGFyZ3MuJHthcmd9YCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9DcmVhdGUgdGhlIG5ldyBwYXJzZWQgaW5pdCBmdW5jdGlvblxyXG4gICAgICAgIGxldCBuZXdGdW5jOiBGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbihcclxuICAgICAgICAgICAgXCJ7JHRoaXMgPSB1bmRlZmluZWQsICRhcmdzID0gdW5kZWZpbmVkfVwiLFxyXG4gICAgICAgICAgICBpbml0RnVuYyxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL1JldHVybiB0aGUgbmV3IGluaXQgZnVuY3Rpb24gYW5kIGV4ZWN1dGVzIGl0XHJcbiAgICAgICAgcmV0dXJuIG5ld0Z1bmMoe1xyXG4gICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgJGFyZ3M6IGluaXQuYXJncyxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IENoZXZlcmVFbGVtZW50LCBNZXRob2RUeXBlLCBEYXRhVHlwZSwgQ2hpbGQsIENoZXZlcmVFdmVudCwgUGFyc2VkRGF0YSwgRXZlbnRFbGVtZW50cywgUGFyc2VkQXJncyB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQge0NoZXZlcmVEYXRhfSBmcm9tIFwiLi9DaGV2ZXJlRGF0YVwiO1xyXG5pbXBvcnQge0V2ZW50Tm9kZSwgVGV4dE5vZGUsIE1vZGVsTm9kZSwgTG9vcE5vZGUgfSBmcm9tIFwiQGFjdGlvbnNcIjtcclxuaW1wb3J0IHsgSGVscGVyLCBDaGlsZHNIZWxwZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlTm9kZSBpbXBsZW1lbnRzIENoZXZlcmVFbGVtZW50IHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGRhdGE6IERhdGFUeXBlO1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIG1ldGhvZHM/OiBNZXRob2RUeXBlO1xyXG4gICAgZWxlbWVudDogRWxlbWVudDtcclxuICAgIGFyZ3M6IHsgW21ldGhvZDogc3RyaW5nXTogUGFyc2VkQXJncyB9ID0ge307XHJcbiAgICBjaGlsZHM/OiBDaGlsZCA9IHtcclxuICAgICAgICBcImV2ZW50XCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS10ZXh0XCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1tb2RlbFwiOiBbXSxcclxuICAgICAgICBcImRhdGEtZm9yXCI6IFtdXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVEYXRhLCBlbDogRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLnBhcnNlRGF0YShkYXRhLmRhdGEpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgUGFyc2UgYWxsICR0aGlzLCAkc2VsZiwgJGRhdGEuLi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm1ldGhvZHMgPSB0aGlzLnBhcnNlTWV0aG9kcyhkYXRhLm1ldGhvZHMpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgdGhlIHBhcmVudCBgZGl2YCBhbmQgZ2l2ZSBpdCBhIHZhbHVlIGZvciB0aGUgZGF0YS1pZCBhdHRyaWJ1dGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbDtcclxuICAgICAgICB0aGlzLmlkID0gSGVscGVyLnNldERhdGFJZCgxMCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgdGhpcy5pZCk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBHZXQgdGhlIGV2ZW50cyBhbmQgYWN0aW9ucyBvZiB0aGUgY29tcG9uZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIGFsbCB0aGUgZGF0YSwgdGhleSBuZWVkIGdldHRlciBhbmQgYSBzZXR0ZXJcclxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBwcmltaXRpdmUgZGF0YVxyXG4gICAgICovXHJcbiAgICBwYXJzZURhdGEoZGF0YTogRGF0YVR5cGUpIHtcclxuICAgICAgICBsZXQgb2JqOiBbc3RyaW5nLCBQYXJzZWREYXRhXVtdID0gW107XHJcblxyXG4gICAgICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGQpID0+IHtcclxuICAgICAgICAgICAgb2JqLnB1c2goW2QsIHRoaXMucGFyc2VkT2JqKGQsIGRhdGFbZF0pXSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMob2JqKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlZCB0aGUgbWV0aG9kcyBkZXNjcmliZWQgaW4gdGhlIG1ldGhvZCBwcm9wZXJ0eSBvZiB0aGUgZGF0YVxyXG4gICAgICogQHBhcmFtIHtNZXRob2RUeXBlfSBtZXRob2RzXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgbWV0aG9kcyBwYXJzZWRcclxuICAgICAqL1xyXG4gICAgcGFyc2VNZXRob2RzKG1ldGhvZHM/OiBNZXRob2RUeXBlKTogTWV0aG9kVHlwZSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgaWYgKG1ldGhvZHMgPT0gdW5kZWZpbmVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIE9iamVjdC5rZXlzKG1ldGhvZHMpLmZvckVhY2goKG1ldGhvZCkgPT4ge1xyXG4gICAgICAgICAgICAvL0lmIHRoZSBtZXRob2Qgd2FzIGFscmVhZHkgcGFyc2VkXHJcbiAgICAgICAgICAgIGxldCB3YXNQYXJzZWQ6IG51bWJlciA9IG1ldGhvZHNbbWV0aG9kXVxyXG4gICAgICAgICAgICAgICAgLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgICAgIC5zZWFyY2goXCJhbm9ueW1vdXNcIik7XHJcblxyXG4gICAgICAgICAgICBpZiAod2FzUGFyc2VkID09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXJnczogUGFyc2VkQXJncyA9IEhlbHBlci5tZXRob2RBcmd1bWVudHMobWV0aG9kc1ttZXRob2RdKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZihhcmdzKSB0aGlzLmFyZ3NbbWV0aG9kXSA9IGFyZ3M7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnNlZDogc3RyaW5nID0gbWV0aG9kc1ttZXRob2RdXHJcbiAgICAgICAgICAgICAgICAgICAgLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXi4qfFtcXH1dJC9nLCBcIlwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmRhdGEpLmZvckVhY2goKHZhcmlhYmxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VkID0gcGFyc2VkLnJlcGxhY2VBbGwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGAkdGhpcy5kYXRhLiR7dmFyaWFibGV9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCR0aGlzLmRhdGEuJHt2YXJpYWJsZX0udmFsdWVgLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmFyZ3NbbWV0aG9kXSAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFyZ3NbbWV0aG9kXT8uZm9yRWFjaCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdHI6IHN0cmluZyA9IGAoPzw9KD1cXFxccyl8KFxcXFwoKXwoPSkpKCR7YXJnfSlgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWQgPSBwYXJzZWQucmVwbGFjZShuZXcgUmVnRXhwKHN0ciwgXCJnXCIpLCBgJGFyZ3MuJHthcmd9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3RnVuYzogRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ7JHRoaXMgPSB1bmRlZmluZWQsICRldmVudCA9IHVuZGVmaW5lZCwgJGFyZ3MgPSB1bmRlZmluZWR9XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VkLFxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtZXRob2RzW21ldGhvZF0gPSBuZXdGdW5jO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBtZXRob2RzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBhbGwgdGhlIGNoaWxkcmVucyB0aGF0IGhhdmUgYW4gYWN0aW9uIGFuZCBkYXRhXHJcbiAgICAgKi9cclxuICAgIGNoZWNrRm9yQWN0aW9uc0FuZENoaWxkcygpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBbGwgdGhlIGVsZW1lbnRzIHN1cHBvcnRlZCB3aXRoIENoZXZlcmV4XHJcbiAgICAgICAgICogQGNvbnN0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RcclxuICAgICAgICAgICAgZXZlbnROb2RlczogRXZlbnRFbGVtZW50cyAgICAgICAgICAgPSBDaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFPbkF0dHIodGhpcy5lbGVtZW50KSwgXHJcbiAgICAgICAgICAgIHRleHROb2RlcyAgIDogTm9kZUxpc3RPZjxFbGVtZW50PiAgID0gQ2hpbGRzSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhVGV4dEF0dHIodGhpcy5lbGVtZW50KSxcclxuICAgICAgICAgICAgbW9kZWxOb2RlcyAgOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ICAgPSBDaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFNb2RlbEF0dHIodGhpcy5lbGVtZW50KSxcclxuICAgICAgICAgICAgbG9vcE5vZGVzICAgOiBOb2RlTGlzdE9mPEhUTUxUZW1wbGF0ZUVsZW1lbnQ+ID0gQ2hpbGRzSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhRm9yKHRoaXMuZWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vRXZlbnROb2Rlc1xyXG4gICAgICAgIGlmIChldmVudE5vZGVzKSB7XHJcbiAgICAgICAgICAgIGV2ZW50Tm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZXZlbnRcIl0ucHVzaChuZXcgRXZlbnROb2RlKHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBub2RlWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICBldmVudDogbm9kZVsxXSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyVmFsOiBub2RlWzJdLFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvL0RhdGEtdGV4dFxyXG4gICAgICAgIGlmICh0ZXh0Tm9kZXMpIHtcclxuICAgICAgICAgICAgdGV4dE5vZGVzLmZvckVhY2goKHRleHQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtdGV4dFwiXS5wdXNoKG5ldyBUZXh0Tm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogdGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vVGV4dCBJbnB1dHMgd2l0aCBtb2RlbFxyXG4gICAgICAgIGlmIChtb2RlbE5vZGVzKSB7XHJcbiAgICAgICAgICAgIG1vZGVsTm9kZXMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl0ucHVzaChuZXcgTW9kZWxOb2RlKHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBpbnB1dCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vRm9yIG5vZGVzXHJcbiAgICAgICAgaWYgKGxvb3BOb2Rlcykge1xyXG4gICAgICAgICAgICBsb29wTm9kZXMuZm9yRWFjaCgobG9vcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZGF0YS1mb3JcIl0ucHVzaChuZXcgTG9vcE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGxvb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcGFyc2VkIGRhdGEsIHdpdGggdGhlIGdldHRlciBhbmQgc2V0dGVyXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgb2YgdGhlIHVucGFyc2VkIGRhdGEgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoYXQgcHJvcGVydHlcclxuICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgZGF0YVxyXG4gICAgICovXHJcbiAgICBwYXJzZWRPYmoobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogUGFyc2VkRGF0YSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5vbWJyZTogbmFtZSxcclxuICAgICAgICAgICAgX3ZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vVGhlcmUncyBhIHdlaXJkIGRlbGF5IHdoZW4geW91IHRyeSB0byBzeW5jIGFsbCBpbnB1dHMsIEkgZG9uJ3Qga25vdyB3aHlcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0uZmlsdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAodGV4dCkgPT4gdGV4dC5fdmFyaWFibGUubm9tYnJlID09IHRoaXMubm9tYnJlLFxyXG4gICAgICAgICAgICAgICAgICAgICkuZm9yRWFjaCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0LnZhbHVlID0gdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TeW5jIHRleHQgd2l0aCBhbGwgaW5wdXRzIHRoYXQgaGF2ZSB0aGlzIHZhcmlhYmxlIGFzIG1vZGVsIGluIHRoZWlyICdkYXRhLW1vZGVsJyBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgICAgIHNlbGYuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl0uZmlsdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgIChpbnB1dCkgPT4gaW5wdXQudmFyaWFibGUgPT0gdGhpcy5ub21icmUsXHJcbiAgICAgICAgICAgICAgICApLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQuYXNzaWduVGV4dCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQgdmFsdWUoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIGN1c3RvbSBldmVudCBpbiB0aGUgc2NvcGUgb2YgdGhlIGRhdGEtYXR0YWNoZWRcclxuICAgICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdHlwZSwgdGhlIGVsZW1lbnQsIGFuZCB0aGUgZnVuY3Rpb24gd2l0aG91dCBleGVjdXRpbmdcclxuICAgICAqL1xyXG4gICAgc2V0RXZlbnQoZXZlbnQ6IENoZXZlcmVFdmVudCkge1xyXG4gICAgICAgIGV2ZW50LmVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudC50eXBlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LmFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgICAgICRhcmdzOiBldmVudC5hcmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZURhdGFcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZU5vZGVcIjsiLCJpbXBvcnQgeyBFdmVudEVsZW1lbnRzIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgQ2hpbGRzSGVscGVyID0ge1xyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFPbkF0dHIoZWxlbWVudDogRWxlbWVudCk6IEV2ZW50RWxlbWVudHMge1xyXG4gICAgICAgIGxldCBub2RlczogRXZlbnRFbGVtZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAvL0dldCBhbGwgY2hpbGRzIG9mIHRoZSBlbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRzOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKTtcclxuXHJcbiAgICAgICAgLy9QdXNoIHRvIGBub2Rlc2AgYWxsIGVsZW1lbnRzIHdpdGggdGhlICdkYXRhLW9uJyBvciAnQG9uJyBhdHRyaWJ1dGVcclxuICAgICAgICBmb3IobGV0IGNoaWxkIG9mIGNoaWxkcykge1xyXG4gICAgICAgICAgICBmb3IobGV0IGF0dHIgb2YgY2hpbGQuYXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJkYXRhLW9uXCIpKSBcclxuICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKFtjaGlsZCwgYXR0ci5uYW1lLnNwbGl0KFwiOlwiKVsxXSwgYXR0ci5ub2RlVmFsdWUhXSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKGF0dHIubmFtZS5zdGFydHNXaXRoKFwiQG9uXCIpKSBcclxuICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKFtjaGlsZCwgYXR0ci5uYW1lLnJlcGxhY2UoXCJAb25cIiwgXCJcIikudG9Mb3dlckNhc2UoKSwgYXR0ci5ub2RlVmFsdWUhXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIChub2Rlcy5sZW5ndGggPT0gMCkgPyB1bmRlZmluZWQgOiBub2RlcztcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YVRleHRBdHRyKGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLXRleHRdXCIpO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhTW9kZWxBdHRyKGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRbZGF0YS1tb2RlbF0sIHRleHRhcmVhW2RhdGEtbW9kZWxdLCBzZWxlY3RbZGF0YS1tb2RlbF1cIik7XHJcbiAgICB9LFxyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFGb3IoZWxlbWVudDogRWxlbWVudCk6IE5vZGVMaXN0T2Y8SFRNTFRlbXBsYXRlRWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtkYXRhLWZvcl1cIik7XHJcbiAgICB9LFxyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFTaG93KGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLXNob3ddXCIpO1xyXG4gICAgfVxyXG59OyIsImltcG9ydCB7IEFyZ3NFcnJvcnMsIENvbXBhcmVBcmd1bWVudHMsIFBhcnNlZEFyZ3MgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuLyoqXHJcbiAqIEhlbHBlciBjbGFzcywgaXQgcHJvdmlkZSB1c2VmdWxsIG1ldGhvZHMgdG8gQ2hldmVyZSBlbGVtZW50c1xyXG4gKiBAY2xhc3NcclxuICovXHJcbmV4cG9ydCBjb25zdCBIZWxwZXIgPSB7XHJcbiAgICBpc0VtcHR5KG9iajogb2JqZWN0KSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09IDA7XHJcbiAgICB9LFxyXG4gICAgc2V0RGF0YUlkKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgZmluYWw6IHN0cmluZyA9IFwiXCI7XHJcblxyXG4gICAgICAgIGNvbnN0IHJvdW5kZWQ6IEZ1bmN0aW9uID0gKG51bTogbnVtYmVyKTogbnVtYmVyID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG51bSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNoYXJzOiB7IFt0eXBlOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcclxuICAgICAgICAgICAgbGV0dGVycyA6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcclxuICAgICAgICAgICAgbWF5dXMgICA6IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcIixcclxuICAgICAgICAgICAgbnVtYmVycyA6IFwiMDEyMzQ1Njc4OVwiLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBya2V5OiBzdHJpbmcgPSBPYmplY3Qua2V5cyhjaGFycylbcm91bmRlZCgyKV07XHJcbiAgICAgICAgICAgIGZpbmFsICs9IGNoYXJzW3JrZXldW3JvdW5kZWQobGVuZ3RoKV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9LFxyXG4gICAgY2hlY2tGb3JFcnJvckluVmFyaWFibGUoc3RyOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwYXR0ZXJuOiBSZWdFeHAgPSAvXlswLTldfFxccy9nO1xyXG5cclxuICAgICAgICBpZiAocGF0dGVybi50ZXN0KHN0cikpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcclxuICAgICAgICAgICAgICAgIFwiVmFyaWFibGUgbmFtZSBjYW5ub3Qgc3RhcnQgd2l0aCBhIG51bWJlciBvciBoYXZlIHNwYWNlc1wiLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgfSxcclxuICAgIGh0bWxBcmdzRGF0YUF0dHIoZGF0YUF0dGFjaGVkOiBzdHJpbmcpOiBQYXJzZWRBcmdzIHtcclxuICAgICAgICBpZighZGF0YUF0dGFjaGVkLm1hdGNoKC9cXCguKy8pKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBvbmx5QXR0cnM6IHN0cmluZyA9IGRhdGFBdHRhY2hlZC5yZXBsYWNlKC9eKFxcdytcXCgpfFxcKSskL2csIFwiXCIpLnJlcGxhY2UoXCIgXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gKG9ubHlBdHRycykgPyBvbmx5QXR0cnMuc3BsaXQoXCIsXCIpIDogdW5kZWZpbmVkO1xyXG4gICAgfSxcclxuICAgIG1ldGhvZEFyZ3VtZW50cyhtZXRob2Q6IEZ1bmN0aW9uKTogUGFyc2VkQXJncyB7XHJcbiAgICAgICAgbGV0IG9ubHlBcmdzOiBzdHJpbmcgPSBtZXRob2QudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFx7LiovZ3MsIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMvZywgXCJcIilcclxuICAgICAgICAgICAgLnJlcGxhY2UoL14oXFx3K1xcKCl8XFwpKyQvZywgXCJcIik7XHJcblxyXG4gICAgICAgIHJldHVybiAob25seUFyZ3MpID8gb25seUFyZ3Muc3BsaXQoXCIsXCIpIDogdW5kZWZpbmVkOyAgICAgICAgICAgIFxyXG4gICAgfSxcclxuICAgIGdldFJlYWxWYWx1ZXNJbkFyZ3VtZW50cyhkYXRhOiBBcmdzRXJyb3JzKTogYW55W10ge1xyXG4gICAgICAgIGxldCBmaW5hbDogYW55W10gPSBkYXRhLmFyZ3MubWFwKChhcmcpID0+IHtcclxuXHJcbiAgICAgICAgICAgIC8vVHJ5IGdldCBhIHZhbGlkIHZhbHVlXHJcbiAgICAgICAgICAgIGNvbnN0IGZ1bmM6IEZ1bmN0aW9uID0gKCk6IEZ1bmN0aW9uID0+IG5ldyBGdW5jdGlvbihgcmV0dXJuICR7YXJnfWApO1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZ1bmMoKSgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgIGAke2Vycm9yfSwgY2hlY2sgdGhlIHZhbHVlcyBvZiB5b3VyICR7ZGF0YS5tZXRob2R9LCBhdCBvbmUgb2YgeW91ciAnJHtkYXRhLm5hbWV9JyBjb21wb25lbnRzYCxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vUmV0dXJuIHRoZSB2YWx1ZVxyXG4gICAgICAgICAgICByZXR1cm4gZnVuYygpKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBmaW5hbDtcclxuICAgIH0sXHJcbiAgICBjb21wYXJlQXJndW1lbnRzKGRhdGE6IENvbXBhcmVBcmd1bWVudHMpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZXJyb3JQcmU6IHN0cmluZyA9IGBUaGUgJHtkYXRhLm1ldGhvZH0gZnVuY3Rpb24gb2YgdGhlICR7ZGF0YS5jb21wb25lbnR9KCkgY29tcG9uZW50IGA7ICAgICAgICBcclxuXHJcbiAgICAgICAgc3dpdGNoKHRydWUpIHtcclxuICAgICAgICAgICAgY2FzZSAoKCFkYXRhLmh0bWxBcmdzKSAmJiAoIWRhdGEubWV0aG9kQXJncykpOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNhc2UgKChkYXRhLmh0bWxBcmdzICE9IHVuZGVmaW5lZCkgJiYgKCFkYXRhLm1ldGhvZEFyZ3MpKToge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yUHJlICsgYGRvZXNuJ3QgcmVjZWl2ZSBhbnkgcGFyYW1ldGVyYCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNhc2UgKCghZGF0YS5odG1sQXJncykgJiYgKGRhdGEubWV0aG9kQXJncyAhPSB1bmRlZmluZWQpKToge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yUHJlICsgYG5lZWRzIHRvIHJlY2VpdmUgJHtkYXRhLm1ldGhvZEFyZ3N9IHBhcmFtZXRlcnMsIDAgcGFzc2VkYCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNhc2UgKChkYXRhLm1ldGhvZEFyZ3M/Lmxlbmd0aCkgIT0gKGRhdGEuaHRtbEFyZ3M/Lmxlbmd0aCkpOiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JQcmUgKyBgbmVlZHMgdG8gcmVjZWl2ZSAgJHtkYXRhLm1ldGhvZEFyZ3M/Lmxlbmd0aH0gcGFyYW1ldGVycywgXHJcbiAgICAgICAgICAgICAgICAgICAgJHtkYXRhLmh0bWxBcmdzPy5sZW5ndGh9IHBhc3NlZGApXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvbnRlbnRPZkZ1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gZnVuYy50b1N0cmluZygpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8oXlxcdy4qXFx7KS9nLCBcIlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFx9JC8sIFwiXCIpXHJcbiAgICAgICAgICAgIC50cmltKCk7XHJcbiAgICB9XHJcbn07XHJcbiIsImltcG9ydCB7Q2hldmVyZU5vZGV9IGZyb20gXCJAY2hldmVyZVwiO1xyXG5pbXBvcnQgeyBJbmxpbmVQYXJzZXIsIFBhcnNlZEZvciwgUGFyc2VkVGV4dCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBhcnNlcjogSW5saW5lUGFyc2VyID0ge1xyXG4gICAgcGF0dGVybnM6IHtcclxuICAgICAgICBnbG9iYWw6IHtcclxuICAgICAgICAgICAgdmFyaWFibGVFeHByZXNzaW9uOiAvXlxcdyt8XFw8XFw9fFxcPlxcPXxcXD18XFw8fFxcPnxcXCFbYS16QS16XSt8W2EtekEtWl0rLyxcclxuICAgICAgICAgICAgdmFyaWFibGVOYW1lOiAvKFxcLi4qKXwoXFxbLiopLyxcclxuICAgICAgICAgICAgaW5kZXhWYWx1ZTogLyhcXFt7MH0oWzAtOV0rKVxcXXswfSl8KFxcLnswfVxcdyskKS9nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBqdXN0VmFyaWFibGU6IC9eW2EtekEtWl0rJC8sXHJcbiAgICAgICAgICAgIHNpbmdsZU9iamVjdCA6IC9eW2EtekEtWl0rKChcXC5bYS16QS16XSokKXwoXFxbWzAtOV17MSx9XFxdJCkpLyxcclxuICAgICAgICAgICAgbmVzdGVkT2JqZWN0OiAvXlthLXpBLVpdKygoXFwuW2EtekEtWl0uKyl7MX18KFxcWy4rXFxdLispKS9cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcGFyc2VEYXRhVGV4dEF0dHIoYXR0cjogc3RyaW5nLCBub2RlOiBDaGV2ZXJlTm9kZSk6IFBhcnNlZFRleHQge1xyXG4gICAgICAgIGxldCB0eXBlID0gT2JqZWN0LmtleXModGhpcy5wYXR0ZXJucy50ZXh0KVxyXG4gICAgICAgICAgICAuZmluZCgocGF0dGVybikgPT4gdGhpcy5wYXR0ZXJucy50ZXh0W3BhdHRlcm5dLnRlc3QoYXR0cikpO1xyXG5cclxuICAgICAgICBpZighdHlwZSkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIlRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtdGV4dCcgYXR0cmlidXRlIGNvbnRhaW5zIGludmFsaWQgZXhwcmVzc2lvbnNcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgdmFyTmFtZTogc3RyaW5nID0gYXR0ci5yZXBsYWNlKHRoaXMucGF0dGVybnMuZ2xvYmFsLnZhcmlhYmxlTmFtZSwgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGRhdGE6IFBhcnNlZFRleHQgPSB7IHZhcmlhYmxlOiBub2RlLmRhdGFbdmFyTmFtZV0gfTtcclxuXHJcbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBcImp1c3RWYXJpYWJsZVwiIDoge1xyXG4gICAgICAgICAgICAgICAgZGF0YS52YWx1ZSA9IGRhdGEudmFyaWFibGUudmFsdWU7XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIFwic2luZ2xlT2JqZWN0XCIgOiB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLnZhbHVlID0gZGF0YS52YXJpYWJsZS52YWx1ZVthdHRyLm1hdGNoKHRoaXMucGF0dGVybnMuZ2xvYmFsLmluZGV4VmFsdWUpIVswXV07XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIFwibmVzdGVkT2JqZWN0XCIgOiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VwYXJlZDogc3RyaW5nW10gPSBhdHRyLnNwbGl0KC9cXFt8XFxdfFxcLi9nKS5maWx0ZXIodyA9PiB3ICE9PSBcIlwiKS5zbGljZSgxKSxcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG51bWJlciA9IHNlcGFyZWQubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpbmROZXN0ZWRQcm9wKHZhcmlhYmxlOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSwgcG9zOiBudW1iZXIgPSAwKTogYW55IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgb2JqID0gdmFyaWFibGVbc2VwYXJlZFtwb3NdXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHBvcyA9PSBsZW5ndGgtMSkgPyBvYmogOiBmaW5kTmVzdGVkUHJvcChvYmosIHBvcyArIDEpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhLnZhbHVlID0gZmluZE5lc3RlZFByb3AoZGF0YS52YXJpYWJsZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH0sXHJcbiAgICBwYXJzZURhdGFGb3JBdHRyKGF0dHI6IHN0cmluZywgbm9kZTogQ2hldmVyZU5vZGUpOiBQYXJzZWRGb3Ige1xyXG4gICAgICAgIGxldCBwYXJzZWREYXRhOiBQYXJzZWRGb3IgPSB7fTtcclxuXHJcbiAgICAgICAgbGV0IGV4cHJlc3Npb25zOiBzdHJpbmdbXSA9IGF0dHIuc3BsaXQoXCIgXCIpO1xyXG5cclxuICAgICAgICBpZihleHByZXNzaW9ucy5sZW5ndGggPiAzKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1mb3InIGF0dHJpYnV0ZSBjb250YWlucyBpbnZhbGlkIGV4cHJlc3Npb25zXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHBhcnNlZERhdGEuZXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucztcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdmFyaWFibGUgPSBPYmplY3Qua2V5cyhub2RlLmRhdGEpLmZpbmQoKHZhcmlhYmxlKSA9PiB2YXJpYWJsZSA9PSBleHByZXNzaW9uc1syXSk7XHJcblxyXG4gICAgICAgIGlmKCF2YXJpYWJsZSkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgQSB2YXJpYWJsZSB3aXRoIHRoZSBuYW1lICR7ZXhwcmVzc2lvbnNbMl19IGNvdWxkbid0IGJlIGZvdW5kIGluIHRoZSBkYXRhIG9mIHlvdXIgJHtub2RlLm5hbWV9KCkgY29tcG9uZW50YCk7XHJcbiAgICAgICAgZWxzZSBwYXJzZWREYXRhLnZhcmlhYmxlID0gbm9kZS5kYXRhW3ZhcmlhYmxlXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZERhdGE7XHJcbiAgICB9LFxyXG59OyIsImV4cG9ydCAqIGZyb20gXCIuL0hlbHBlclwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9DaGlsZHNIZWxwZXJcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vSW5saW5lUGFyc2VyXCI7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IENoZXZlcmVXaW5kb3csIFBhcnNlZEFyZ3MsIENoZXZlcmVOb2RlRGF0YSB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xuaW1wb3J0IHtDaGV2ZXJlTm9kZSwgQ2hldmVyZURhdGF9IGZyb20gXCJAY2hldmVyZVwiO1xuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XG5cbmNvbnN0IENoZXZlcmU6IENoZXZlcmVXaW5kb3cgPSB7XG4gICBub2RlczogW10sXG4gICAvKipcbiAgICAqIEZpbmQgYSBDaGV2ZXJlRGF0YSBieSB0aGUgdmFsdWUgb2YgdGhlICdkYXRhLWF0dGFjaGVkJyBhdHRyaWJ1dGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyXG4gICAgKiBAcGFyYW0ge0NoZXZlcmVEYXRhW119IGRhdGFcbiAgICAqIEByZXR1cm5zIFRoZSBkYXRhIHJlYWR5IGZvciBpbnN0YW5jZSBhIENoZXZlcmV4Tm9kZVxuICAgICovXG4gICBmaW5kSXRzRGF0YShhdHRyOiBzdHJpbmcsIGRhdGE6IENoZXZlcmVEYXRhW10pOiBDaGV2ZXJlRGF0YSB7XG4gICAgICAgbGV0IHNlYXJjaDogQ2hldmVyZURhdGEgfCB1bmRlZmluZWQgPSBkYXRhLmZpbmQoXG4gICAgICAgICAgIChkKSA9PiBkLm5hbWUgPT0gYXR0ci5yZXBsYWNlKC9cXCguKlxcKS8sIFwiXCIpLFxuICAgICAgICk7XG5cbiAgICAgICBpZiAoc2VhcmNoID09IHVuZGVmaW5lZClcbiAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgYCcke2F0dHJ9JyBjb3VsZG4ndCBiZSBmb3VuZCBpbiBhbnkgb2YgeW91ciBkZWNsYXJlZCBjb21wb25lbnRzYCxcbiAgICAgICAgICAgKTtcbiAgICAgICBlbHNlIHJldHVybiBzZWFyY2g7XG4gICB9LFxuICAgLyoqXG4gICAgKiBTZWFyY2ggZm9yIENoZXZlcmUgTm9kZXMgYXQgdGhlIHNpdGVcbiAgICAqIEBwYXJhbSBkYXRhIEFsbCB0aGUgQ2hldmVyZSBjb21wb25lbnRzXG4gICAgKi9cbiAgIHN0YXJ0KC4uLmRhdGE6IENoZXZlcmVEYXRhW10pOiB2b2lkIHtcbiAgICAgICBsZXQgWy4uLnByb3BzXSA9IGRhdGE7XG4gICAgICAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPVxuICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2W2RhdGEtYXR0YWNoZWRdXCIpO1xuXG4gICAgICAgLy9DcmVhdGUgYSBDaGV2ZXJlTm9kZSBmb3IgZWFjaCBkYXRhLWF0dGFjaGVkXG4gICAgICAgZWxlbWVudHMuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgbGV0IGRhdGFBdHRhY2hlZEF0dHI6IHN0cmluZyA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtYXR0YWNoZWRcIikhO1xuXG4gICAgICAgICAgIGNvbnN0IGdldERhdGE6IENoZXZlcmVEYXRhID0gdGhpcy5maW5kSXRzRGF0YShkYXRhQXR0YWNoZWRBdHRyLCBwcm9wcyk7XG5cbiAgICAgICAgICAgaWYoKGdldERhdGEuaW5pdCA9PSB1bmRlZmluZWQpICYmIChIZWxwZXIuaHRtbEFyZ3NEYXRhQXR0cihkYXRhQXR0YWNoZWRBdHRyKSAhPSB1bmRlZmluZWQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlcmUncyBubyBpbml0IG1ldGhvZCBkZWZpbmVkIGluIHlvdXIgJyR7Z2V0RGF0YS5uYW1lfScgY29tcG9uZW50YCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgIC8vSWYgdGhlIGluaXQgbWV0aG9kIGlzbid0IHVuZGVmaW5lZFxuICAgICAgICAgICBpZihnZXREYXRhLmluaXQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAvL0NoZWNrIGZvciBhcmd1bWVudHNcbiAgICAgICAgICAgICAgIGxldCBpbml0QXJnczogUGFyc2VkQXJncyA9IEhlbHBlci5tZXRob2RBcmd1bWVudHMoZ2V0RGF0YS5pbml0KTtcbiAgICAgICAgICAgICAgIGxldCBIVE1MQXJnczogUGFyc2VkQXJncyA9IEhlbHBlci5odG1sQXJnc0RhdGFBdHRyKGRhdGFBdHRhY2hlZEF0dHIpO1xuXG4gICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAqIENoZWNrIHRoZSBkaWZmIGJldHdlZW4gdGhlIGFydW1lbnRzIGF0IHRoZSBIVE1MIGFuZCB0aG9zZSBvbmVzIGRlY2xhcmVkIGF0IFxuICAgICAgICAgICAgICAgICogdGhlIGluaXQoKSBtZXRob2RcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgbGV0IGNoZWNrRm9ySW5pdEFyZ3VtZW50czogYm9vbGVhbiA9IEhlbHBlci5jb21wYXJlQXJndW1lbnRzKHtcbiAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGdldERhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiaW5pdCgpXCIsXG4gICAgICAgICAgICAgICAgICAgaHRtbEFyZ3M6IEhUTUxBcmdzLFxuICAgICAgICAgICAgICAgICAgIG1ldGhvZEFyZ3M6IGluaXRBcmdzXG4gICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgLy9JZiB0aGVyZSdzIG5vIGVycm9ycywgcGFyc2UgdGhlIGFyZ3VtZW50cywgYW5kIGV4ZWN1dGUgdGhlIGluaXQoKSBtZXRob2RcbiAgICAgICAgICAgICAgIGlmKGNoZWNrRm9ySW5pdEFyZ3VtZW50cykgZ2V0RGF0YS5wYXJzZUFyZ3VtZW50cyhIVE1MQXJncyEsIGluaXRBcmdzISk7XG4gICAgICAgICAgICAgICBlbHNlIGdldERhdGEucGFyc2VJbml0KHtcbiAgICAgICAgICAgICAgICAgICBpbml0OiBnZXREYXRhLmluaXRcbiAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9O1xuICAgICAgIFxuICAgICAgICAgICBsZXQgbm9kZSA9IG5ldyBDaGV2ZXJlTm9kZShnZXREYXRhLCBlbCk7XG5cbiAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgIH0pO1xuICAgfSxcbiAgIGRhdGEoZGF0YTogQ2hldmVyZU5vZGVEYXRhKTogQ2hldmVyZURhdGEge1xuICAgICAgIHJldHVybiBuZXcgQ2hldmVyZURhdGEoZGF0YSk7XG4gICB9LFxufTtcblxud2luZG93LkNoZXZlcmUgPSBDaGV2ZXJlOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==