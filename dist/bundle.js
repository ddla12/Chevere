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
exports.InputAction = exports.TextAction = void 0;
const Helper_1 = __webpack_require__(/*! ../utils/Helper */ "./src/ts/utils/Helper.ts");
class TextAction {
    constructor(data) {
        this.element = data.element;
        this.element.setAttribute("data-id", Helper_1.Helper.setDataId(10));
        this.parent = data.parent;
        this.variable = this.element.getAttribute("data-text");
        this.element.textContent = this._variable.value;
    }
    setText(value) {
        this.element.textContent = value.toString();
    }
    set variable(attr) {
        Helper_1.Helper.checkForErrorInVariable(attr);
        const arrAttr = attr.split(".").splice(1).join(".");
        const customObjAttr = attr.replace(/\..*/, ``);
        let parentVar = Object.keys(this.parent.data).find((d) => d == customObjAttr);
        if (!parentVar)
            throw new ReferenceError(`The variable or method named '${parentVar}' wasn't found on the data-attached scope`);
        if (arrAttr === "")
            this._variable = this.parent.data[parentVar];
        else {
            let arr = arrAttr.split(".");
            let last = arr[arr.length - 1];
            let length = arr.length - 1;
            //Find the nested property by recursivity
            function findProperty(obj, key, pos, nested) {
                if (nested == length) {
                    if (obj.hasOwnProperty(key))
                        return obj[key];
                    else
                        throw new ReferenceError(`There's no a '${key}' property in the '${obj}' property,  the ${parentVar}`);
                }
                else {
                    return findProperty(obj[arr[pos]], last, pos + 1, nested + 1);
                }
            }
            let exists = findProperty(this.parent.data[parentVar].value, last, 0, 0);
            console.log(exists);
            if (!exists)
                throw new ReferenceError(`The property named '${arrAttr}' wasn't found on the '${parentVar}' data`);
            this._variable = exists;
        }
    }
}
exports.TextAction = TextAction;
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
const Helper_1 = __webpack_require__(/*! ../utils/Helper */ "./src/ts/utils/Helper.ts");
const InlineParser_1 = __importDefault(__webpack_require__(/*! ../utils/InlineParser */ "./src/ts/utils/InlineParser.ts"));
class LoopNode {
    constructor(data) {
        this.element = data.element;
        this.parent = data.parent;
        let parsed = InlineParser_1.default.parseDataForAttr(this.element.getAttribute("data-for"), this.parent);
        this.count = parsed.count;
        this.variable = parsed.variable;
        this.loopElements();
    }
    ;
    loopElements() {
        let pos = Array.from(this.parent.element.children).indexOf(this.element);
        const template = document.createDocumentFragment();
        for (let i = 0; i <= this.count; i++) {
            const element = this.element.content.querySelector("div:first-of-type");
            if (!element)
                throw new Error("The first child of your data-for element must be a div element");
            element.querySelectorAll("*[data-text]").forEach(element => {
                element.setAttribute("data-id", Helper_1.Helper.setDataId(10));
                element.textContent = this.variable.value[i];
            });
            template.appendChild(element?.cloneNode(true));
            this.element.remove();
        }
        ;
        this.parent.element.insertBefore(template, this.parent.element.children[pos]);
    }
}
exports.default = LoopNode;


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
                this.childs["data-text"].push(new Index_1.TextAction({
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
                        text.setText(this.value);
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
            .replace(/(^\w.*\{)/gs, "")
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
        variableExpression: /^\w+|\<\=|\>\=|\=|\<|\>|\![a-zA-z]+|[a-zA-Z]+/,
        forInExpression: /^\w+|(in)|\w+$/g,
    },
    parseDataForAttr(attr, node) {
        let parsedData = {};
        let expressions = attr.split(" ");
        if (expressions.length > 3)
            throw new Error("The value of the 'data-for' attribute has invalid expressions");
        let variable = Object.keys(node.data).find((variable) => variable == expressions[2]);
        if (!variable)
            throw new ReferenceError(`A variable with the name ${expressions[2]} couldn't be found in the data of your ${node.name}() component`);
        else
            parsedData.variable = node.data[variable];
        parsedData.count = node.data[variable].length || Object.keys(node.data[variable]).length;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFNUMsSUFBRyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywrREFBK0QsQ0FBQyxDQUFDO1FBRXJGLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJGLElBQUcsQ0FBQyxRQUFRO1lBQ1IsTUFBTSxJQUFJLGNBQWMsQ0FBQyw0QkFBNEIsV0FBVyxDQUFDLENBQUMsQ0FBQywwQ0FBMEMsSUFBSSxDQUFDLElBQUksY0FBYyxDQUFDLENBQUM7O1lBQ3JJLFVBQVUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUvQyxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUV6RixPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0NBQ0osQ0FBQztBQUVGLGtCQUFlLE1BQU0sQ0FBQzs7Ozs7OztVQzVCdEI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvQWN0aW9ucy9FdmVudE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9BY3Rpb25zL0luZGV4LnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvQWN0aW9ucy9Mb29wTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvQ2hldmVyZURhdGEudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9jaGV2ZXJlL0NoZXZlcmVOb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9DaGlsZHNIZWxwZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9IZWxwZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9JbmxpbmVQYXJzZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRDaGlsZCwgUGFyc2VkQXJncywgQXJndW1lbnRzT2JqZWN0IH0gZnJvbSBcIi4uL2ludGVyZmFjZXNcIjtcclxuaW1wb3J0IENoZXZlcmVOb2RlIGZyb20gXCIuLi9jaGV2ZXJlL0NoZXZlcmVOb2RlXCI7XHJcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCIuLi91dGlscy9IZWxwZXJcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50Tm9kZSBpbXBsZW1lbnRzIEV2ZW50Q2hpbGQge1xyXG4gICAgZWxlbWVudDogRWxlbWVudDtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcbiAgICBtZXRob2Q/OiBGdW5jdGlvbjtcclxuICAgIGV2ZW50OiBzdHJpbmc7XHJcbiAgICBhdHRyVmFsOiBzdHJpbmc7XHJcbiAgICBhcmdzPzoge307XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogRXZlbnRDaGlsZCkge1xyXG4gICAgICAgIC8vR2l2ZSBpdCBhbiBJRCBmb3IgdGhlIGVsZW1lbnRcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkYXRhLmVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldERhdGFJZCgxMCkpO1xyXG5cclxuICAgICAgICAvL0dldCB0aGUgdHlwZSBvZiBldmVudFxyXG4gICAgICAgIHRoaXMuZXZlbnQgPSBkYXRhLmV2ZW50O1xyXG5cclxuICAgICAgICAvL1RoZSB2YWx1ZSBvZiB0aGUgYXR0cmlidXJlXHJcbiAgICAgICAgdGhpcy5hdHRyVmFsID0gZGF0YS5hdHRyVmFsO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBkYXRhLnBhcmVudDtcclxuXHJcbiAgICAgICAgLy9TZWFyY2ggbWV0aG9kIGFuZCBjaGVjayBpZiBpdCBoYXMgYXJndW1lbnRzXHJcbiAgICAgICAgdGhpcy5tZXRob2QgPSB0aGlzLnNlYXJjaE1ldGhvZCgpO1xyXG4gICAgICAgIHRoaXMuYXJncyA9IHRoaXMuZmluZEFyZ3VtZW50cygpO1xyXG5cclxuICAgICAgICAvL0lmIGV2ZXJ5dGhpbmcgaXMgb2ssIHRoZW4gc2V0IHRoZSBFdmVudFxyXG4gICAgICAgIHRoaXMucGFyZW50Py5zZXRFdmVudCh7XHJcbiAgICAgICAgICAgIGVsZW06IHRoaXMuZWxlbWVudCxcclxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLm1ldGhvZCEsXHJcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuZXZlbnQsXHJcbiAgICAgICAgICAgIGFyZ3M6IHRoaXMuYXJnc1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZpbmRBcmd1bWVudHMoKTogQXJndW1lbnRzT2JqZWN0fHVuZGVmaW5lZCB7XHJcbiAgICAgICAgbGV0IG1ldGhvZE5hbWU6IHN0cmluZyA9IHRoaXMuYXR0clZhbC5yZXBsYWNlKC9cXCguKy8sIFwiXCIpO1xyXG5cclxuICAgICAgICBpZigoIXRoaXMucGFyZW50LmFyZ3NbbWV0aG9kTmFtZV0pIHx8IChIZWxwZXIuaXNFbXB0eSh0aGlzLnBhcmVudC5hcmdzW21ldGhvZE5hbWVdISkpKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vVGhlIGFyZ3NcclxuICAgICAgICBsZXQgaHRtbEFyZ3M6IFBhcnNlZEFyZ3MgPSBIZWxwZXIuaHRtbEFyZ3NEYXRhQXR0cih0aGlzLmF0dHJWYWwpLFxyXG4gICAgICAgICAgICBwYXJlbnRBcmdzOiBQYXJzZWRBcmdzID0gdGhpcy5wYXJlbnQuYXJnc1ttZXRob2ROYW1lXTtcclxuXHJcbiAgICAgICAgLy9DaGVjayBmb3IgZXJyb3JzIGluIHRoZSBhcmdtZW50c1xyXG4gICAgICAgIEhlbHBlci5jb21wYXJlQXJndW1lbnRzKHtcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2ROYW1lLFxyXG4gICAgICAgICAgICBjb21wb25lbnQ6IHRoaXMucGFyZW50Lm5hbWUsXHJcbiAgICAgICAgICAgIGh0bWxBcmdzOiBodG1sQXJncyxcclxuICAgICAgICAgICAgbWV0aG9kQXJnczogcGFyZW50QXJncyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IGZpbmFsID0gSGVscGVyLmdldFJlYWxWYWx1ZXNJbkFyZ3VtZW50cyh7XHJcbiAgICAgICAgICAgIGFyZ3M6IGh0bWxBcmdzIGFzIHN0cmluZ1tdLFxyXG4gICAgICAgICAgICBuYW1lOiB0aGlzLnBhcmVudC5uYW1lLFxyXG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZE5hbWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgdGhlIGFyZ3VtZW50IG9iamVjdFxyXG4gICAgICAgIGxldCBhcmdzT2JqOiBBcmd1bWVudHNPYmplY3QgPSB7fTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpIGluIHBhcmVudEFyZ3MpIGFyZ3NPYmpbcGFyZW50QXJnc1tpXV0gPSBmaW5hbFtpXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGFyZ3NPYmo7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNlYXJjaE1ldGhvZCgpOiBGdW5jdGlvbiB7XHJcbiAgICAgICAgbGV0IHZhbDogc3RyaW5nID0gdGhpcy5hdHRyVmFsLnJlcGxhY2UoL1xcKC4rLywgXCJcIik7XHJcblxyXG4gICAgICAgIGxldCBtZXRob2Q6IEZ1bmN0aW9uID0gdGhpcy5wYXJlbnQubWV0aG9kcyFbdmFsXTtcclxuXHJcbiAgICAgICAgaWYgKCFtZXRob2QpIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlcmUncyBubyBtZXRob2QgJHt2YWx9IGluIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCk7XHJcblxyXG4gICAgICAgIHJldHVybiBtZXRob2Q7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgQ2hldmVyZU5vZGUgZnJvbSBcIi4uL2NoZXZlcmUvQ2hldmVyZU5vZGVcIjtcbmltcG9ydCB7IFRleHRSZWxhdGlvbiwgSW5wdXRNb2RlbCB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiLi4vdXRpbHMvSGVscGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBUZXh0QWN0aW9uIGltcGxlbWVudHMgVGV4dFJlbGF0aW9uIHtcbiAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XG4gICAgX3ZhcmlhYmxlPzogYW55O1xuXG4gICAgY29uc3RydWN0b3IoZGF0YTogVGV4dFJlbGF0aW9uKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGRhdGEuZWxlbWVudDtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldERhdGFJZCgxMCkpO1xuXG4gICAgICAgIHRoaXMucGFyZW50ID0gZGF0YS5wYXJlbnQ7XG5cbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIikhO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuX3ZhcmlhYmxlLnZhbHVlO1xuICAgIH1cblxuICAgIHNldFRleHQodmFsdWU6IGFueSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQgPSB2YWx1ZS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHNldCB2YXJpYWJsZShhdHRyOiBzdHJpbmcpIHtcbiAgICAgICAgSGVscGVyLmNoZWNrRm9yRXJyb3JJblZhcmlhYmxlKGF0dHIpO1xuXG4gICAgICAgIGNvbnN0IGFyckF0dHI6IHN0cmluZyA9IGF0dHIuc3BsaXQoXCIuXCIpLnNwbGljZSgxKS5qb2luKFwiLlwiKTtcblxuICAgICAgICBjb25zdCBjdXN0b21PYmpBdHRyID0gYXR0ci5yZXBsYWNlKC9cXC4uKi8sIGBgKTtcblxuICAgICAgICBsZXQgcGFyZW50VmFyID0gT2JqZWN0LmtleXModGhpcy5wYXJlbnQuZGF0YSkuZmluZChcbiAgICAgICAgICAgIChkKSA9PiBkID09IGN1c3RvbU9iakF0dHIsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFwYXJlbnRWYXIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgICAgICAgYFRoZSB2YXJpYWJsZSBvciBtZXRob2QgbmFtZWQgJyR7cGFyZW50VmFyfScgd2Fzbid0IGZvdW5kIG9uIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgaWYgKGFyckF0dHIgPT09IFwiXCIpIHRoaXMuX3ZhcmlhYmxlID0gdGhpcy5wYXJlbnQuZGF0YVtwYXJlbnRWYXJdO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBhcnI6IHN0cmluZ1tdID0gYXJyQXR0ci5zcGxpdChcIi5cIik7XG4gICAgICAgICAgICBsZXQgbGFzdDogc3RyaW5nID0gYXJyW2Fyci5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IGFyci5sZW5ndGggLSAxO1xuXG4gICAgICAgICAgICAvL0ZpbmQgdGhlIG5lc3RlZCBwcm9wZXJ0eSBieSByZWN1cnNpdml0eVxuICAgICAgICAgICAgZnVuY3Rpb24gZmluZFByb3BlcnR5KFxuICAgICAgICAgICAgICAgIG9iajogYW55LFxuICAgICAgICAgICAgICAgIGtleTogYW55LFxuICAgICAgICAgICAgICAgIHBvczogbnVtYmVyLFxuICAgICAgICAgICAgICAgIG5lc3RlZDogbnVtYmVyLFxuICAgICAgICAgICAgKTogYW55IHtcbiAgICAgICAgICAgICAgICBpZiAobmVzdGVkID09IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHJldHVybiBvYmpba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBUaGVyZSdzIG5vIGEgJyR7a2V5fScgcHJvcGVydHkgaW4gdGhlICcke29ian0nIHByb3BlcnR5LCAgdGhlICR7cGFyZW50VmFyfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaW5kUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbYXJyW3Bvc11dLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWQgKyAxLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGV4aXN0cyA9IGZpbmRQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5kYXRhW3BhcmVudFZhcl0udmFsdWUsXG4gICAgICAgICAgICAgICAgbGFzdCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhleGlzdHMpO1xuICAgICAgICAgICAgaWYgKCFleGlzdHMpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgVGhlIHByb3BlcnR5IG5hbWVkICcke2FyckF0dHJ9JyB3YXNuJ3QgZm91bmQgb24gdGhlICcke3BhcmVudFZhcn0nIGRhdGFgLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHRoaXMuX3ZhcmlhYmxlID0gZXhpc3RzO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFRoZSBjbGFzcyBmb3IgdGhvc2UgaW5wdXRzIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgYGRhdGEtbW9kZWxgIGF0dHJpYnV0ZVxuICogIEBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgSW5wdXRBY3Rpb24gaW1wbGVtZW50cyBJbnB1dE1vZGVsIHtcbiAgICBlbGVtZW50OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgSFRNTElucHV0RWxlbWVudDtcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xuICAgIHZhcmlhYmxlOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihpbnB1dDogSW5wdXRNb2RlbCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IGlucHV0LnBhcmVudDtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gaW5wdXQuZWxlbWVudCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXG4gICAgICAgIC8vU2VhcmNoIGlmIHRoZSBpbmRpY2F0ZWQgdmFyaWFibGUgb2YgdGhlIGRhdGEtbW9kZWwgYXR0cmlidXRlIGV4aXN0cyBpbiB0aGUgc2NvcGVcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZ2V0VmFyaWFibGUoKTtcblxuICAgICAgICAvL1NldCB0aGUgZGVmYXVsdCB2YWx1ZVxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdLnZhbHVlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgLy9BZGQgdGhlIGxpc3RlbmVyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zeW5jVGV4dCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3NpZ25UZXh0KHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzeW5jVGV4dCgpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZSA9IHRoaXMuZWxlbWVudC52YWx1ZS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGdldFZhcmlhYmxlKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBhdHRyID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtbW9kZWxcIikhO1xuXG4gICAgICAgIEhlbHBlci5jaGVja0ZvckVycm9ySW5WYXJpYWJsZShhdHRyKTtcblxuICAgICAgICBsZXQgdmFyaWFibGUgPSBPYmplY3Qua2V5cyh0aGlzLnBhcmVudC5kYXRhKS5maW5kKFxuICAgICAgICAgICAgKGRhdGEpID0+IGRhdGEgPT0gYXR0cixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIXZhcmlhYmxlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgIGBUaGVyZSdzIG5vIGEgJyR7YXR0cn0nIHZhcmlhYmxlIGluIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHZhcmlhYmxlO1xuICAgIH1cbn0iLCJpbXBvcnQgQ2hldmVyZU5vZGUgZnJvbSBcIi4uL2NoZXZlcmUvQ2hldmVyZU5vZGVcIjtcclxuaW1wb3J0IHsgTG9vcEVsZW1lbnQsIFBhcnNlZERhdGEsIFBhcnNlZEZvciB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCIuLi91dGlscy9IZWxwZXJcIjtcclxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vdXRpbHMvSW5saW5lUGFyc2VyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb29wTm9kZSBpbXBsZW1lbnRzIExvb3BFbGVtZW50IHtcclxuICAgIGVsZW1lbnQ6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XHJcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xyXG4gICAgY291bnQ6IG51bWJlcjtcclxuICAgIHZhcmlhYmxlOiBQYXJzZWREYXRhO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IExvb3BFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZGF0YS5lbGVtZW50O1xyXG4gICAgICAgIHRoaXMucGFyZW50ID0gZGF0YS5wYXJlbnQ7XHJcblxyXG4gICAgICAgIGxldCBwYXJzZWQ6IFBhcnNlZEZvciA9IFBhcnNlci5wYXJzZURhdGFGb3JBdHRyKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZvclwiKSEsIHRoaXMucGFyZW50KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb3VudCA9IHBhcnNlZC5jb3VudCE7XHJcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHBhcnNlZC52YXJpYWJsZSE7XHJcblxyXG4gICAgICAgIHRoaXMubG9vcEVsZW1lbnRzKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxvb3BFbGVtZW50cygpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSBBcnJheS5mcm9tKHRoaXMucGFyZW50LmVsZW1lbnQuY2hpbGRyZW4pLmluZGV4T2YodGhpcy5lbGVtZW50KTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZTogRG9jdW1lbnRGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gdGhpcy5jb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQuY29udGVudC5xdWVyeVNlbGVjdG9yKFwiZGl2OmZpcnN0LW9mLXR5cGVcIik7XHJcblxyXG4gICAgICAgICAgICBpZighZWxlbWVudCkgXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgZmlyc3QgY2hpbGQgb2YgeW91ciBkYXRhLWZvciBlbGVtZW50IG11c3QgYmUgYSBkaXYgZWxlbWVudFwiKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS10ZXh0XVwiKS5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIEhlbHBlci5zZXREYXRhSWQoMTApKVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMudmFyaWFibGUudmFsdWVbaV07XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGVtcGxhdGUuYXBwZW5kQ2hpbGQoZWxlbWVudD8uY2xvbmVOb2RlKHRydWUpISk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZWxlbWVudC5pbnNlcnRCZWZvcmUodGVtcGxhdGUsIHRoaXMucGFyZW50LmVsZW1lbnQuY2hpbGRyZW5bcG9zXSk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZURhdGEsIERhdGFUeXBlLCBNZXRob2RUeXBlLCBBcmd1bWVudHNPYmplY3QsIEluaXQgfSBmcm9tIFwiLi4vaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiLi4vdXRpbHMvSGVscGVyXCI7XHJcblxyXG4vKipcclxuICogIFRoZSBjbGFzcyB0aGF0IHVzZXJzIGNyZWF0ZSB0aGVpciBjb21wb25lbnRzXHJcbiAqICBAY2xhc3NcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoZXZlcmVEYXRhIGltcGxlbWVudHMgQ2hldmVyZU5vZGVEYXRhIHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGRhdGE6IERhdGFUeXBlO1xyXG4gICAgaW5pdD86IEZ1bmN0aW9uO1xyXG4gICAgbWV0aG9kcz86IE1ldGhvZFR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZU5vZGVEYXRhKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGEuZGF0YTtcclxuICAgICAgICB0aGlzLmluaXQgPSBkYXRhLmluaXQ7XHJcbiAgICAgICAgdGhpcy5tZXRob2RzID0gZGF0YS5tZXRob2RzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgdGhlIGFyZ3VtZW50cyBvZiB0aCBpbml0KCkgbWV0aG9kXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBodG1sQXJncyBUaGUgYXJndW1lbnRzIG9mIGRlIGRhdGEtYXR0YWNoZWQgYXR0cmlidXRlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBpbml0QXJncyBUaGUgYXJndW1lbnRzIGRlZmluZWQgaW4gdGhlIGluaXQoKSBtZXRob2RcclxuICAgICAqL1xyXG4gICAgcGFyc2VBcmd1bWVudHMoaHRtbEFyZ3M6IHN0cmluZ1tdLCBtZXRob2RBcmdzOiBzdHJpbmdbXSk6IHZvaWQge1xyXG5cclxuICAgICAgICAvL0dldCBhIHZhbGlkIHZhbHVlIGZvciB0aGUgYXJndW1lbnQsIGZvciBleGFtcGxlLCBjaGVjayBmb3Igc3RyaW5ncyB3aXRoIHVuY2xvc2VkIHF1b3Rlc1xyXG4gICAgICAgIGxldCBmaW5hbCA9IEhlbHBlci5nZXRSZWFsVmFsdWVzSW5Bcmd1bWVudHMoe1xyXG4gICAgICAgICAgICBhcmdzOiBodG1sQXJncyxcclxuICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiaW5pdCgpXCJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgdGhlIGFyZ3VtZW50IG9iamVjdFxyXG4gICAgICAgIGxldCBhcmdzT2JqOiBBcmd1bWVudHNPYmplY3QgPSB7fTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpIGluIG1ldGhvZEFyZ3MpIGFyZ3NPYmpbbWV0aG9kQXJnc1tpXV0gPSBmaW5hbFtpXTtcclxuXHJcbiAgICAgICAgLy8uLi5hbmQgcGFzcyBpdCB0byB0aGUgdW5wYXJzZWQgaW5pdCBmdW5jdGlvblxyXG4gICAgICAgIHRoaXMucGFyc2VJbml0KHtcclxuICAgICAgICAgICAgaW5pdDogdGhpcy5pbml0ISxcclxuICAgICAgICAgICAgYXJnczogYXJnc09iaixcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBpbml0IGZ1bmN0aW9uIGFuZCBleGVjdXRlcyBpdFxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaW5pdCBUaGUgdW5wYXJzZWQgaW5pdCBmdW5jdGlvblxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGFyZ3MgVGhlIHBhcnNlZCBjdXN0b20gYXJndW1lbnRzXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgaW5pdCBmdW5jdGlvblxyXG4gICAgICovXHJcbiAgICBwYXJzZUluaXQoaW5pdDogSW5pdCk6IEZ1bmN0aW9uIHtcclxuXHJcbiAgICAgICAgbGV0IGluaXRGdW5jOiBzdHJpbmcgPSBIZWxwZXIuY29udGVudE9mRnVuY3Rpb24oaW5pdC5pbml0KTtcclxuXHJcbiAgICAgICAgLy9GaW5kcyB0aGUgcmVhbCBhcmd1bWVudHMgYW5kIG5vIGV4cHJlc3Npb25zIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICAgIGlmIChpbml0LmFyZ3MpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoaW5pdC5hcmdzKS5mb3JFYWNoKChhcmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzdHI6IHN0cmluZyA9IGAoPzw9KD1cXFxccyl8KFxcXFwoKXwoPSkpKCR7YXJnfSlgO1xyXG4gICAgICAgICAgICAgICAgaW5pdEZ1bmMgPSBpbml0RnVuYy5yZXBsYWNlKG5ldyBSZWdFeHAoc3RyLCBcImdcIiksIGAkYXJncy4ke2FyZ31gKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL0NyZWF0ZSB0aGUgbmV3IHBhcnNlZCBpbml0IGZ1bmN0aW9uXHJcbiAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgICAgICBcInskdGhpcyA9IHVuZGVmaW5lZCwgJGFyZ3MgPSB1bmRlZmluZWR9XCIsXHJcbiAgICAgICAgICAgIGluaXRGdW5jLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vUmV0dXJuIHRoZSBuZXcgaW5pdCBmdW5jdGlvbiBhbmQgZXhlY3V0ZXMgaXRcclxuICAgICAgICByZXR1cm4gbmV3RnVuYyh7XHJcbiAgICAgICAgICAgICR0aGlzOiB0aGlzLFxyXG4gICAgICAgICAgICAkYXJnczogaW5pdC5hcmdzLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZUVsZW1lbnQsIE1ldGhvZFR5cGUsIERhdGFUeXBlLCBDaGlsZCwgQ2hldmVyZUV2ZW50LCBQYXJzZWREYXRhLCBTZWxlY3RvcnMsIEV2ZW50RWxlbWVudHMsIFBhcnNlZEFyZ3MgfSBmcm9tIFwiLi4vaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBUZXh0QWN0aW9uLCBJbnB1dEFjdGlvbiB9IGZyb20gXCIuLi9BY3Rpb25zL0luZGV4XCI7XHJcbmltcG9ydCBDaGV2ZXJlRGF0YSBmcm9tIFwiLi9DaGV2ZXJlRGF0YVwiO1xyXG5pbXBvcnQgRXZlbnROb2RlIGZyb20gXCIuLi9BY3Rpb25zL0V2ZW50Tm9kZVwiO1xyXG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiLi4vdXRpbHMvSGVscGVyXCI7XHJcbmltcG9ydCBDaGlsZHNIZWxwZXIgZnJvbSBcIi4uL3V0aWxzL0NoaWxkc0hlbHBlclwiO1xyXG5pbXBvcnQgTG9vcE5vZGUgZnJvbSBcIi4uL0FjdGlvbnMvTG9vcE5vZGVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoZXZlcmVOb2RlIGltcGxlbWVudHMgQ2hldmVyZUVsZW1lbnQge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZGF0YTogRGF0YVR5cGU7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgbWV0aG9kcz86IE1ldGhvZFR5cGU7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgYXJnczogeyBbbWV0aG9kOiBzdHJpbmddOiBQYXJzZWRBcmdzIH0gPSB7fTtcclxuICAgIGNoaWxkcz86IENoaWxkID0ge1xyXG4gICAgICAgIFwiZXZlbnRcIjogW10sXHJcbiAgICAgICAgXCJkYXRhLXRleHRcIjogW10sXHJcbiAgICAgICAgXCJkYXRhLW1vZGVsXCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1mb3JcIjogW11cclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZURhdGEsIGVsOiBFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucGFyc2VEYXRhKGRhdGEuZGF0YSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBQYXJzZSBhbGwgJHRoaXMsICRzZWxmLCAkZGF0YS4uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMubWV0aG9kcyA9IHRoaXMucGFyc2VNZXRob2RzKGRhdGEubWV0aG9kcyk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCB0aGUgcGFyZW50IGBkaXZgIGFuZCBnaXZlIGl0IGEgdmFsdWUgZm9yIHRoZSBkYXRhLWlkIGF0dHJpYnV0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBIZWxwZXIuc2V0RGF0YUlkKDEwKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCB0aGlzLmlkKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIEdldCB0aGUgZXZlbnRzIGFuZCBhY3Rpb25zIG9mIHRoZSBjb21wb25lbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNoZWNrRm9yQWN0aW9uc0FuZENoaWxkcygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgYWxsIHRoZSBkYXRhLCB0aGV5IG5lZWQgZ2V0dGVyIGFuZCBhIHNldHRlclxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIHByaW1pdGl2ZSBkYXRhXHJcbiAgICAgKi9cclxuICAgIHBhcnNlRGF0YShkYXRhOiBEYXRhVHlwZSkge1xyXG4gICAgICAgIGxldCBvYmo6IFtzdHJpbmcsIFBhcnNlZERhdGFdW10gPSBbXTtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICBvYmoucHVzaChbZCwgdGhpcy5wYXJzZWRPYmooZCwgZGF0YVtkXSldKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhvYmopO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VkIHRoZSBtZXRob2RzIGRlc2NyaWJlZCBpbiB0aGUgbWV0aG9kIHByb3BlcnR5IG9mIHRoZSBkYXRhXHJcbiAgICAgKiBAcGFyYW0ge01ldGhvZFR5cGV9IG1ldGhvZHNcclxuICAgICAqIEByZXR1cm5zIFRoZSBtZXRob2RzIHBhcnNlZFxyXG4gICAgICovXHJcbiAgICBwYXJzZU1ldGhvZHMobWV0aG9kcz86IE1ldGhvZFR5cGUpOiBNZXRob2RUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAobWV0aG9kcyA9PSB1bmRlZmluZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaCgobWV0aG9kKSA9PiB7XHJcbiAgICAgICAgICAgIC8vSWYgdGhlIG1ldGhvZCB3YXMgYWxyZWFkeSBwYXJzZWRcclxuICAgICAgICAgICAgbGV0IHdhc1BhcnNlZDogbnVtYmVyID0gbWV0aG9kc1ttZXRob2RdXHJcbiAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgLnNlYXJjaChcImFub255bW91c1wiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXNQYXJzZWQgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhcmdzOiBQYXJzZWRBcmdzID0gSGVscGVyLm1ldGhvZEFyZ3VtZW50cyhtZXRob2RzW21ldGhvZF0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmKGFyZ3MpIHRoaXMuYXJnc1ttZXRob2RdID0gYXJncztcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyc2VkOiBzdHJpbmcgPSBtZXRob2RzW21ldGhvZF1cclxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLip8W1xcfV0kL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZWQgPSBwYXJzZWQucmVwbGFjZUFsbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCR0aGlzLmRhdGEuJHt2YXJpYWJsZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfS52YWx1ZWAsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuYXJnc1ttZXRob2RdICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXJnc1ttZXRob2RdLmZvckVhY2goKGFyZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RyOiBzdHJpbmcgPSBgKD88PSg9XFxcXHMpfChcXFxcKCl8KD0pKSgke2FyZ30pYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkID0gcGFyc2VkLnJlcGxhY2UobmV3IFJlZ0V4cChzdHIsIFwiZ1wiKSwgYCRhcmdzLiR7YXJnfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIFwieyR0aGlzID0gdW5kZWZpbmVkLCAkZXZlbnQgPSB1bmRlZmluZWQsICRhcmdzID0gdW5kZWZpbmVkfVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlZCxcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWV0aG9kc1ttZXRob2RdID0gbmV3RnVuYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gbWV0aG9kcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgYWxsIHRoZSBjaGlsZHJlbnMgdGhhdCBoYXZlIGFuIGFjdGlvbiBhbmQgZGF0YVxyXG4gICAgICovXHJcbiAgICBjaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsIHRoZSBlbGVtZW50cyBzdXBwb3J0ZWQgd2l0aCBDaGV2ZXJleFxyXG4gICAgICAgICAqIEBjb25zdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0XHJcbiAgICAgICAgICAgIGV2ZW50Tm9kZXM6IEV2ZW50RWxlbWVudHMgICAgICAgICAgID0gQ2hpbGRzSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhT25BdHRyKHRoaXMuZWxlbWVudCksIFxyXG4gICAgICAgICAgICB0ZXh0Tm9kZXMgICA6IE5vZGVMaXN0T2Y8RWxlbWVudD4gICA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YVRleHRBdHRyKHRoaXMuZWxlbWVudCksXHJcbiAgICAgICAgICAgIG1vZGVsTm9kZXMgIDogTm9kZUxpc3RPZjxFbGVtZW50PiAgID0gQ2hpbGRzSGVscGVyLmdldEVsZW1lbnRzQnlEYXRhTW9kZWxBdHRyKHRoaXMuZWxlbWVudCksXHJcbiAgICAgICAgICAgIGxvb3BOb2RlcyAgIDogTm9kZUxpc3RPZjxIVE1MVGVtcGxhdGVFbGVtZW50PiA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YUZvcih0aGlzLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICAvL0V2ZW50Tm9kZXNcclxuICAgICAgICBpZiAoZXZlbnROb2Rlcykge1xyXG4gICAgICAgICAgICBldmVudE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImV2ZW50XCJdLnB1c2gobmV3IEV2ZW50Tm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogbm9kZVswXSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG5vZGVbMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0clZhbDogbm9kZVsyXSxcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy9EYXRhLXRleHRcclxuICAgICAgICBpZiAodGV4dE5vZGVzKSB7XHJcbiAgICAgICAgICAgIHRleHROb2Rlcy5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0ucHVzaChuZXcgVGV4dEFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogdGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vVGV4dCBJbnB1dHMgd2l0aCBtb2RlbFxyXG4gICAgICAgIGlmIChtb2RlbE5vZGVzKSB7XHJcbiAgICAgICAgICAgIG1vZGVsTm9kZXMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl0ucHVzaChuZXcgSW5wdXRBY3Rpb24oe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGlucHV0LFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy9Gb3Igbm9kZXNcclxuICAgICAgICBpZiAobG9vcE5vZGVzKSB7XHJcbiAgICAgICAgICAgIGxvb3BOb2Rlcy5mb3JFYWNoKChsb29wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLWZvclwiXS5wdXNoKG5ldyBMb29wTm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogbG9vcCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXNcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBwYXJzZWQgZGF0YSwgd2l0aCB0aGUgZ2V0dGVyIGFuZCBzZXR0ZXJcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBvZiB0aGUgdW5wYXJzZWQgZGF0YSBvYmplY3RcclxuICAgICAqIEBwYXJhbSB7YW55fSB2YWx1ZSB0aGUgdmFsdWUgb2YgdGhhdCBwcm9wZXJ0eVxyXG4gICAgICogQHJldHVybnMgVGhlIHBhcnNlZCBkYXRhXHJcbiAgICAgKi9cclxuICAgIHBhcnNlZE9iaihuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBQYXJzZWREYXRhIHtcclxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbm9tYnJlOiBuYW1lLFxyXG4gICAgICAgICAgICBfdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy9UaGVyZSdzIGEgd2VpcmQgZGVsYXkgd2hlbiB5b3UgdHJ5IHRvIHN5bmMgYWxsIGlucHV0cywgSSBkb24ndCBrbm93IHdoeVxyXG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2hpbGRzIVtcImRhdGEtdGV4dFwiXS5maWx0ZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh0ZXh0KSA9PiB0ZXh0Ll92YXJpYWJsZS5ub21icmUgPT0gdGhpcy5ub21icmUsXHJcbiAgICAgICAgICAgICAgICAgICAgKS5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQuc2V0VGV4dCh0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TeW5jIHRleHQgd2l0aCBhbGwgaW5wdXRzIHRoYXQgaGF2ZSB0aGlzIHZhcmlhYmxlIGFzIG1vZGVsIGluIHRoZWlyICdkYXRhLW1vZGVsJyBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgICAgIHNlbGYuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl0uZmlsdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgIChpbnB1dCkgPT4gaW5wdXQudmFyaWFibGUgPT0gdGhpcy5ub21icmUsXHJcbiAgICAgICAgICAgICAgICApLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQuYXNzaWduVGV4dCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQgdmFsdWUoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIGN1c3RvbSBldmVudCBpbiB0aGUgc2NvcGUgb2YgdGhlIGRhdGEtYXR0YWNoZWRcclxuICAgICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdHlwZSwgdGhlIGVsZW1lbnQsIGFuZCB0aGUgZnVuY3Rpb24gd2l0aG91dCBleGVjdXRpbmdcclxuICAgICAqL1xyXG4gICAgc2V0RXZlbnQoZXZlbnQ6IENoZXZlcmVFdmVudCkge1xyXG4gICAgICAgIGV2ZW50LmVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudC50eXBlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LmFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgICAgICRhcmdzOiBldmVudC5hcmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZVdpbmRvdywgUGFyc2VkQXJncywgQ2hldmVyZU5vZGVEYXRhIH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xuaW1wb3J0IENoZXZlcmVOb2RlIGZyb20gXCIuL2NoZXZlcmUvQ2hldmVyZU5vZGVcIjtcbmltcG9ydCBDaGV2ZXJlRGF0YSBmcm9tIFwiLi9jaGV2ZXJlL0NoZXZlcmVEYXRhXCI7XG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiLi91dGlscy9IZWxwZXJcIjtcblxuY29uc3QgQ2hldmVyZTogQ2hldmVyZVdpbmRvdyA9IHtcbiAgIG5vZGVzOiBbXSxcbiAgIC8qKlxuICAgICogRmluZCBhIENoZXZlcmVEYXRhIGJ5IHRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtYXR0YWNoZWQnIGF0dHJpYnV0ZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJcbiAgICAqIEBwYXJhbSB7Q2hldmVyZURhdGFbXX0gZGF0YVxuICAgICogQHJldHVybnMgVGhlIGRhdGEgcmVhZHkgZm9yIGluc3RhbmNlIGEgQ2hldmVyZXhOb2RlXG4gICAgKi9cbiAgIGZpbmRJdHNEYXRhKGF0dHI6IHN0cmluZywgZGF0YTogQ2hldmVyZURhdGFbXSk6IENoZXZlcmVEYXRhIHtcbiAgICAgICBsZXQgc2VhcmNoOiBDaGV2ZXJlRGF0YSB8IHVuZGVmaW5lZCA9IGRhdGEuZmluZChcbiAgICAgICAgICAgKGQpID0+IGQubmFtZSA9PSBhdHRyLnJlcGxhY2UoL1xcKC4qXFwpLywgXCJcIiksXG4gICAgICAgKTtcblxuICAgICAgIGlmIChzZWFyY2ggPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgICAgICBgJyR7YXR0cn0nIGNvdWxkbid0IGJlIGZvdW5kIGluIGFueSBvZiB5b3VyIGRlY2xhcmVkIGNvbXBvbmVudHNgLFxuICAgICAgICAgICApO1xuICAgICAgIGVsc2UgcmV0dXJuIHNlYXJjaDtcbiAgIH0sXG4gICAvKipcbiAgICAqIFNlYXJjaCBmb3IgQ2hldmVyZSBOb2RlcyBhdCB0aGUgc2l0ZVxuICAgICogQHBhcmFtIGRhdGEgQWxsIHRoZSBDaGV2ZXJlIGNvbXBvbmVudHNcbiAgICAqL1xuICAgc3RhcnQoLi4uZGF0YTogQ2hldmVyZURhdGFbXSk6IHZvaWQge1xuICAgICAgIGxldCBbLi4ucHJvcHNdID0gZGF0YTtcbiAgICAgICBjb25zdCBlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PiA9XG4gICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZbZGF0YS1hdHRhY2hlZF1cIik7XG5cbiAgICAgICAvL0NyZWF0ZSBhIENoZXZlcmVOb2RlIGZvciBlYWNoIGRhdGEtYXR0YWNoZWRcbiAgICAgICBlbGVtZW50cy5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICBsZXQgZGF0YUF0dGFjaGVkQXR0cjogc3RyaW5nID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1hdHRhY2hlZFwiKSE7XG5cbiAgICAgICAgICAgY29uc3QgZ2V0RGF0YTogQ2hldmVyZURhdGEgPSB0aGlzLmZpbmRJdHNEYXRhKGRhdGFBdHRhY2hlZEF0dHIsIHByb3BzKTtcblxuICAgICAgICAgICBpZigoZ2V0RGF0YS5pbml0ID09IHVuZGVmaW5lZCkgJiYgKEhlbHBlci5odG1sQXJnc0RhdGFBdHRyKGRhdGFBdHRhY2hlZEF0dHIpICE9IHVuZGVmaW5lZCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSdzIG5vIGluaXQgbWV0aG9kIGRlZmluZWQgaW4geW91ciAnJHtnZXREYXRhLm5hbWV9JyBjb21wb25lbnRgKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgLy9JZiB0aGUgaW5pdCBtZXRob2QgaXNuJ3QgdW5kZWZpbmVkXG4gICAgICAgICAgIGlmKGdldERhdGEuaW5pdCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgIC8vQ2hlY2sgZm9yIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgbGV0IGluaXRBcmdzOiBQYXJzZWRBcmdzID0gSGVscGVyLm1ldGhvZEFyZ3VtZW50cyhnZXREYXRhLmluaXQpO1xuICAgICAgICAgICAgICAgbGV0IEhUTUxBcmdzOiBQYXJzZWRBcmdzID0gSGVscGVyLmh0bWxBcmdzRGF0YUF0dHIoZGF0YUF0dGFjaGVkQXR0cik7XG5cbiAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICogQ2hlY2sgdGhlIGRpZmYgYmV0d2VlbiB0aGUgYXJ1bWVudHMgYXQgdGhlIEhUTUwgYW5kIHRob3NlIG9uZXMgZGVjbGFyZWQgYXQgXG4gICAgICAgICAgICAgICAgKiB0aGUgaW5pdCgpIG1ldGhvZFxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICBsZXQgY2hlY2tGb3JJbml0QXJndW1lbnRzOiBib29sZWFuID0gSGVscGVyLmNvbXBhcmVBcmd1bWVudHMoe1xuICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogZ2V0RGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJpbml0KClcIixcbiAgICAgICAgICAgICAgICAgICBodG1sQXJnczogSFRNTEFyZ3MsXG4gICAgICAgICAgICAgICAgICAgbWV0aG9kQXJnczogaW5pdEFyZ3NcbiAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAvL0lmIHRoZXJlJ3Mgbm8gZXJyb3JzLCBwYXJzZSB0aGUgYXJndW1lbnRzLCBhbmQgZXhlY3V0ZSB0aGUgaW5pdCgpIG1ldGhvZFxuICAgICAgICAgICAgICAgaWYoY2hlY2tGb3JJbml0QXJndW1lbnRzKSBnZXREYXRhLnBhcnNlQXJndW1lbnRzKEhUTUxBcmdzISwgaW5pdEFyZ3MhKTtcbiAgICAgICAgICAgICAgIGVsc2UgZ2V0RGF0YS5wYXJzZUluaXQoe1xuICAgICAgICAgICAgICAgICAgIGluaXQ6IGdldERhdGEuaW5pdFxuICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgIH07XG4gICAgICAgXG4gICAgICAgICAgIGxldCBub2RlID0gbmV3IENoZXZlcmVOb2RlKGdldERhdGEsIGVsKTtcblxuICAgICAgICAgICB0aGlzLm5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgfSk7XG4gICB9LFxuICAgZGF0YShkYXRhOiBDaGV2ZXJlTm9kZURhdGEpOiBDaGV2ZXJlRGF0YSB7XG4gICAgICAgcmV0dXJuIG5ldyBDaGV2ZXJlRGF0YShkYXRhKTtcbiAgIH0sXG59O1xuXG53aW5kb3cuQ2hldmVyZSA9IENoZXZlcmU7IiwiaW1wb3J0IHsgRXZlbnRFbGVtZW50cyB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcblxyXG5jb25zdCBDaGlsZHNIZWxwZXIgPSB7XHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YU9uQXR0cihlbGVtZW50OiBFbGVtZW50KTogRXZlbnRFbGVtZW50cyB7XHJcbiAgICAgICAgbGV0IG5vZGVzOiBFdmVudEVsZW1lbnRzID0gW107XHJcblxyXG4gICAgICAgIC8vR2V0IGFsbCBjaGlsZHMgb2YgdGhlIGVsZW1lbnRcclxuICAgICAgICBjb25zdCBjaGlsZHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpO1xyXG5cclxuICAgICAgICAvL1B1c2ggdG8gYG5vZGVzYCBhbGwgZWxlbWVudHMgd2l0aCB0aGUgJ2RhdGEtb24nIG9yICdAb24nIGF0dHJpYnV0ZVxyXG4gICAgICAgIGZvcihsZXQgY2hpbGQgb2YgY2hpbGRzKSB7XHJcbiAgICAgICAgICAgIGZvcihsZXQgYXR0ciBvZiBjaGlsZC5hdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZihhdHRyLm5hbWUuc3RhcnRzV2l0aChcImRhdGEtb25cIikpIFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goW2NoaWxkLCBhdHRyLm5hbWUuc3BsaXQoXCI6XCIpWzFdLCBhdHRyLm5vZGVWYWx1ZSFdKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJAb25cIikpIFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goW2NoaWxkLCBhdHRyLm5hbWUucmVwbGFjZShcIkBvblwiLCBcIlwiKS50b0xvd2VyQ2FzZSgpLCBhdHRyLm5vZGVWYWx1ZSFdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gKG5vZGVzLmxlbmd0aCA9PSAwKSA/IHVuZGVmaW5lZCA6IG5vZGVzO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhVGV4dEF0dHIoZWxlbWVudDogRWxlbWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqW2RhdGEtdGV4dF1cIik7XHJcbiAgICB9LFxyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFNb2RlbEF0dHIoZWxlbWVudDogRWxlbWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFtkYXRhLW1vZGVsXSwgdGV4dGFyZWFbZGF0YS1tb2RlbF0sIHNlbGVjdFtkYXRhLW1vZGVsXVwiKTtcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YUZvcihlbGVtZW50OiBFbGVtZW50KTogTm9kZUxpc3RPZjxIVE1MVGVtcGxhdGVFbGVtZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2RhdGEtZm9yXVwiKTtcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YVNob3coZWxlbWVudDogRWxlbWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqW2RhdGEtc2hvd11cIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDaGlsZHNIZWxwZXI7IiwiaW1wb3J0IHsgQXJnc0Vycm9ycywgQ29tcGFyZUFyZ3VtZW50cywgUGFyc2VkQXJncyB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcbi8qKlxyXG4gKiBIZWxwZXIgY2xhc3MsIGl0IHByb3ZpZGUgdXNlZnVsbCBtZXRob2RzIHRvIENoZXZlcmUgZWxlbWVudHNcclxuICogQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgSGVscGVyID0ge1xyXG4gICAgaXNFbXB0eShvYmo6IG9iamVjdCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PSAwO1xyXG4gICAgfSxcclxuICAgIHNldERhdGFJZChsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGZpbmFsOiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgICAgICBjb25zdCByb3VuZGVkOiBGdW5jdGlvbiA9IChudW06IG51bWJlcik6IG51bWJlciA9PiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBudW0pO1xyXG5cclxuICAgICAgICBjb25zdCBjaGFyczogeyBbdHlwZTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XHJcbiAgICAgICAgICAgIGxldHRlcnMgOiBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCIsXHJcbiAgICAgICAgICAgIG1heXVzICAgOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXHJcbiAgICAgICAgICAgIG51bWJlcnMgOiBcIjAxMjM0NTY3ODlcIixcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcmtleTogc3RyaW5nID0gT2JqZWN0LmtleXMoY2hhcnMpW3JvdW5kZWQoMildO1xyXG4gICAgICAgICAgICBmaW5hbCArPSBjaGFyc1tya2V5XVtyb3VuZGVkKGxlbmd0aCldO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZpbmFsO1xyXG4gICAgfSxcclxuICAgIGNoZWNrRm9yRXJyb3JJblZhcmlhYmxlKHN0cjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcGF0dGVybjogUmVnRXhwID0gL15bMC05XXxcXHMvZztcclxuXHJcbiAgICAgICAgaWYgKHBhdHRlcm4udGVzdChzdHIpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXHJcbiAgICAgICAgICAgICAgICBcIlZhcmlhYmxlIG5hbWUgY2Fubm90IHN0YXJ0IHdpdGggYSBudW1iZXIgb3IgaGF2ZSBzcGFjZXNcIixcclxuICAgICAgICAgICAgKTtcclxuICAgIH0sXHJcbiAgICBodG1sQXJnc0RhdGFBdHRyKGRhdGFBdHRhY2hlZDogc3RyaW5nKTogUGFyc2VkQXJncyB7XHJcbiAgICAgICAgaWYoIWRhdGFBdHRhY2hlZC5tYXRjaCgvXFwoLisvKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgb25seUF0dHJzOiBzdHJpbmcgPSBkYXRhQXR0YWNoZWQucmVwbGFjZSgvXihcXHcrXFwoKXxcXCkrJC9nLCBcIlwiKS5yZXBsYWNlKFwiIFwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChvbmx5QXR0cnMpID8gb25seUF0dHJzLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICBtZXRob2RBcmd1bWVudHMobWV0aG9kOiBGdW5jdGlvbik6IFBhcnNlZEFyZ3Mge1xyXG4gICAgICAgIGxldCBvbmx5QXJnczogc3RyaW5nID0gbWV0aG9kLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcey4qL2dzLCBcIlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxzL2csIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eKFxcdytcXCgpfFxcKSskL2csIFwiXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gKG9ubHlBcmdzKSA/IG9ubHlBcmdzLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZDsgICAgICAgICAgICBcclxuICAgIH0sXHJcbiAgICBnZXRSZWFsVmFsdWVzSW5Bcmd1bWVudHMoZGF0YTogQXJnc0Vycm9ycyk6IGFueVtdIHtcclxuICAgICAgICBsZXQgZmluYWw6IGFueVtdID0gZGF0YS5hcmdzLm1hcCgoYXJnKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAvL1RyeSBnZXQgYSB2YWxpZCB2YWx1ZVxyXG4gICAgICAgICAgICBjb25zdCBmdW5jOiBGdW5jdGlvbiA9ICgpOiBGdW5jdGlvbiA9PiBuZXcgRnVuY3Rpb24oYHJldHVybiAke2FyZ31gKTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmdW5jKCkoKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICAgICBgJHtlcnJvcn0sIGNoZWNrIHRoZSB2YWx1ZXMgb2YgeW91ciAke2RhdGEubWV0aG9kfSwgYXQgb25lIG9mIHlvdXIgJyR7ZGF0YS5uYW1lfScgY29tcG9uZW50c2AsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1JldHVybiB0aGUgdmFsdWVcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmMoKSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9LFxyXG4gICAgY29tcGFyZUFyZ3VtZW50cyhkYXRhOiBDb21wYXJlQXJndW1lbnRzKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGVycm9yUHJlOiBzdHJpbmcgPSBgVGhlICR7ZGF0YS5tZXRob2R9IGZ1bmN0aW9uIG9mIHRoZSAke2RhdGEuY29tcG9uZW50fSgpIGNvbXBvbmVudCBgOyAgICAgICAgXHJcblxyXG4gICAgICAgIHN3aXRjaCh0cnVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgKCghZGF0YS5odG1sQXJncykgJiYgKCFkYXRhLm1ldGhvZEFyZ3MpKToge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoZGF0YS5odG1sQXJncyAhPSB1bmRlZmluZWQpICYmICghZGF0YS5tZXRob2RBcmdzKSk6IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclByZSArIGBkb2Vzbid0IHJlY2VpdmUgYW55IHBhcmFtZXRlcmApO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoIWRhdGEuaHRtbEFyZ3MpICYmIChkYXRhLm1ldGhvZEFyZ3MgIT0gdW5kZWZpbmVkKSk6IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclByZSArIGBuZWVkcyB0byByZWNlaXZlICR7ZGF0YS5tZXRob2RBcmdzfSBwYXJhbWV0ZXJzLCAwIHBhc3NlZGApO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoZGF0YS5tZXRob2RBcmdzPy5sZW5ndGgpICE9IChkYXRhLmh0bWxBcmdzPy5sZW5ndGgpKToge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yUHJlICsgYG5lZWRzIHRvIHJlY2VpdmUgICR7ZGF0YS5tZXRob2RBcmdzPy5sZW5ndGh9IHBhcmFtZXRlcnMsIFxyXG4gICAgICAgICAgICAgICAgICAgICR7ZGF0YS5odG1sQXJncz8ubGVuZ3RofSBwYXNzZWRgKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb250ZW50T2ZGdW5jdGlvbihmdW5jOiBGdW5jdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmMudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvKF5cXHcuKlxceykvZ3MsIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXH0kLywgXCJcIilcclxuICAgICAgICAgICAgLnRyaW0oKTtcclxuICAgIH1cclxufTtcclxuIiwiaW1wb3J0IENoZXZlcmVOb2RlIGZyb20gXCIuLi9jaGV2ZXJlL0NoZXZlcmVOb2RlXCI7XHJcbmltcG9ydCB7IElubGluZVBhcnNlciwgUGFyc2VkRm9yIH0gZnJvbSBcIi4uL2ludGVyZmFjZXNcIjtcclxuXHJcbmNvbnN0IFBhcnNlcjogSW5saW5lUGFyc2VyID0ge1xyXG4gICAgcGF0dGVybnM6IHtcclxuICAgICAgICB2YXJpYWJsZUV4cHJlc3Npb246IC9eXFx3K3xcXDxcXD18XFw+XFw9fFxcPXxcXDx8XFw+fFxcIVthLXpBLXpdK3xbYS16QS1aXSsvLFxyXG4gICAgICAgIGZvckluRXhwcmVzc2lvbjogL15cXHcrfChpbil8XFx3KyQvZyxcclxuICAgIH0sXHJcbiAgICBwYXJzZURhdGFGb3JBdHRyKGF0dHI6IHN0cmluZywgbm9kZTogQ2hldmVyZU5vZGUpOiBQYXJzZWRGb3Ige1xyXG4gICAgICAgIGxldCBwYXJzZWREYXRhOiBQYXJzZWRGb3IgPSB7fTtcclxuXHJcbiAgICAgICAgbGV0IGV4cHJlc3Npb25zOiBzdHJpbmdbXSA9IGF0dHIuc3BsaXQoXCIgXCIpO1xyXG5cclxuICAgICAgICBpZihleHByZXNzaW9ucy5sZW5ndGggPiAzKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1mb3InIGF0dHJpYnV0ZSBoYXMgaW52YWxpZCBleHByZXNzaW9uc1wiKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdmFyaWFibGUgPSBPYmplY3Qua2V5cyhub2RlLmRhdGEpLmZpbmQoKHZhcmlhYmxlKSA9PiB2YXJpYWJsZSA9PSBleHByZXNzaW9uc1syXSk7XHJcblxyXG4gICAgICAgIGlmKCF2YXJpYWJsZSkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgQSB2YXJpYWJsZSB3aXRoIHRoZSBuYW1lICR7ZXhwcmVzc2lvbnNbMl19IGNvdWxkbid0IGJlIGZvdW5kIGluIHRoZSBkYXRhIG9mIHlvdXIgJHtub2RlLm5hbWV9KCkgY29tcG9uZW50YCk7XHJcbiAgICAgICAgZWxzZSBwYXJzZWREYXRhLnZhcmlhYmxlID0gbm9kZS5kYXRhW3ZhcmlhYmxlXTtcclxuXHJcbiAgICAgICAgcGFyc2VkRGF0YS5jb3VudCA9IG5vZGUuZGF0YVt2YXJpYWJsZV0ubGVuZ3RoIHx8IE9iamVjdC5rZXlzKG5vZGUuZGF0YVt2YXJpYWJsZV0pLmxlbmd0aDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZERhdGE7XHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFyc2VyOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy90cy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==