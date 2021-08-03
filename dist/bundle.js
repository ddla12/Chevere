/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ts/Actions/EventNode.ts":
/*!*************************************!*\
  !*** ./src/ts/Actions/EventNode.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Helper_1 = __webpack_require__(/*! ../utils/Helper */ "./src/ts/utils/Helper.ts");
class EventNode {
    constructor(data) {
        //Give it an ID for the element
        this.element = data.element;
        this.element.setAttribute("data-id", Helper_1.Helper.setDataId(10));
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
        if ((!this.parent.args[methodName]) || (Helper_1.Helper.isEmpty(this.parent.args[methodName])))
            return;
        //The args
        let htmlArgs = Helper_1.Helper.htmlArgsDataAttr(this.attrVal), parentArgs = this.parent.args[methodName];
        //Check for errors in the argments
        Helper_1.Helper.compareArguments({
            method: methodName,
            component: this.parent.name,
            htmlArgs: htmlArgs,
            methodArgs: parentArgs,
        });
        let final = Helper_1.Helper.getRealValuesInArguments({
            args: htmlArgs,
            name: this.parent.name,
            method: methodName
        });
        //Create the argument object
        let argsObj = {};
        for (let i in parentArgs)
            argsObj[parentArgs[i]] = final[i];
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
exports.default = EventNode;


/***/ }),

/***/ "./src/ts/Actions/Index.ts":
/*!*********************************!*\
  !*** ./src/ts/Actions/Index.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputAction = void 0;
const Helper_1 = __webpack_require__(/*! ../utils/Helper */ "./src/ts/utils/Helper.ts");
/**
 * The class for those inputs elements that have the `data-model` attribute
 *  @class
 */
class InputAction {
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
        Helper_1.Helper.checkForErrorInVariable(attr);
        let variable = Object.keys(this.parent.data).find((data) => data == attr);
        if (!variable)
            throw new ReferenceError(`There's no a '${attr}' variable in the data-attached scope`);
        return variable;
    }
}
exports.InputAction = InputAction;


/***/ }),

/***/ "./src/ts/Actions/LoopNode.ts":
/*!************************************!*\
  !*** ./src/ts/Actions/LoopNode.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const TextNode_1 = __importDefault(__webpack_require__(/*! ./TextNode */ "./src/ts/Actions/TextNode.ts"));
const InlineParser_1 = __importDefault(__webpack_require__(/*! ../utils/InlineParser */ "./src/ts/utils/InlineParser.ts"));
class LoopNode {
    constructor(data) {
        this.element = data.element;
        this.parent = data.parent;
        let parsed = InlineParser_1.default.parseDataForAttr(this.element.getAttribute("data-for"), this.parent);
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
                let attrVal = (Number(i) == 0)
                    ? element.getAttribute("data-text")?.replace("[]", `[${i}]`)
                    : element.getAttribute("data-text")?.replace(/\[[0-9]+\]/, `[${i}]`);
                element.setAttribute("data-text", attrVal);
                this.parent.childs["data-text"].push(new TextNode_1.default({
                    element: element,
                    parent: this.parent
                }));
            });
            parentText
                .forEach(element => {
                this.parent.childs["data-text"].push(new TextNode_1.default({
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
exports.default = LoopNode;


/***/ }),

/***/ "./src/ts/Actions/TextNode.ts":
/*!************************************!*\
  !*** ./src/ts/Actions/TextNode.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const InlineParser_1 = __importDefault(__webpack_require__(/*! ../utils/InlineParser */ "./src/ts/utils/InlineParser.ts"));
const Helper_1 = __webpack_require__(/*! ../utils/Helper */ "./src/ts/utils/Helper.ts");
class TextNode {
    constructor(data) {
        this.element = data.element;
        this.element.setAttribute("data-id", Helper_1.Helper.setDataId(10));
        this.parent = data.parent;
        this.variable = this.element.getAttribute("data-text");
    }
    set value(value) {
        this._value = value.toString();
        this.element.textContent = this._value;
    }
    set variable(attr) {
        Helper_1.Helper.checkForErrorInVariable(attr);
        let data = InlineParser_1.default.parseDataTextAttr(attr, this.parent);
        this._variable = data.variable;
        this.value = data.value;
    }
}
exports.default = TextNode;


/***/ }),

/***/ "./src/ts/chevere/ChevereData.ts":
/*!***************************************!*\
  !*** ./src/ts/chevere/ChevereData.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Helper_1 = __webpack_require__(/*! ../utils/Helper */ "./src/ts/utils/Helper.ts");
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
        let final = Helper_1.Helper.getRealValuesInArguments({
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
        let initFunc = Helper_1.Helper.contentOfFunction(init.init);
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
exports.default = ChevereData;


/***/ }),

/***/ "./src/ts/chevere/ChevereNode.ts":
/*!***************************************!*\
  !*** ./src/ts/chevere/ChevereNode.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Index_1 = __webpack_require__(/*! ../Actions/Index */ "./src/ts/Actions/Index.ts");
const TextNode_1 = __importDefault(__webpack_require__(/*! ../Actions/TextNode */ "./src/ts/Actions/TextNode.ts"));
const EventNode_1 = __importDefault(__webpack_require__(/*! ../Actions/EventNode */ "./src/ts/Actions/EventNode.ts"));
const Helper_1 = __webpack_require__(/*! ../utils/Helper */ "./src/ts/utils/Helper.ts");
const ChildsHelper_1 = __importDefault(__webpack_require__(/*! ../utils/ChildsHelper */ "./src/ts/utils/ChildsHelper.ts"));
const LoopNode_1 = __importDefault(__webpack_require__(/*! ../Actions/LoopNode */ "./src/ts/Actions/LoopNode.ts"));
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
        this.id = Helper_1.Helper.setDataId(10);
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
                let args = Helper_1.Helper.methodArguments(methods[method]);
                if (args)
                    this.args[method] = args;
                let parsed = methods[method]
                    .toString()
                    .replace(/^.*|[\}]$/g, "");
                Object.keys(this.data).forEach((variable) => {
                    parsed = parsed.replaceAll(`$this.data.${variable}`, `$this.data.${variable}.value`);
                });
                if (this.args[method] != undefined) {
                    this.args[method].forEach((arg) => {
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
        const eventNodes = ChildsHelper_1.default.getElementsByDataOnAttr(this.element), textNodes = ChildsHelper_1.default.getElementsByDataTextAttr(this.element), modelNodes = ChildsHelper_1.default.getElementsByDataModelAttr(this.element), loopNodes = ChildsHelper_1.default.getElementsByDataFor(this.element);
        //EventNodes
        if (eventNodes) {
            eventNodes.forEach((node) => {
                this.childs["event"].push(new EventNode_1.default({
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
                this.childs["data-text"].push(new TextNode_1.default({
                    element: text,
                    parent: this,
                }));
            });
        }
        ;
        //Text Inputs with model
        if (modelNodes) {
            modelNodes.forEach((input) => {
                this.childs["data-model"].push(new Index_1.InputAction({
                    element: input,
                    parent: this,
                }));
            });
        }
        ;
        //For nodes
        if (loopNodes) {
            loopNodes.forEach((loop) => {
                this.childs["data-for"].push(new LoopNode_1.default({
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
exports.default = ChevereNode;


/***/ }),

/***/ "./src/ts/index.ts":
/*!*************************!*\
  !*** ./src/ts/index.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const ChevereNode_1 = __importDefault(__webpack_require__(/*! ./chevere/ChevereNode */ "./src/ts/chevere/ChevereNode.ts"));
const ChevereData_1 = __importDefault(__webpack_require__(/*! ./chevere/ChevereData */ "./src/ts/chevere/ChevereData.ts"));
const Helper_1 = __webpack_require__(/*! ./utils/Helper */ "./src/ts/utils/Helper.ts");
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
            if ((getData.init == undefined) && (Helper_1.Helper.htmlArgsDataAttr(dataAttachedAttr) != undefined))
                throw new Error(`There's no init method defined in your '${getData.name}' component`);
            //If the init method isn't undefined
            if (getData.init != undefined) {
                //Check for arguments
                let initArgs = Helper_1.Helper.methodArguments(getData.init);
                let HTMLArgs = Helper_1.Helper.htmlArgsDataAttr(dataAttachedAttr);
                /**
                 * Check the diff between the aruments at the HTML and those ones declared at
                 * the init() method
                 */
                let checkForInitArguments = Helper_1.Helper.compareArguments({
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
            let node = new ChevereNode_1.default(getData, el);
            this.nodes.push(node);
        });
    },
    data(data) {
        return new ChevereData_1.default(data);
    },
};
window.Chevere = Chevere;


/***/ }),

/***/ "./src/ts/utils/ChildsHelper.ts":
/*!**************************************!*\
  !*** ./src/ts/utils/ChildsHelper.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const ChildsHelper = {
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
exports.default = ChildsHelper;


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
const Parser = {
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
exports.default = Parser;


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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/ts/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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USxFQUFFLEVBQUUsQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckYsSUFBRyxDQUFDLFFBQVE7WUFDUixNQUFNLElBQUksY0FBYyxDQUFDLDRCQUE0QixXQUFXLENBQUMsQ0FBQyxDQUFDLDBDQUEwQyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsQ0FBQzs7WUFDckksVUFBVSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRS9DLE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7Q0FDSixDQUFDO0FBRUYsa0JBQWUsTUFBTSxDQUFDOzs7Ozs7O1VDdkV0QjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9BY3Rpb25zL0V2ZW50Tm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL0FjdGlvbnMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9BY3Rpb25zL0xvb3BOb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvQWN0aW9ucy9UZXh0Tm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvQ2hldmVyZURhdGEudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9jaGV2ZXJlL0NoZXZlcmVOb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9DaGlsZHNIZWxwZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9IZWxwZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9JbmxpbmVQYXJzZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRDaGlsZCwgUGFyc2VkQXJncywgQXJndW1lbnRzT2JqZWN0IH0gZnJvbSBcIi4uL2ludGVyZmFjZXNcIjtcclxuaW1wb3J0IENoZXZlcmVOb2RlIGZyb20gXCIuLi9jaGV2ZXJlL0NoZXZlcmVOb2RlXCI7XHJcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCIuLi91dGlscy9IZWxwZXJcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50Tm9kZSBpbXBsZW1lbnRzIEV2ZW50Q2hpbGQge1xyXG4gICAgZWxlbWVudDogRWxlbWVudDtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcbiAgICBtZXRob2Q/OiBGdW5jdGlvbjtcclxuICAgIGV2ZW50OiBzdHJpbmc7XHJcbiAgICBhdHRyVmFsOiBzdHJpbmc7XHJcbiAgICBhcmdzPzoge307XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogRXZlbnRDaGlsZCkge1xyXG4gICAgICAgIC8vR2l2ZSBpdCBhbiBJRCBmb3IgdGhlIGVsZW1lbnRcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkYXRhLmVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldERhdGFJZCgxMCkpO1xyXG5cclxuICAgICAgICAvL0dldCB0aGUgdHlwZSBvZiBldmVudFxyXG4gICAgICAgIHRoaXMuZXZlbnQgPSBkYXRhLmV2ZW50O1xyXG5cclxuICAgICAgICAvL1RoZSB2YWx1ZSBvZiB0aGUgYXR0cmlidXJlXHJcbiAgICAgICAgdGhpcy5hdHRyVmFsID0gZGF0YS5hdHRyVmFsO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBkYXRhLnBhcmVudDtcclxuXHJcbiAgICAgICAgLy9TZWFyY2ggbWV0aG9kIGFuZCBjaGVjayBpZiBpdCBoYXMgYXJndW1lbnRzXHJcbiAgICAgICAgdGhpcy5tZXRob2QgPSB0aGlzLnNlYXJjaE1ldGhvZCgpO1xyXG4gICAgICAgIHRoaXMuYXJncyA9IHRoaXMuZmluZEFyZ3VtZW50cygpO1xyXG5cclxuICAgICAgICAvL0lmIGV2ZXJ5dGhpbmcgaXMgb2ssIHRoZW4gc2V0IHRoZSBFdmVudFxyXG4gICAgICAgIHRoaXMucGFyZW50Py5zZXRFdmVudCh7XHJcbiAgICAgICAgICAgIGVsZW06IHRoaXMuZWxlbWVudCxcclxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLm1ldGhvZCEsXHJcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuZXZlbnQsXHJcbiAgICAgICAgICAgIGFyZ3M6IHRoaXMuYXJnc1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZpbmRBcmd1bWVudHMoKTogQXJndW1lbnRzT2JqZWN0fHVuZGVmaW5lZCB7XHJcbiAgICAgICAgbGV0IG1ldGhvZE5hbWU6IHN0cmluZyA9IHRoaXMuYXR0clZhbC5yZXBsYWNlKC9cXCguKy8sIFwiXCIpO1xyXG5cclxuICAgICAgICBpZigoIXRoaXMucGFyZW50LmFyZ3NbbWV0aG9kTmFtZV0pIHx8IChIZWxwZXIuaXNFbXB0eSh0aGlzLnBhcmVudC5hcmdzW21ldGhvZE5hbWVdISkpKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vVGhlIGFyZ3NcclxuICAgICAgICBsZXQgaHRtbEFyZ3M6IFBhcnNlZEFyZ3MgPSBIZWxwZXIuaHRtbEFyZ3NEYXRhQXR0cih0aGlzLmF0dHJWYWwpLFxyXG4gICAgICAgICAgICBwYXJlbnRBcmdzOiBQYXJzZWRBcmdzID0gdGhpcy5wYXJlbnQuYXJnc1ttZXRob2ROYW1lXTtcclxuXHJcbiAgICAgICAgLy9DaGVjayBmb3IgZXJyb3JzIGluIHRoZSBhcmdtZW50c1xyXG4gICAgICAgIEhlbHBlci5jb21wYXJlQXJndW1lbnRzKHtcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2ROYW1lLFxyXG4gICAgICAgICAgICBjb21wb25lbnQ6IHRoaXMucGFyZW50Lm5hbWUsXHJcbiAgICAgICAgICAgIGh0bWxBcmdzOiBodG1sQXJncyxcclxuICAgICAgICAgICAgbWV0aG9kQXJnczogcGFyZW50QXJncyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IGZpbmFsID0gSGVscGVyLmdldFJlYWxWYWx1ZXNJbkFyZ3VtZW50cyh7XHJcbiAgICAgICAgICAgIGFyZ3M6IGh0bWxBcmdzIGFzIHN0cmluZ1tdLFxyXG4gICAgICAgICAgICBuYW1lOiB0aGlzLnBhcmVudC5uYW1lLFxyXG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZE5hbWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgdGhlIGFyZ3VtZW50IG9iamVjdFxyXG4gICAgICAgIGxldCBhcmdzT2JqOiBBcmd1bWVudHNPYmplY3QgPSB7fTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpIGluIHBhcmVudEFyZ3MpIGFyZ3NPYmpbcGFyZW50QXJnc1tpXV0gPSBmaW5hbFtpXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGFyZ3NPYmo7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNlYXJjaE1ldGhvZCgpOiBGdW5jdGlvbiB7XHJcbiAgICAgICAgbGV0IHZhbDogc3RyaW5nID0gdGhpcy5hdHRyVmFsLnJlcGxhY2UoL1xcKC4rLywgXCJcIik7XHJcblxyXG4gICAgICAgIGxldCBtZXRob2Q6IEZ1bmN0aW9uID0gdGhpcy5wYXJlbnQubWV0aG9kcyFbdmFsXTtcclxuXHJcbiAgICAgICAgaWYgKCFtZXRob2QpIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlcmUncyBubyBtZXRob2QgJHt2YWx9IGluIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCk7XHJcblxyXG4gICAgICAgIHJldHVybiBtZXRob2Q7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgQ2hldmVyZU5vZGUgZnJvbSBcIi4uL2NoZXZlcmUvQ2hldmVyZU5vZGVcIjtcbmltcG9ydCB7IElucHV0TW9kZWwgfSBmcm9tIFwiLi4vaW50ZXJmYWNlc1wiO1xuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIi4uL3V0aWxzL0hlbHBlclwiO1xuXG4vKipcbiAqIFRoZSBjbGFzcyBmb3IgdGhvc2UgaW5wdXRzIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgYGRhdGEtbW9kZWxgIGF0dHJpYnV0ZVxuICogIEBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgSW5wdXRBY3Rpb24gaW1wbGVtZW50cyBJbnB1dE1vZGVsIHtcbiAgICBlbGVtZW50OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgSFRNTElucHV0RWxlbWVudDtcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xuICAgIHZhcmlhYmxlOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihpbnB1dDogSW5wdXRNb2RlbCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IGlucHV0LnBhcmVudDtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gaW5wdXQuZWxlbWVudCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXG4gICAgICAgIC8vU2VhcmNoIGlmIHRoZSBpbmRpY2F0ZWQgdmFyaWFibGUgb2YgdGhlIGRhdGEtbW9kZWwgYXR0cmlidXRlIGV4aXN0cyBpbiB0aGUgc2NvcGVcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZ2V0VmFyaWFibGUoKTtcblxuICAgICAgICAvL1NldCB0aGUgZGVmYXVsdCB2YWx1ZVxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdLnZhbHVlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgLy9BZGQgdGhlIGxpc3RlbmVyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zeW5jVGV4dCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3NpZ25UZXh0KHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzeW5jVGV4dCgpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZSA9IHRoaXMuZWxlbWVudC52YWx1ZS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGdldFZhcmlhYmxlKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBhdHRyID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtbW9kZWxcIikhO1xuXG4gICAgICAgIEhlbHBlci5jaGVja0ZvckVycm9ySW5WYXJpYWJsZShhdHRyKTtcblxuICAgICAgICBsZXQgdmFyaWFibGUgPSBPYmplY3Qua2V5cyh0aGlzLnBhcmVudC5kYXRhKS5maW5kKFxuICAgICAgICAgICAgKGRhdGEpID0+IGRhdGEgPT0gYXR0cixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIXZhcmlhYmxlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgIGBUaGVyZSdzIG5vIGEgJyR7YXR0cn0nIHZhcmlhYmxlIGluIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHZhcmlhYmxlO1xuICAgIH1cbn0iLCJpbXBvcnQgQ2hldmVyZU5vZGUgZnJvbSBcIi4uL2NoZXZlcmUvQ2hldmVyZU5vZGVcIjtcclxuaW1wb3J0IHsgTG9vcEVsZW1lbnQsIFBhcnNlZERhdGEsIFBhcnNlZEZvciB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcbmltcG9ydCBUZXh0Tm9kZSBmcm9tIFwiLi9UZXh0Tm9kZVwiO1xyXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi91dGlscy9JbmxpbmVQYXJzZXJcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvb3BOb2RlIGltcGxlbWVudHMgTG9vcEVsZW1lbnQge1xyXG4gICAgZWxlbWVudDogSFRNTFRlbXBsYXRlRWxlbWVudDtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcbiAgICB2YXJpYWJsZTogUGFyc2VkRGF0YTtcclxuICAgIGV4cHJlc3Npb25zPzogc3RyaW5nW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogTG9vcEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkYXRhLmVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBkYXRhLnBhcmVudDtcclxuXHJcbiAgICAgICAgbGV0IHBhcnNlZDogUGFyc2VkRm9yID0gUGFyc2VyLnBhcnNlRGF0YUZvckF0dHIodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtZm9yXCIpISwgdGhpcy5wYXJlbnQpO1xyXG5cclxuICAgICAgICB0aGlzLnZhcmlhYmxlICAgICAgID0gcGFyc2VkLnZhcmlhYmxlITtcclxuICAgICAgICB0aGlzLmV4cHJlc3Npb25zICAgID0gcGFyc2VkLmV4cHJlc3Npb25zITtcclxuXHJcbiAgICAgICAgaWYodHlwZW9mIHRoaXMudmFyaWFibGUudmFsdWUgPT0gXCJzdHJpbmdcIikgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFdmFsRXJyb3IoYENhbm5vdCBzZXQgYSAnZm9yLi5pbicgbG9vcCBpbiB0eXBlICR7dHlwZW9mIHRoaXMudmFyaWFibGUudmFsdWV9YCk7ICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5sb29wRWxlbWVudHMoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxvb3BFbGVtZW50cygpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSBBcnJheS5mcm9tKHRoaXMucGFyZW50LmVsZW1lbnQuY2hpbGRyZW4pLmluZGV4T2YodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGU6IERvY3VtZW50RnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQuY29udGVudC5xdWVyeVNlbGVjdG9yKFwiZGl2OmZpcnN0LWNoaWxkXCIpO1xyXG5cclxuICAgICAgICBpZighZWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGZpcnN0IGNoaWxkIG9mIHlvdXIgZGF0YS1mb3IgZWxlbWVudCBtdXN0IGJlIGEgZGl2IGVsZW1lbnRcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IHRoaXNDaGlsZHMgPSBbLi4uZWxlbWVudCEucXVlcnlTZWxlY3RvckFsbChgKmApXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgY29uc3QgTG9vcFRleHQgPSB0aGlzQ2hpbGRzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGNoaWxkKSA9PiBjaGlsZC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIik/LnN0YXJ0c1dpdGgodGhpcy5leHByZXNzaW9ucyFbMF0pKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50VGV4dCA9IHRoaXNDaGlsZHNcclxuICAgICAgICAgICAgLmZpbHRlcigoY2hpbGQpID0+ICFjaGlsZC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIik/LnN0YXJ0c1dpdGgodGhpcy5leHByZXNzaW9ucyFbMF0pKTtcclxuXHJcbiAgICAgICAgTG9vcFRleHQuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiLCBcclxuICAgICAgICAgICAgYCR7dGhpcy52YXJpYWJsZS5ub21icmV9W11gICsgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpPy5yZXBsYWNlKHRoaXMuZXhwcmVzc2lvbnMhWzBdLCBcIlwiKSEpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVsLmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSBpbiB0aGlzLnZhcmlhYmxlLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIExvb3BUZXh0XHJcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYXR0clZhbDogc3RyaW5nID0gKE51bWJlcihpKSA9PSAwKSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBlbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8ucmVwbGFjZShcIltdXCIgLCBgWyR7aX1dYCkhIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpPy5yZXBsYWNlKC9cXFtbMC05XStcXF0vLCBgWyR7aX1dYCkhXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIiwgYXR0clZhbClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5jaGlsZHMhW1wiZGF0YS10ZXh0XCJdLnB1c2gobmV3IFRleHROb2RlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLnBhcmVudFxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcGFyZW50VGV4dFxyXG4gICAgICAgICAgICAgICAgLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuY2hpbGRzIVtcImRhdGEtdGV4dFwiXS5wdXNoKG5ldyBUZXh0Tm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRlbXBsYXRlLmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUoZWxlbWVudCwgdHJ1ZSkpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZWxlbWVudC5pbnNlcnRCZWZvcmUodGVtcGxhdGUsIHRoaXMucGFyZW50LmVsZW1lbnQuY2hpbGRyZW5bcG9zXSk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgUGFyc2VyIGZyb20gXCIuLi91dGlscy9JbmxpbmVQYXJzZXJcIjtcclxuaW1wb3J0IHsgVGV4dFJlbGF0aW9uLCBmaW5kUHJvcCB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcbmltcG9ydCBDaGV2ZXJlTm9kZSBmcm9tIFwiLi4vY2hldmVyZS9DaGV2ZXJlTm9kZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiLi4vdXRpbHMvSGVscGVyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0Tm9kZSBpbXBsZW1lbnRzIFRleHRSZWxhdGlvbiB7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIF92YXJpYWJsZT86IGFueTtcclxuICAgIF92YWx1ZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IFRleHRSZWxhdGlvbikge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGRhdGEuZWxlbWVudDtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBIZWxwZXIuc2V0RGF0YUlkKDEwKSk7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gZGF0YS5wYXJlbnQ7XHJcblxyXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpITtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLl92YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFyaWFibGUoYXR0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgSGVscGVyLmNoZWNrRm9yRXJyb3JJblZhcmlhYmxlKGF0dHIpO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IFBhcnNlci5wYXJzZURhdGFUZXh0QXR0cihhdHRyLCB0aGlzLnBhcmVudCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3ZhcmlhYmxlID0gZGF0YS52YXJpYWJsZTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gZGF0YS52YWx1ZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IENoZXZlcmVOb2RlRGF0YSwgRGF0YVR5cGUsIE1ldGhvZFR5cGUsIEFyZ3VtZW50c09iamVjdCwgSW5pdCB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCIuLi91dGlscy9IZWxwZXJcIjtcclxuXHJcbi8qKlxyXG4gKiAgVGhlIGNsYXNzIHRoYXQgdXNlcnMgY3JlYXRlIHRoZWlyIGNvbXBvbmVudHNcclxuICogIEBjbGFzc1xyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hldmVyZURhdGEgaW1wbGVtZW50cyBDaGV2ZXJlTm9kZURhdGEge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZGF0YTogRGF0YVR5cGU7XHJcbiAgICBpbml0PzogRnVuY3Rpb247XHJcbiAgICBtZXRob2RzPzogTWV0aG9kVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlTm9kZURhdGEpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YS5kYXRhO1xyXG4gICAgICAgIHRoaXMuaW5pdCA9IGRhdGEuaW5pdDtcclxuICAgICAgICB0aGlzLm1ldGhvZHMgPSBkYXRhLm1ldGhvZHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgYXJndW1lbnRzIG9mIHRoIGluaXQoKSBtZXRob2RcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGh0bWxBcmdzIFRoZSBhcmd1bWVudHMgb2YgZGUgZGF0YS1hdHRhY2hlZCBhdHRyaWJ1dGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGluaXRBcmdzIFRoZSBhcmd1bWVudHMgZGVmaW5lZCBpbiB0aGUgaW5pdCgpIG1ldGhvZFxyXG4gICAgICovXHJcbiAgICBwYXJzZUFyZ3VtZW50cyhodG1sQXJnczogc3RyaW5nW10sIG1ldGhvZEFyZ3M6IHN0cmluZ1tdKTogdm9pZCB7XHJcblxyXG4gICAgICAgIC8vR2V0IGEgdmFsaWQgdmFsdWUgZm9yIHRoZSBhcmd1bWVudCwgZm9yIGV4YW1wbGUsIGNoZWNrIGZvciBzdHJpbmdzIHdpdGggdW5jbG9zZWQgcXVvdGVzXHJcbiAgICAgICAgbGV0IGZpbmFsID0gSGVscGVyLmdldFJlYWxWYWx1ZXNJbkFyZ3VtZW50cyh7XHJcbiAgICAgICAgICAgIGFyZ3M6IGh0bWxBcmdzLFxyXG4gICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJpbml0KClcIlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL0NyZWF0ZSB0aGUgYXJndW1lbnQgb2JqZWN0XHJcbiAgICAgICAgbGV0IGFyZ3NPYmo6IEFyZ3VtZW50c09iamVjdCA9IHt9O1xyXG5cclxuICAgICAgICBmb3IobGV0IGkgaW4gbWV0aG9kQXJncykgYXJnc09ialttZXRob2RBcmdzW2ldXSA9IGZpbmFsW2ldO1xyXG5cclxuICAgICAgICAvLy4uLmFuZCBwYXNzIGl0IHRvIHRoZSB1bnBhcnNlZCBpbml0IGZ1bmN0aW9uXHJcbiAgICAgICAgdGhpcy5wYXJzZUluaXQoe1xyXG4gICAgICAgICAgICBpbml0OiB0aGlzLmluaXQhLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmdzT2JqLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgdGhlIGluaXQgZnVuY3Rpb24gYW5kIGV4ZWN1dGVzIGl0XHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpbml0IFRoZSB1bnBhcnNlZCBpbml0IGZ1bmN0aW9uXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXJncyBUaGUgcGFyc2VkIGN1c3RvbSBhcmd1bWVudHNcclxuICAgICAqIEByZXR1cm5zIHRoZSBpbml0IGZ1bmN0aW9uXHJcbiAgICAgKi9cclxuICAgIHBhcnNlSW5pdChpbml0OiBJbml0KTogRnVuY3Rpb24ge1xyXG5cclxuICAgICAgICBsZXQgaW5pdEZ1bmM6IHN0cmluZyA9IEhlbHBlci5jb250ZW50T2ZGdW5jdGlvbihpbml0LmluaXQpO1xyXG5cclxuICAgICAgICAvL0ZpbmRzIHRoZSByZWFsIGFyZ3VtZW50cyBhbmQgbm8gZXhwcmVzc2lvbnMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAgICAgaWYgKGluaXQuYXJncykge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhpbml0LmFyZ3MpLmZvckVhY2goKGFyZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN0cjogc3RyaW5nID0gYCg/PD0oPVxcXFxzKXwoXFxcXCgpfCg9KSkoJHthcmd9KWA7XHJcbiAgICAgICAgICAgICAgICBpbml0RnVuYyA9IGluaXRGdW5jLnJlcGxhY2UobmV3IFJlZ0V4cChzdHIsIFwiZ1wiKSwgYCRhcmdzLiR7YXJnfWApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vQ3JlYXRlIHRoZSBuZXcgcGFyc2VkIGluaXQgZnVuY3Rpb25cclxuICAgICAgICBsZXQgbmV3RnVuYzogRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oXHJcbiAgICAgICAgICAgIFwieyR0aGlzID0gdW5kZWZpbmVkLCAkYXJncyA9IHVuZGVmaW5lZH1cIixcclxuICAgICAgICAgICAgaW5pdEZ1bmMsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9SZXR1cm4gdGhlIG5ldyBpbml0IGZ1bmN0aW9uIGFuZCBleGVjdXRlcyBpdFxyXG4gICAgICAgIHJldHVybiBuZXdGdW5jKHtcclxuICAgICAgICAgICAgJHRoaXM6IHRoaXMsXHJcbiAgICAgICAgICAgICRhcmdzOiBpbml0LmFyZ3MsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBDaGV2ZXJlRWxlbWVudCwgTWV0aG9kVHlwZSwgRGF0YVR5cGUsIENoaWxkLCBDaGV2ZXJlRXZlbnQsIFBhcnNlZERhdGEsIFNlbGVjdG9ycywgRXZlbnRFbGVtZW50cywgUGFyc2VkQXJncyB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IElucHV0QWN0aW9uIH0gZnJvbSBcIi4uL0FjdGlvbnMvSW5kZXhcIjtcclxuaW1wb3J0IFRleHROb2RlIGZyb20gXCIuLi9BY3Rpb25zL1RleHROb2RlXCI7XHJcbmltcG9ydCBDaGV2ZXJlRGF0YSBmcm9tIFwiLi9DaGV2ZXJlRGF0YVwiO1xyXG5pbXBvcnQgRXZlbnROb2RlIGZyb20gXCIuLi9BY3Rpb25zL0V2ZW50Tm9kZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiLi4vdXRpbHMvSGVscGVyXCI7XHJcbmltcG9ydCBDaGlsZHNIZWxwZXIgZnJvbSBcIi4uL3V0aWxzL0NoaWxkc0hlbHBlclwiO1xyXG5pbXBvcnQgTG9vcE5vZGUgZnJvbSBcIi4uL0FjdGlvbnMvTG9vcE5vZGVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoZXZlcmVOb2RlIGltcGxlbWVudHMgQ2hldmVyZUVsZW1lbnQge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZGF0YTogRGF0YVR5cGU7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgbWV0aG9kcz86IE1ldGhvZFR5cGU7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgYXJnczogeyBbbWV0aG9kOiBzdHJpbmddOiBQYXJzZWRBcmdzIH0gPSB7fTtcclxuICAgIGNoaWxkcz86IENoaWxkID0ge1xyXG4gICAgICAgIFwiZXZlbnRcIjogW10sXHJcbiAgICAgICAgXCJkYXRhLXRleHRcIjogW10sXHJcbiAgICAgICAgXCJkYXRhLW1vZGVsXCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1mb3JcIjogW11cclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZURhdGEsIGVsOiBFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucGFyc2VEYXRhKGRhdGEuZGF0YSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBQYXJzZSBhbGwgJHRoaXMsICRzZWxmLCAkZGF0YS4uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMubWV0aG9kcyA9IHRoaXMucGFyc2VNZXRob2RzKGRhdGEubWV0aG9kcyk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCB0aGUgcGFyZW50IGBkaXZgIGFuZCBnaXZlIGl0IGEgdmFsdWUgZm9yIHRoZSBkYXRhLWlkIGF0dHJpYnV0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBIZWxwZXIuc2V0RGF0YUlkKDEwKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCB0aGlzLmlkKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIEdldCB0aGUgZXZlbnRzIGFuZCBhY3Rpb25zIG9mIHRoZSBjb21wb25lbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNoZWNrRm9yQWN0aW9uc0FuZENoaWxkcygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgYWxsIHRoZSBkYXRhLCB0aGV5IG5lZWQgZ2V0dGVyIGFuZCBhIHNldHRlclxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIHByaW1pdGl2ZSBkYXRhXHJcbiAgICAgKi9cclxuICAgIHBhcnNlRGF0YShkYXRhOiBEYXRhVHlwZSkge1xyXG4gICAgICAgIGxldCBvYmo6IFtzdHJpbmcsIFBhcnNlZERhdGFdW10gPSBbXTtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICBvYmoucHVzaChbZCwgdGhpcy5wYXJzZWRPYmooZCwgZGF0YVtkXSldKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhvYmopO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VkIHRoZSBtZXRob2RzIGRlc2NyaWJlZCBpbiB0aGUgbWV0aG9kIHByb3BlcnR5IG9mIHRoZSBkYXRhXHJcbiAgICAgKiBAcGFyYW0ge01ldGhvZFR5cGV9IG1ldGhvZHNcclxuICAgICAqIEByZXR1cm5zIFRoZSBtZXRob2RzIHBhcnNlZFxyXG4gICAgICovXHJcbiAgICBwYXJzZU1ldGhvZHMobWV0aG9kcz86IE1ldGhvZFR5cGUpOiBNZXRob2RUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAobWV0aG9kcyA9PSB1bmRlZmluZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaCgobWV0aG9kKSA9PiB7XHJcbiAgICAgICAgICAgIC8vSWYgdGhlIG1ldGhvZCB3YXMgYWxyZWFkeSBwYXJzZWRcclxuICAgICAgICAgICAgbGV0IHdhc1BhcnNlZDogbnVtYmVyID0gbWV0aG9kc1ttZXRob2RdXHJcbiAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgLnNlYXJjaChcImFub255bW91c1wiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXNQYXJzZWQgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhcmdzOiBQYXJzZWRBcmdzID0gSGVscGVyLm1ldGhvZEFyZ3VtZW50cyhtZXRob2RzW21ldGhvZF0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmKGFyZ3MpIHRoaXMuYXJnc1ttZXRob2RdID0gYXJncztcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyc2VkOiBzdHJpbmcgPSBtZXRob2RzW21ldGhvZF1cclxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLip8W1xcfV0kL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZWQgPSBwYXJzZWQucmVwbGFjZUFsbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCR0aGlzLmRhdGEuJHt2YXJpYWJsZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfS52YWx1ZWAsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuYXJnc1ttZXRob2RdICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXJnc1ttZXRob2RdLmZvckVhY2goKGFyZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RyOiBzdHJpbmcgPSBgKD88PSg9XFxcXHMpfChcXFxcKCl8KD0pKSgke2FyZ30pYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkID0gcGFyc2VkLnJlcGxhY2UobmV3IFJlZ0V4cChzdHIsIFwiZ1wiKSwgYCRhcmdzLiR7YXJnfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIFwieyR0aGlzID0gdW5kZWZpbmVkLCAkZXZlbnQgPSB1bmRlZmluZWQsICRhcmdzID0gdW5kZWZpbmVkfVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlZCxcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWV0aG9kc1ttZXRob2RdID0gbmV3RnVuYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gbWV0aG9kcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgYWxsIHRoZSBjaGlsZHJlbnMgdGhhdCBoYXZlIGFuIGFjdGlvbiBhbmQgZGF0YVxyXG4gICAgICovXHJcbiAgICBjaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsIHRoZSBlbGVtZW50cyBzdXBwb3J0ZWQgd2l0aCBDaGV2ZXJleFxyXG4gICAgICAgICAqIEBjb25zdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0XHJcbiAgICAgICAgICAgIGV2ZW50Tm9kZXM6IEV2ZW50RWxlbWVudHMgICAgICAgICAgID0gQ2hpbGRzSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhT25BdHRyKHRoaXMuZWxlbWVudCksIFxyXG4gICAgICAgICAgICB0ZXh0Tm9kZXMgICA6IE5vZGVMaXN0T2Y8RWxlbWVudD4gICA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YVRleHRBdHRyKHRoaXMuZWxlbWVudCksXHJcbiAgICAgICAgICAgIG1vZGVsTm9kZXMgIDogTm9kZUxpc3RPZjxFbGVtZW50PiAgID0gQ2hpbGRzSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhTW9kZWxBdHRyKHRoaXMuZWxlbWVudCksXHJcbiAgICAgICAgICAgIGxvb3BOb2RlcyAgIDogTm9kZUxpc3RPZjxIVE1MVGVtcGxhdGVFbGVtZW50PiA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YUZvcih0aGlzLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICAvL0V2ZW50Tm9kZXNcclxuICAgICAgICBpZiAoZXZlbnROb2Rlcykge1xyXG4gICAgICAgICAgICBldmVudE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImV2ZW50XCJdLnB1c2gobmV3IEV2ZW50Tm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogbm9kZVswXSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG5vZGVbMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0clZhbDogbm9kZVsyXSxcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy9EYXRhLXRleHRcclxuICAgICAgICBpZiAodGV4dE5vZGVzKSB7XHJcbiAgICAgICAgICAgIHRleHROb2Rlcy5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0ucHVzaChuZXcgVGV4dE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvL1RleHQgSW5wdXRzIHdpdGggbW9kZWxcclxuICAgICAgICBpZiAobW9kZWxOb2Rlcykge1xyXG4gICAgICAgICAgICBtb2RlbE5vZGVzLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLW1vZGVsXCJdLnB1c2gobmV3IElucHV0QWN0aW9uKHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBpbnB1dCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vRm9yIG5vZGVzXHJcbiAgICAgICAgaWYgKGxvb3BOb2Rlcykge1xyXG4gICAgICAgICAgICBsb29wTm9kZXMuZm9yRWFjaCgobG9vcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZGF0YS1mb3JcIl0ucHVzaChuZXcgTG9vcE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGxvb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcGFyc2VkIGRhdGEsIHdpdGggdGhlIGdldHRlciBhbmQgc2V0dGVyXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgb2YgdGhlIHVucGFyc2VkIGRhdGEgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoYXQgcHJvcGVydHlcclxuICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgZGF0YVxyXG4gICAgICovXHJcbiAgICBwYXJzZWRPYmoobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogUGFyc2VkRGF0YSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5vbWJyZTogbmFtZSxcclxuICAgICAgICAgICAgX3ZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vVGhlcmUncyBhIHdlaXJkIGRlbGF5IHdoZW4geW91IHRyeSB0byBzeW5jIGFsbCBpbnB1dHMsIEkgZG9uJ3Qga25vdyB3aHlcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0uZmlsdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAodGV4dCkgPT4gdGV4dC5fdmFyaWFibGUubm9tYnJlID09IHRoaXMubm9tYnJlLFxyXG4gICAgICAgICAgICAgICAgICAgICkuZm9yRWFjaCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0LnZhbHVlID0gdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TeW5jIHRleHQgd2l0aCBhbGwgaW5wdXRzIHRoYXQgaGF2ZSB0aGlzIHZhcmlhYmxlIGFzIG1vZGVsIGluIHRoZWlyICdkYXRhLW1vZGVsJyBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgICAgIHNlbGYuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl0uZmlsdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgIChpbnB1dCkgPT4gaW5wdXQudmFyaWFibGUgPT0gdGhpcy5ub21icmUsXHJcbiAgICAgICAgICAgICAgICApLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQuYXNzaWduVGV4dCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQgdmFsdWUoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIGN1c3RvbSBldmVudCBpbiB0aGUgc2NvcGUgb2YgdGhlIGRhdGEtYXR0YWNoZWRcclxuICAgICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdHlwZSwgdGhlIGVsZW1lbnQsIGFuZCB0aGUgZnVuY3Rpb24gd2l0aG91dCBleGVjdXRpbmdcclxuICAgICAqL1xyXG4gICAgc2V0RXZlbnQoZXZlbnQ6IENoZXZlcmVFdmVudCkge1xyXG4gICAgICAgIGV2ZW50LmVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudC50eXBlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LmFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgICAgICRhcmdzOiBldmVudC5hcmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZVdpbmRvdywgUGFyc2VkQXJncywgQ2hldmVyZU5vZGVEYXRhIH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xuaW1wb3J0IENoZXZlcmVOb2RlIGZyb20gXCIuL2NoZXZlcmUvQ2hldmVyZU5vZGVcIjtcbmltcG9ydCBDaGV2ZXJlRGF0YSBmcm9tIFwiLi9jaGV2ZXJlL0NoZXZlcmVEYXRhXCI7XG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiLi91dGlscy9IZWxwZXJcIjtcblxuY29uc3QgQ2hldmVyZTogQ2hldmVyZVdpbmRvdyA9IHtcbiAgIG5vZGVzOiBbXSxcbiAgIC8qKlxuICAgICogRmluZCBhIENoZXZlcmVEYXRhIGJ5IHRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtYXR0YWNoZWQnIGF0dHJpYnV0ZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJcbiAgICAqIEBwYXJhbSB7Q2hldmVyZURhdGFbXX0gZGF0YVxuICAgICogQHJldHVybnMgVGhlIGRhdGEgcmVhZHkgZm9yIGluc3RhbmNlIGEgQ2hldmVyZXhOb2RlXG4gICAgKi9cbiAgIGZpbmRJdHNEYXRhKGF0dHI6IHN0cmluZywgZGF0YTogQ2hldmVyZURhdGFbXSk6IENoZXZlcmVEYXRhIHtcbiAgICAgICBsZXQgc2VhcmNoOiBDaGV2ZXJlRGF0YSB8IHVuZGVmaW5lZCA9IGRhdGEuZmluZChcbiAgICAgICAgICAgKGQpID0+IGQubmFtZSA9PSBhdHRyLnJlcGxhY2UoL1xcKC4qXFwpLywgXCJcIiksXG4gICAgICAgKTtcblxuICAgICAgIGlmIChzZWFyY2ggPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgICAgICBgJyR7YXR0cn0nIGNvdWxkbid0IGJlIGZvdW5kIGluIGFueSBvZiB5b3VyIGRlY2xhcmVkIGNvbXBvbmVudHNgLFxuICAgICAgICAgICApO1xuICAgICAgIGVsc2UgcmV0dXJuIHNlYXJjaDtcbiAgIH0sXG4gICAvKipcbiAgICAqIFNlYXJjaCBmb3IgQ2hldmVyZSBOb2RlcyBhdCB0aGUgc2l0ZVxuICAgICogQHBhcmFtIGRhdGEgQWxsIHRoZSBDaGV2ZXJlIGNvbXBvbmVudHNcbiAgICAqL1xuICAgc3RhcnQoLi4uZGF0YTogQ2hldmVyZURhdGFbXSk6IHZvaWQge1xuICAgICAgIGxldCBbLi4ucHJvcHNdID0gZGF0YTtcbiAgICAgICBjb25zdCBlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PiA9XG4gICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZbZGF0YS1hdHRhY2hlZF1cIik7XG5cbiAgICAgICAvL0NyZWF0ZSBhIENoZXZlcmVOb2RlIGZvciBlYWNoIGRhdGEtYXR0YWNoZWRcbiAgICAgICBlbGVtZW50cy5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICBsZXQgZGF0YUF0dGFjaGVkQXR0cjogc3RyaW5nID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1hdHRhY2hlZFwiKSE7XG5cbiAgICAgICAgICAgY29uc3QgZ2V0RGF0YTogQ2hldmVyZURhdGEgPSB0aGlzLmZpbmRJdHNEYXRhKGRhdGFBdHRhY2hlZEF0dHIsIHByb3BzKTtcblxuICAgICAgICAgICBpZigoZ2V0RGF0YS5pbml0ID09IHVuZGVmaW5lZCkgJiYgKEhlbHBlci5odG1sQXJnc0RhdGFBdHRyKGRhdGFBdHRhY2hlZEF0dHIpICE9IHVuZGVmaW5lZCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSdzIG5vIGluaXQgbWV0aG9kIGRlZmluZWQgaW4geW91ciAnJHtnZXREYXRhLm5hbWV9JyBjb21wb25lbnRgKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgLy9JZiB0aGUgaW5pdCBtZXRob2QgaXNuJ3QgdW5kZWZpbmVkXG4gICAgICAgICAgIGlmKGdldERhdGEuaW5pdCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgIC8vQ2hlY2sgZm9yIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgbGV0IGluaXRBcmdzOiBQYXJzZWRBcmdzID0gSGVscGVyLm1ldGhvZEFyZ3VtZW50cyhnZXREYXRhLmluaXQpO1xuICAgICAgICAgICAgICAgbGV0IEhUTUxBcmdzOiBQYXJzZWRBcmdzID0gSGVscGVyLmh0bWxBcmdzRGF0YUF0dHIoZGF0YUF0dGFjaGVkQXR0cik7XG5cbiAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICogQ2hlY2sgdGhlIGRpZmYgYmV0d2VlbiB0aGUgYXJ1bWVudHMgYXQgdGhlIEhUTUwgYW5kIHRob3NlIG9uZXMgZGVjbGFyZWQgYXQgXG4gICAgICAgICAgICAgICAgKiB0aGUgaW5pdCgpIG1ldGhvZFxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICBsZXQgY2hlY2tGb3JJbml0QXJndW1lbnRzOiBib29sZWFuID0gSGVscGVyLmNvbXBhcmVBcmd1bWVudHMoe1xuICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogZ2V0RGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJpbml0KClcIixcbiAgICAgICAgICAgICAgICAgICBodG1sQXJnczogSFRNTEFyZ3MsXG4gICAgICAgICAgICAgICAgICAgbWV0aG9kQXJnczogaW5pdEFyZ3NcbiAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAvL0lmIHRoZXJlJ3Mgbm8gZXJyb3JzLCBwYXJzZSB0aGUgYXJndW1lbnRzLCBhbmQgZXhlY3V0ZSB0aGUgaW5pdCgpIG1ldGhvZFxuICAgICAgICAgICAgICAgaWYoY2hlY2tGb3JJbml0QXJndW1lbnRzKSBnZXREYXRhLnBhcnNlQXJndW1lbnRzKEhUTUxBcmdzISwgaW5pdEFyZ3MhKTtcbiAgICAgICAgICAgICAgIGVsc2UgZ2V0RGF0YS5wYXJzZUluaXQoe1xuICAgICAgICAgICAgICAgICAgIGluaXQ6IGdldERhdGEuaW5pdFxuICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgIH07XG4gICAgICAgXG4gICAgICAgICAgIGxldCBub2RlID0gbmV3IENoZXZlcmVOb2RlKGdldERhdGEsIGVsKTtcblxuICAgICAgICAgICB0aGlzLm5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgfSk7XG4gICB9LFxuICAgZGF0YShkYXRhOiBDaGV2ZXJlTm9kZURhdGEpOiBDaGV2ZXJlRGF0YSB7XG4gICAgICAgcmV0dXJuIG5ldyBDaGV2ZXJlRGF0YShkYXRhKTtcbiAgIH0sXG59O1xuXG53aW5kb3cuQ2hldmVyZSA9IENoZXZlcmU7IiwiaW1wb3J0IHsgRXZlbnRFbGVtZW50cyB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcblxyXG5jb25zdCBDaGlsZHNIZWxwZXIgPSB7XHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YU9uQXR0cihlbGVtZW50OiBFbGVtZW50KTogRXZlbnRFbGVtZW50cyB7XHJcbiAgICAgICAgbGV0IG5vZGVzOiBFdmVudEVsZW1lbnRzID0gW107XHJcblxyXG4gICAgICAgIC8vR2V0IGFsbCBjaGlsZHMgb2YgdGhlIGVsZW1lbnRcclxuICAgICAgICBjb25zdCBjaGlsZHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpO1xyXG5cclxuICAgICAgICAvL1B1c2ggdG8gYG5vZGVzYCBhbGwgZWxlbWVudHMgd2l0aCB0aGUgJ2RhdGEtb24nIG9yICdAb24nIGF0dHJpYnV0ZVxyXG4gICAgICAgIGZvcihsZXQgY2hpbGQgb2YgY2hpbGRzKSB7XHJcbiAgICAgICAgICAgIGZvcihsZXQgYXR0ciBvZiBjaGlsZC5hdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZihhdHRyLm5hbWUuc3RhcnRzV2l0aChcImRhdGEtb25cIikpIFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goW2NoaWxkLCBhdHRyLm5hbWUuc3BsaXQoXCI6XCIpWzFdLCBhdHRyLm5vZGVWYWx1ZSFdKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJAb25cIikpIFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goW2NoaWxkLCBhdHRyLm5hbWUucmVwbGFjZShcIkBvblwiLCBcIlwiKS50b0xvd2VyQ2FzZSgpLCBhdHRyLm5vZGVWYWx1ZSFdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gKG5vZGVzLmxlbmd0aCA9PSAwKSA/IHVuZGVmaW5lZCA6IG5vZGVzO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhVGV4dEF0dHIoZWxlbWVudDogRWxlbWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqW2RhdGEtdGV4dF1cIik7XHJcbiAgICB9LFxyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFNb2RlbEF0dHIoZWxlbWVudDogRWxlbWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFtkYXRhLW1vZGVsXSwgdGV4dGFyZWFbZGF0YS1tb2RlbF0sIHNlbGVjdFtkYXRhLW1vZGVsXVwiKTtcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YUZvcihlbGVtZW50OiBFbGVtZW50KTogTm9kZUxpc3RPZjxIVE1MVGVtcGxhdGVFbGVtZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2RhdGEtZm9yXVwiKTtcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YVNob3coZWxlbWVudDogRWxlbWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqW2RhdGEtc2hvd11cIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDaGlsZHNIZWxwZXI7IiwiaW1wb3J0IHsgQXJnc0Vycm9ycywgQ29tcGFyZUFyZ3VtZW50cywgUGFyc2VkQXJncyB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcbi8qKlxyXG4gKiBIZWxwZXIgY2xhc3MsIGl0IHByb3ZpZGUgdXNlZnVsbCBtZXRob2RzIHRvIENoZXZlcmUgZWxlbWVudHNcclxuICogQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgSGVscGVyID0ge1xyXG4gICAgaXNFbXB0eShvYmo6IG9iamVjdCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PSAwO1xyXG4gICAgfSxcclxuICAgIHNldERhdGFJZChsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGZpbmFsOiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgICAgICBjb25zdCByb3VuZGVkOiBGdW5jdGlvbiA9IChudW06IG51bWJlcik6IG51bWJlciA9PiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBudW0pO1xyXG5cclxuICAgICAgICBjb25zdCBjaGFyczogeyBbdHlwZTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XHJcbiAgICAgICAgICAgIGxldHRlcnMgOiBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCIsXHJcbiAgICAgICAgICAgIG1heXVzICAgOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXHJcbiAgICAgICAgICAgIG51bWJlcnMgOiBcIjAxMjM0NTY3ODlcIixcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcmtleTogc3RyaW5nID0gT2JqZWN0LmtleXMoY2hhcnMpW3JvdW5kZWQoMildO1xyXG4gICAgICAgICAgICBmaW5hbCArPSBjaGFyc1tya2V5XVtyb3VuZGVkKGxlbmd0aCldO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZpbmFsO1xyXG4gICAgfSxcclxuICAgIGNoZWNrRm9yRXJyb3JJblZhcmlhYmxlKHN0cjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcGF0dGVybjogUmVnRXhwID0gL15bMC05XXxcXHMvZztcclxuXHJcbiAgICAgICAgaWYgKHBhdHRlcm4udGVzdChzdHIpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXHJcbiAgICAgICAgICAgICAgICBcIlZhcmlhYmxlIG5hbWUgY2Fubm90IHN0YXJ0IHdpdGggYSBudW1iZXIgb3IgaGF2ZSBzcGFjZXNcIixcclxuICAgICAgICAgICAgKTtcclxuICAgIH0sXHJcbiAgICBodG1sQXJnc0RhdGFBdHRyKGRhdGFBdHRhY2hlZDogc3RyaW5nKTogUGFyc2VkQXJncyB7XHJcbiAgICAgICAgaWYoIWRhdGFBdHRhY2hlZC5tYXRjaCgvXFwoLisvKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgb25seUF0dHJzOiBzdHJpbmcgPSBkYXRhQXR0YWNoZWQucmVwbGFjZSgvXihcXHcrXFwoKXxcXCkrJC9nLCBcIlwiKS5yZXBsYWNlKFwiIFwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChvbmx5QXR0cnMpID8gb25seUF0dHJzLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICBtZXRob2RBcmd1bWVudHMobWV0aG9kOiBGdW5jdGlvbik6IFBhcnNlZEFyZ3Mge1xyXG4gICAgICAgIGxldCBvbmx5QXJnczogc3RyaW5nID0gbWV0aG9kLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcey4qL2dzLCBcIlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxzL2csIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eKFxcdytcXCgpfFxcKSskL2csIFwiXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gKG9ubHlBcmdzKSA/IG9ubHlBcmdzLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZDsgICAgICAgICAgICBcclxuICAgIH0sXHJcbiAgICBnZXRSZWFsVmFsdWVzSW5Bcmd1bWVudHMoZGF0YTogQXJnc0Vycm9ycyk6IGFueVtdIHtcclxuICAgICAgICBsZXQgZmluYWw6IGFueVtdID0gZGF0YS5hcmdzLm1hcCgoYXJnKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAvL1RyeSBnZXQgYSB2YWxpZCB2YWx1ZVxyXG4gICAgICAgICAgICBjb25zdCBmdW5jOiBGdW5jdGlvbiA9ICgpOiBGdW5jdGlvbiA9PiBuZXcgRnVuY3Rpb24oYHJldHVybiAke2FyZ31gKTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmdW5jKCkoKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICAgICBgJHtlcnJvcn0sIGNoZWNrIHRoZSB2YWx1ZXMgb2YgeW91ciAke2RhdGEubWV0aG9kfSwgYXQgb25lIG9mIHlvdXIgJyR7ZGF0YS5uYW1lfScgY29tcG9uZW50c2AsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1JldHVybiB0aGUgdmFsdWVcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmMoKSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9LFxyXG4gICAgY29tcGFyZUFyZ3VtZW50cyhkYXRhOiBDb21wYXJlQXJndW1lbnRzKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGVycm9yUHJlOiBzdHJpbmcgPSBgVGhlICR7ZGF0YS5tZXRob2R9IGZ1bmN0aW9uIG9mIHRoZSAke2RhdGEuY29tcG9uZW50fSgpIGNvbXBvbmVudCBgOyAgICAgICAgXHJcblxyXG4gICAgICAgIHN3aXRjaCh0cnVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgKCghZGF0YS5odG1sQXJncykgJiYgKCFkYXRhLm1ldGhvZEFyZ3MpKToge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoZGF0YS5odG1sQXJncyAhPSB1bmRlZmluZWQpICYmICghZGF0YS5tZXRob2RBcmdzKSk6IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclByZSArIGBkb2Vzbid0IHJlY2VpdmUgYW55IHBhcmFtZXRlcmApO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoIWRhdGEuaHRtbEFyZ3MpICYmIChkYXRhLm1ldGhvZEFyZ3MgIT0gdW5kZWZpbmVkKSk6IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclByZSArIGBuZWVkcyB0byByZWNlaXZlICR7ZGF0YS5tZXRob2RBcmdzfSBwYXJhbWV0ZXJzLCAwIHBhc3NlZGApO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoZGF0YS5tZXRob2RBcmdzPy5sZW5ndGgpICE9IChkYXRhLmh0bWxBcmdzPy5sZW5ndGgpKToge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yUHJlICsgYG5lZWRzIHRvIHJlY2VpdmUgICR7ZGF0YS5tZXRob2RBcmdzPy5sZW5ndGh9IHBhcmFtZXRlcnMsIFxyXG4gICAgICAgICAgICAgICAgICAgICR7ZGF0YS5odG1sQXJncz8ubGVuZ3RofSBwYXNzZWRgKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb250ZW50T2ZGdW5jdGlvbihmdW5jOiBGdW5jdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmMudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvKF5cXHcuKlxceykvZywgXCJcIilcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcfSQvLCBcIlwiKVxyXG4gICAgICAgICAgICAudHJpbSgpO1xyXG4gICAgfVxyXG59O1xyXG4iLCJpbXBvcnQgQ2hldmVyZU5vZGUgZnJvbSBcIi4uL2NoZXZlcmUvQ2hldmVyZU5vZGVcIjtcclxuaW1wb3J0IHsgSW5saW5lUGFyc2VyLCBQYXJzZWRGb3IsIFBhcnNlZFRleHQgfSBmcm9tIFwiLi4vaW50ZXJmYWNlc1wiO1xyXG5cclxuY29uc3QgUGFyc2VyOiBJbmxpbmVQYXJzZXIgPSB7XHJcbiAgICBwYXR0ZXJuczoge1xyXG4gICAgICAgIGdsb2JhbDoge1xyXG4gICAgICAgICAgICB2YXJpYWJsZUV4cHJlc3Npb246IC9eXFx3K3xcXDxcXD18XFw+XFw9fFxcPXxcXDx8XFw+fFxcIVthLXpBLXpdK3xbYS16QS1aXSsvLFxyXG4gICAgICAgICAgICB2YXJpYWJsZU5hbWU6IC8oXFwuLiopfChcXFsuKikvLFxyXG4gICAgICAgICAgICBpbmRleFZhbHVlOiAvKFxcW3swfShbMC05XSspXFxdezB9KXwoXFwuezB9XFx3KyQpL2csXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGp1c3RWYXJpYWJsZTogL15bYS16QS1aXSskLyxcclxuICAgICAgICAgICAgc2luZ2xlT2JqZWN0IDogL15bYS16QS1aXSsoKFxcLlthLXpBLXpdKiQpfChcXFtbMC05XXsxLH1cXF0kKSkvLFxyXG4gICAgICAgICAgICBuZXN0ZWRPYmplY3Q6IC9eW2EtekEtWl0rKChcXC5bYS16QS1aXS4rKXsxfXwoXFxbLitcXF0uKykpL1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwYXJzZURhdGFUZXh0QXR0cihhdHRyOiBzdHJpbmcsIG5vZGU6IENoZXZlcmVOb2RlKTogUGFyc2VkVGV4dCB7XHJcbiAgICAgICAgbGV0IHR5cGUgPSBPYmplY3Qua2V5cyh0aGlzLnBhdHRlcm5zLnRleHQpXHJcbiAgICAgICAgICAgIC5maW5kKChwYXR0ZXJuKSA9PiB0aGlzLnBhdHRlcm5zLnRleHRbcGF0dGVybl0udGVzdChhdHRyKSk7XHJcblxyXG4gICAgICAgIGlmKCF0eXBlKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlIHZhbHVlIG9mIHRoZSAnZGF0YS10ZXh0JyBhdHRyaWJ1dGUgY29udGFpbnMgaW52YWxpZCBleHByZXNzaW9uc1wiKTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB2YXJOYW1lOiBzdHJpbmcgPSBhdHRyLnJlcGxhY2UodGhpcy5wYXR0ZXJucy5nbG9iYWwudmFyaWFibGVOYW1lLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZGF0YTogUGFyc2VkVGV4dCA9IHsgdmFyaWFibGU6IG5vZGUuZGF0YVt2YXJOYW1lXSB9O1xyXG5cclxuICAgICAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwianVzdFZhcmlhYmxlXCIgOiB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLnZhbHVlID0gZGF0YS52YXJpYWJsZS52YWx1ZTtcclxuICAgICAgICAgICAgfSBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJzaW5nbGVPYmplY3RcIiA6IHtcclxuICAgICAgICAgICAgICAgIGRhdGEudmFsdWUgPSBkYXRhLnZhcmlhYmxlLnZhbHVlW2F0dHIubWF0Y2godGhpcy5wYXR0ZXJucy5nbG9iYWwuaW5kZXhWYWx1ZSkhWzBdXTtcclxuICAgICAgICAgICAgfSBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJuZXN0ZWRPYmplY3RcIiA6IHtcclxuICAgICAgICAgICAgICAgIGxldCBzZXBhcmVkOiBzdHJpbmdbXSA9IGF0dHIuc3BsaXQoL1xcW3xcXF18XFwuL2cpLmZpbHRlcih3ID0+IHcgIT09IFwiXCIpLnNsaWNlKDEpLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogbnVtYmVyID0gc2VwYXJlZC5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZmluZE5lc3RlZFByb3AodmFyaWFibGU6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9LCBwb3M6IG51bWJlciA9IDApOiBhbnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBvYmogPSB2YXJpYWJsZVtzZXBhcmVkW3Bvc11dO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAocG9zID09IGxlbmd0aC0xKSA/IG9iaiA6IGZpbmROZXN0ZWRQcm9wKG9iaiwgcG9zICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGRhdGEudmFsdWUgPSBmaW5kTmVzdGVkUHJvcChkYXRhLnZhcmlhYmxlLnZhbHVlKTtcclxuICAgICAgICAgICAgfSBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfSxcclxuICAgIHBhcnNlRGF0YUZvckF0dHIoYXR0cjogc3RyaW5nLCBub2RlOiBDaGV2ZXJlTm9kZSk6IFBhcnNlZEZvciB7XHJcbiAgICAgICAgbGV0IHBhcnNlZERhdGE6IFBhcnNlZEZvciA9IHt9O1xyXG5cclxuICAgICAgICBsZXQgZXhwcmVzc2lvbnM6IHN0cmluZ1tdID0gYXR0ci5zcGxpdChcIiBcIik7XHJcblxyXG4gICAgICAgIGlmKGV4cHJlc3Npb25zLmxlbmd0aCA+IDMpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJUaGUgdmFsdWUgb2YgdGhlICdkYXRhLWZvcicgYXR0cmlidXRlIGNvbnRhaW5zIGludmFsaWQgZXhwcmVzc2lvbnNcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcGFyc2VkRGF0YS5leHByZXNzaW9ucyA9IGV4cHJlc3Npb25zO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB2YXJpYWJsZSA9IE9iamVjdC5rZXlzKG5vZGUuZGF0YSkuZmluZCgodmFyaWFibGUpID0+IHZhcmlhYmxlID09IGV4cHJlc3Npb25zWzJdKTtcclxuXHJcbiAgICAgICAgaWYoIXZhcmlhYmxlKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBBIHZhcmlhYmxlIHdpdGggdGhlIG5hbWUgJHtleHByZXNzaW9uc1syXX0gY291bGRuJ3QgYmUgZm91bmQgaW4gdGhlIGRhdGEgb2YgeW91ciAke25vZGUubmFtZX0oKSBjb21wb25lbnRgKTtcclxuICAgICAgICBlbHNlIHBhcnNlZERhdGEudmFyaWFibGUgPSBub2RlLmRhdGFbdmFyaWFibGVdO1xyXG5cclxuICAgICAgICByZXR1cm4gcGFyc2VkRGF0YTtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYXJzZXI7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3RzL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9