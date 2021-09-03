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
        let methodName = this.attrVal.trim().replace(/\(.+/, "");
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
        let val = this.attrVal.trim().replace(/\(.+/, ""), method = this.parent.methods[val];
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
        //Set the default value
        this.element.value = this.parent.data[this.variable].value.toString();
        //Add the listener
        this.element.addEventListener("input", this.syncText.bind(this));
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
        this.element.hidden = !(_helpers_1.Parser.parser(`${(typeof this.variable.value == "string") ? (this.variable.value + "") : this.variable.value} ${this.value}`));
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
            "data-show": []
        };
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
            const eventNodes = _helpers_1.ChildsHelper.getElementsByDataOnAttr(this.element), textNodes = _helpers_1.ChildsHelper.getElementsByDataTextAttr(this.element), modelNodes = _helpers_1.ChildsHelper.getElementsByDataModelAttr(this.element), showNodes = _helpers_1.ChildsHelper.getElementsByDataShow(this.element);
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
                //There's a weird delay when you try to sync all inputs, I don't know why
                self.childs["data-text"].filter((text) => text._variable.nombre == this.nombre).forEach((text) => {
                    text.value = value;
                });
                //Sync text with all inputs that have this variable as model in their 'data-model' attribute
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
    },
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
        let onlyAttrs = dataAttached.trim().replace(/.+\(|\).+/g, "");
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
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Parser = void 0;
exports.Parser = {
    patterns: {
        vars: {
            variableExpression: /^[a-zA-Z]+(\s|<|>|!)?=(\s)?/g,
            variableName: /^[a-zA-Z]+/,
            equality: /(<|>|!)?={1,3}/g,
            string: /^(\"|\')\w.+\1$/g,
            number: /^(\-)?[0-9]+(\.)?[0-9]+$/g,
            boolean: /true|false$/g,
            value: /^.*=/g,
        },
        text: {
            justVariable: /^[a-zA-Z]+$/,
            singleObject: /^[a-zA-Z]+((\.[a-zA-z]*)|(\[[0-9]{1,}\]))$/,
            nestedObject: /^[a-zA-Z]+((\.|\[)[a-zA-Z0-9]+(\.|\])?){1,}[a-zA-z]$/
        },
        show: {
            true: /^[a-zA-Z]+$/,
            false: /^\![a-zA-Z]+$/,
        }
    },
    parser(expr) {
        return new Function(`return ${expr}`)();
    },
    parsedDataShowAttr(data) {
        let val = (this.patterns.vars.variableExpression.test(data.attr))
            ? data.attr.replace(this.patterns.vars.value, "").trim()
            : Object.entries(this.patterns.show).find(([, regexp]) => regexp.test(data.attr))[0];
        let parse = `${((this.patterns.vars.equality.exec(data.attr)) || ["=="])[0]} ${val}`;
        if (!parse)
            throw new SyntaxError("The value of the 'data-show' attribute contains invalid expressions");
        const varName = data.attr.match(/\w+/)[0], parentVar = data.node.data[varName];
        if (!parentVar)
            throw new ReferenceError(`A data with the '${varName}' couldn't be found in the '${data.node.name}'`);
        return {
            variable: parentVar,
            value: parse,
        };
    },
    parseDataTextAttr(data) {
        let type = Object.keys(this.patterns.text)
            .find((pattern) => this.patterns.text[pattern].test(data.attr));
        if (!type)
            throw new SyntaxError("The value of the 'data-text' attribute contains invalid expressions");
        const varName = this.patterns.text.justVariable.exec(data.attr)[0];
        let parsed = { variable: data.node.data[varName] };
        switch (type) {
            case "justVariable":
                {
                    parsed.value = parsed.variable.value;
                }
                break;
            case "singleObject":
                {
                    parsed.value = parsed.variable.value[data.attr.match(this.patterns.text.indexValue)[0]];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJLHNCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNILENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9FdmVudE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL0xvb3BOb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9Nb2RlbE5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9hY3Rpb25zL1Nob3dOb2RlLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvYWN0aW9ucy9UZXh0Tm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2FjdGlvbnMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9jaGV2ZXJlL0NoZXZlcmVEYXRhLnRzIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvY2hldmVyZS9DaGV2ZXJlTm9kZS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9DaGlsZHNIZWxwZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9IZWxwZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9JbmxpbmVQYXJzZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy91dGlscy9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRDaGlsZCwgUGFyc2VkQXJncywgQXJndW1lbnRzT2JqZWN0LCBBcmd1bWVudHMgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgQ2hldmVyZU5vZGUgfSBmcm9tIFwiQGNoZXZlcmVcIjtcclxuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRXZlbnROb2RlIGltcGxlbWVudHMgRXZlbnRDaGlsZCB7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIG1ldGhvZD86IEZ1bmN0aW9uO1xyXG4gICAgZXZlbnQ6IHN0cmluZztcclxuICAgIGF0dHJWYWw6IHN0cmluZztcclxuICAgIGFyZ3M/OiB7fTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBFdmVudENoaWxkKSB7XHJcbiAgICAgICAgKHtcclxuICAgICAgICAgICAgZWxlbWVudCA6IHRoaXMuZWxlbWVudCwgXHJcbiAgICAgICAgICAgIGV2ZW50ICAgOiB0aGlzLmV2ZW50LCBcclxuICAgICAgICAgICAgYXR0clZhbCA6IHRoaXMuYXR0clZhbCwgXHJcbiAgICAgICAgICAgIHBhcmVudCAgOiB0aGlzLnBhcmVudFxyXG4gICAgICAgIH0gPSBkYXRhKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0dpdmUgaXQgYW4gSUQgZm9yIHRoZSBlbGVtZW50XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldERhdGFJZCgxMCkpO1xyXG5cclxuICAgICAgICAvL1NlYXJjaCBtZXRob2QgYW5kIGNoZWNrIGlmIGl0IGhhcyBhcmd1bWVudHNcclxuICAgICAgICB0aGlzLm1ldGhvZCA9IHRoaXMuc2VhcmNoTWV0aG9kKCk7XHJcbiAgICAgICAgdGhpcy5hcmdzID0gdGhpcy5maW5kQXJndW1lbnRzKCk7XHJcblxyXG4gICAgICAgIC8vSWYgZXZlcnl0aGluZyBpcyBvaywgdGhlbiBzZXQgdGhlIEV2ZW50XHJcbiAgICAgICAgdGhpcy5wYXJlbnQ/LnNldEV2ZW50KHtcclxuICAgICAgICAgICAgZWxlbTogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICBhY3Rpb246IHRoaXMubWV0aG9kISxcclxuICAgICAgICAgICAgdHlwZTogdGhpcy5ldmVudCxcclxuICAgICAgICAgICAgYXJnczogdGhpcy5hcmdzXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZmluZEFyZ3VtZW50cygpOiBBcmd1bWVudHNPYmplY3R8dW5kZWZpbmVkIHtcclxuICAgICAgICBsZXQgbWV0aG9kTmFtZTogc3RyaW5nID0gdGhpcy5hdHRyVmFsLnRyaW0oKS5yZXBsYWNlKC9cXCguKy8sIFwiXCIpO1xyXG5cclxuICAgICAgICBpZigoIXRoaXMucGFyZW50LmFyZ3NbbWV0aG9kTmFtZV0pIHx8IChIZWxwZXIuaXNFbXB0eSh0aGlzLnBhcmVudC5hcmdzW21ldGhvZE5hbWVdISkpKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vVGhlIGFyZ3NcclxuICAgICAgICBjb25zdCBhcmdzOiBBcmd1bWVudHMgPSB7XHJcbiAgICAgICAgICAgIGh0bWxBcmdzOiBIZWxwZXIuaHRtbEFyZ3NEYXRhQXR0cih0aGlzLmF0dHJWYWwpLFxyXG4gICAgICAgICAgICBwYXJlbnRBcmdzOiB0aGlzLnBhcmVudC5hcmdzW21ldGhvZE5hbWVdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy9DaGVjayBmb3IgZXJyb3JzIGluIHRoZSBhcmdtZW50c1xyXG4gICAgICAgIEhlbHBlci5jb21wYXJlQXJndW1lbnRzKHtcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2ROYW1lLFxyXG4gICAgICAgICAgICBjb21wb25lbnQ6IHRoaXMucGFyZW50Lm5hbWUsXHJcbiAgICAgICAgICAgIGh0bWxBcmdzOiBhcmdzLmh0bWxBcmdzLFxyXG4gICAgICAgICAgICBtZXRob2RBcmdzOiBhcmdzLnBhcmVudEFyZ3MsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBmaW5hbDogYW55W10gPSBIZWxwZXIuZ2V0UmVhbFZhbHVlc0luQXJndW1lbnRzKHtcclxuICAgICAgICAgICAgYXJnczogYXJncy5odG1sQXJncyBhcyBzdHJpbmdbXSxcclxuICAgICAgICAgICAgbmFtZTogdGhpcy5wYXJlbnQubmFtZSxcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2ROYW1lXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vQ3JlYXRlIHRoZSBhcmd1bWVudCBvYmplY3RcclxuICAgICAgICBsZXQgYXJnc09iajogQXJndW1lbnRzT2JqZWN0ID0ge307XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSBpbiBhcmdzLnBhcmVudEFyZ3MpIGFyZ3NPYmpbYXJncy5wYXJlbnRBcmdzWysoaSldXSA9IGZpbmFsWysoaSldO1xyXG5cclxuICAgICAgICByZXR1cm4gYXJnc09iajtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2VhcmNoTWV0aG9kKCk6IEZ1bmN0aW9uIHtcclxuICAgICAgICBsZXQgdmFsICAgICA6IHN0cmluZyA9IHRoaXMuYXR0clZhbC50cmltKCkucmVwbGFjZSgvXFwoLisvLCBcIlwiKSxcclxuICAgICAgICAgICAgbWV0aG9kICA6IEZ1bmN0aW9uID0gdGhpcy5wYXJlbnQubWV0aG9kcyFbdmFsXTtcclxuXHJcbiAgICAgICAgaWYoIW1ldGhvZCkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlcmUncyBubyBhIG1ldGhvZCBuYW1lZCAnJHt2YWx9JyBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWApO1xyXG5cclxuICAgICAgICByZXR1cm4gbWV0aG9kO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtDaGV2ZXJlTm9kZX0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcbmltcG9ydCB7IExvb3BFbGVtZW50LCBQYXJzZWREYXRhLCBQYXJzZWRGb3IgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgVGV4dE5vZGUgfSBmcm9tIFwiLi9UZXh0Tm9kZVwiO1xyXG5pbXBvcnQgeyBQYXJzZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBMb29wTm9kZSBpbXBsZW1lbnRzIExvb3BFbGVtZW50IHtcclxuICAgIGVsZW1lbnQ6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XHJcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xyXG4gICAgdmFyaWFibGU6IFBhcnNlZERhdGE7XHJcbiAgICBleHByZXNzaW9ucz86IHN0cmluZ1tdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IExvb3BFbGVtZW50KSB7XHJcbiAgICAgICAgKHsgZWxlbWVudDogdGhpcy5lbGVtZW50LCBwYXJlbnQ6IHRoaXMucGFyZW50IH0gPSBkYXRhKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyc2VkOiBQYXJzZWRGb3IgPSBQYXJzZXIucGFyc2VEYXRhRm9yQXR0cih7XHJcbiAgICAgICAgICAgIGF0dHI6IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZvclwiKSEsIFxyXG4gICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAoeyBleHByZXNzaW9uczogdGhpcy5leHByZXNzaW9ucywgdmFyaWFibGU6IHRoaXMudmFyaWFibGUgfSA9IHBhcnNlZCk7XHJcblxyXG4gICAgICAgIGlmKHR5cGVvZiB0aGlzLnZhcmlhYmxlLnZhbHVlID09IFwic3RyaW5nXCIpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXZhbEVycm9yKGBDYW5ub3Qgc2V0IGEgJ2Zvci4uaW4nIGxvb3AgaW4gdHlwZSAke3R5cGVvZiB0aGlzLnZhcmlhYmxlLnZhbHVlfWApOyAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMubG9vcEVsZW1lbnRzKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxvb3BFbGVtZW50cygpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSBBcnJheS5mcm9tKHRoaXMucGFyZW50LmVsZW1lbnQuY2hpbGRyZW4pLmluZGV4T2YodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGU6IERvY3VtZW50RnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQuY29udGVudC5xdWVyeVNlbGVjdG9yKFwiZGl2OmZpcnN0LWNoaWxkXCIpO1xyXG5cclxuICAgICAgICBpZighZWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGZpcnN0IGNoaWxkIG9mIHlvdXIgZGF0YS1mb3IgZWxlbWVudCBtdXN0IGJlIGEgZGl2IGVsZW1lbnRcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IHRoaXNDaGlsZHMgPSBbLi4uZWxlbWVudCEucXVlcnlTZWxlY3RvckFsbChcIipbZGF0YS10ZXh0XVwiKV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IExvb3BUZXh0ID0gdGhpc0NoaWxkc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChjaGlsZCkgPT4gY2hpbGQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpPy5zdGFydHNXaXRoKHRoaXMuZXhwcmVzc2lvbnMhWzBdKSk7XHJcblxyXG4gICAgICAgIExvb3BUZXh0LmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIiwgXHJcbiAgICAgICAgICAgIGAke3RoaXMudmFyaWFibGUubm9tYnJlfVtdYCArIGVsLmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8ucmVwbGFjZSh0aGlzLmV4cHJlc3Npb25zIVswXSwgXCJcIikhKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpIGluIHRoaXMudmFyaWFibGUudmFsdWUpIHtcclxuICAgICAgICAgICAgTG9vcFRleHRcclxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhdHRyVmFsOiBzdHJpbmcgPSAoKyhpKSA9PSAwKSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBlbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKT8ucmVwbGFjZShcIltdXCIgLCBgWyR7aX1dYCkhIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpPy5yZXBsYWNlKC9cXFtbMC05XStcXF0vLCBgWyR7aX1dYCkhXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIiwgYXR0clZhbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmNoaWxkcyFbXCJkYXRhLXRleHRcIl0ucHVzaChuZXcgVGV4dE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0ZW1wbGF0ZS5hcHBlbmRDaGlsZChkb2N1bWVudC5pbXBvcnROb2RlKGVsZW1lbnQsIHRydWUpKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFyZW50LmVsZW1lbnQucHJlcGVuZCh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50LmNhblNldCA9IHRydWU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZSB9IGZyb20gXCJAY2hldmVyZVwiO1xuaW1wb3J0IHsgSW5wdXRNb2RlbCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XG5cbi8qKlxuICogVGhlIGNsYXNzIGZvciB0aG9zZSBpbnB1dHMgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBgZGF0YS1tb2RlbGAgYXR0cmlidXRlXG4gKiAgQGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2RlbE5vZGUgaW1wbGVtZW50cyBJbnB1dE1vZGVsIHtcbiAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50O1xuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XG4gICAgdmFyaWFibGU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGlucHV0OiBJbnB1dE1vZGVsKSB7XG4gICAgICAgICh7IHBhcmVudDogdGhpcy5wYXJlbnQsIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCB9ID0gaW5wdXQpO1xuXG4gICAgICAgIC8vU2VhcmNoIGlmIHRoZSBpbmRpY2F0ZWQgdmFyaWFibGUgb2YgdGhlIGRhdGEtbW9kZWwgYXR0cmlidXRlIGV4aXN0cyBpbiB0aGUgc2NvcGVcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZ2V0VmFyaWFibGUoKTtcblxuICAgICAgICAvL1NldCB0aGUgZGVmYXVsdCB2YWx1ZVxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdLnZhbHVlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgLy9BZGQgdGhlIGxpc3RlbmVyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGhpcy5zeW5jVGV4dC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhc3NpZ25UZXh0KHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzeW5jVGV4dCgpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZSA9IHRoaXMuZWxlbWVudC52YWx1ZS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGdldFZhcmlhYmxlKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBhdHRyID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtbW9kZWxcIikhO1xuXG4gICAgICAgIEhlbHBlci5jaGVja0ZvckVycm9ySW5WYXJpYWJsZShhdHRyKTtcblxuICAgICAgICBsZXQgdmFyaWFibGUgPSBPYmplY3Qua2V5cyh0aGlzLnBhcmVudC5kYXRhKS5maW5kKChkYXRhKSA9PiBkYXRhID09IGF0dHIpO1xuXG4gICAgICAgIGlmICghdmFyaWFibGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgICAgICAgYFRoZXJlJ3Mgbm8gYSAnJHthdHRyfScgdmFyaWFibGUgaW4gdGhlIGRhdGEtYXR0YWNoZWQgc2NvcGVgLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdmFyaWFibGU7XG4gICAgfVxufSIsImltcG9ydCB7IENoZXZlcmVOb2RlIH0gZnJvbSBcIkBjaGV2ZXJlXCI7XHJcbmltcG9ydCB7IFBhcnNlciB9IGZyb20gXCJAaGVscGVyc1wiO1xyXG5pbXBvcnQgeyBQYXJzZWREYXRhLCBQYXJzZWRTaG93LCBTaG93Q2hpbGQgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBTaG93Tm9kZSBpbXBsZW1lbnRzIFNob3dDaGlsZCB7XHJcbiAgICBlbGVtZW50IDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwYXJlbnQgIDogQ2hldmVyZU5vZGU7XHJcbiAgICB2YXJpYWJsZTogUGFyc2VkRGF0YTtcclxuICAgIHZhbHVlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogU2hvd0NoaWxkKSB7XHJcbiAgICAgICAgKHsgZWxlbWVudCA6IHRoaXMuZWxlbWVudCwgIHBhcmVudCAgOiB0aGlzLnBhcmVudCB9ID0gZGF0YSk7XHJcblxyXG4gICAgICAgIGxldCBwYXJzZWRBdHRyOiBQYXJzZWRTaG93ID0gUGFyc2VyLnBhcnNlZERhdGFTaG93QXR0cih7XHJcbiAgICAgICAgICAgIGF0dHI6IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNob3dcIikhLFxyXG4gICAgICAgICAgICBub2RlOiB0aGlzLnBhcmVudFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAoeyB2YWx1ZTogdGhpcy52YWx1ZSwgdmFyaWFibGU6IHRoaXMudmFyaWFibGUgfSA9IHBhcnNlZEF0dHIpO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZUhpZGRlbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0b2dnbGVIaWRkZW4oKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmhpZGRlbiA9ICEoUGFyc2VyLnBhcnNlcihgJHsodHlwZW9mIHRoaXMudmFyaWFibGUudmFsdWUgPT0gXCJzdHJpbmdcIikgPyAodGhpcy52YXJpYWJsZS52YWx1ZSArIFwiXCIpIDogdGhpcy52YXJpYWJsZS52YWx1ZX0gJHt0aGlzLnZhbHVlfWApKTtcclxuICAgIH1cclxufTsiLCJcclxuaW1wb3J0IHsgVGV4dFJlbGF0aW9uLCB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQge0NoZXZlcmVOb2RlfSBmcm9tIFwiQGNoZXZlcmVcIjtcclxuaW1wb3J0IHsgSGVscGVyLCBQYXJzZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUZXh0Tm9kZSBpbXBsZW1lbnRzIFRleHRSZWxhdGlvbiB7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIF92YXJpYWJsZT86IGFueTtcclxuICAgIF92YWx1ZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IFRleHRSZWxhdGlvbikge1xyXG4gICAgICAgICh7IGVsZW1lbnQ6IHRoaXMuZWxlbWVudCwgcGFyZW50OiB0aGlzLnBhcmVudCB9ID0gZGF0YSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldERhdGFJZCgxMCkpO1xyXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpITtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuX3ZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFyaWFibGUoYXR0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgSGVscGVyLmNoZWNrRm9yRXJyb3JJblZhcmlhYmxlKGF0dHIpO1xyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0gUGFyc2VyLnBhcnNlRGF0YVRleHRBdHRyKHtcclxuICAgICAgICAgICAgYXR0cjogYXR0ciwgXHJcbiAgICAgICAgICAgIG5vZGU6IHRoaXMucGFyZW50XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICh7dmFyaWFibGU6IHRoaXMuX3ZhcmlhYmxlLCB2YWx1ZTogdGhpcy52YWx1ZX0gPSBkYXRhKTtcclxuICAgIH1cclxufSIsImV4cG9ydCAqIGZyb20gXCIuL0V2ZW50Tm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Mb29wTm9kZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Nb2RlbE5vZGVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vVGV4dE5vZGVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vU2hvd05vZGVcIjsiLCJpbXBvcnQgeyBDaGV2ZXJlTm9kZURhdGEsIERhdGFUeXBlLCBNZXRob2RUeXBlLCBBcmd1bWVudHNPYmplY3QsIEluaXQgfSBmcm9tIFwiQGludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIkBoZWxwZXJzXCI7XHJcblxyXG4vKipcclxuICogIFRoZSBjbGFzcyB0aGF0IHVzZXJzIGNyZWF0ZSB0aGVpciBjb21wb25lbnRzXHJcbiAqICBAY2xhc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlRGF0YSBpbXBsZW1lbnRzIENoZXZlcmVOb2RlRGF0YSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBkYXRhOiBEYXRhVHlwZTtcclxuICAgIGluaXQ/OiBGdW5jdGlvbjtcclxuICAgIG1ldGhvZHM/OiBNZXRob2RUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVOb2RlRGF0YSkge1xyXG4gICAgICAgICh7IG5hbWU6IHRoaXMubmFtZSwgZGF0YTogdGhpcy5kYXRhLCBpbml0OiB0aGlzLmluaXQsIG1ldGhvZHM6IHRoaXMubWV0aG9kcyB9ID0gZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgYXJndW1lbnRzIG9mIHRoIGluaXQoKSBtZXRob2RcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGh0bWxBcmdzIFRoZSBhcmd1bWVudHMgb2YgZGUgZGF0YS1hdHRhY2hlZCBhdHRyaWJ1dGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGluaXRBcmdzIFRoZSBhcmd1bWVudHMgZGVmaW5lZCBpbiB0aGUgaW5pdCgpIG1ldGhvZFxyXG4gICAgICovXHJcbiAgICBhc3luYyBwYXJzZUFyZ3VtZW50cyhodG1sQXJnczogc3RyaW5nW10sIG1ldGhvZEFyZ3M6IHN0cmluZ1tdKTogUHJvbWlzZTxGdW5jdGlvbj4ge1xyXG5cclxuICAgICAgICAvL0dldCBhIHZhbGlkIHZhbHVlIGZvciB0aGUgYXJndW1lbnQsIGZvciBleGFtcGxlLCBjaGVjayBmb3Igc3RyaW5ncyB3aXRoIHVuY2xvc2VkIHF1b3Rlc1xyXG4gICAgICAgIGxldCBmaW5hbCA9IEhlbHBlci5nZXRSZWFsVmFsdWVzSW5Bcmd1bWVudHMoe1xyXG4gICAgICAgICAgICBhcmdzOiBodG1sQXJncyxcclxuICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiaW5pdCgpXCJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgdGhlIGFyZ3VtZW50IG9iamVjdFxyXG4gICAgICAgIGxldCBhcmdzT2JqOiBBcmd1bWVudHNPYmplY3QgPSB7fTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpIGluIG1ldGhvZEFyZ3MpIGFyZ3NPYmpbbWV0aG9kQXJnc1tpXV0gPSBmaW5hbFtpXTtcclxuXHJcbiAgICAgICAgLy8uLi5hbmQgcGFzcyBpdCB0byB0aGUgdW5wYXJzZWQgaW5pdCBmdW5jdGlvblxyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnBhcnNlSW5pdCh7XHJcbiAgICAgICAgICAgIGluaXQ6IHRoaXMuaW5pdCEsXHJcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3NPYmosXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgaW5pdCBmdW5jdGlvbiBhbmQgZXhlY3V0ZXMgaXRcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGluaXQgVGhlIHVucGFyc2VkIGluaXQgZnVuY3Rpb25cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIFRoZSBwYXJzZWQgY3VzdG9tIGFyZ3VtZW50c1xyXG4gICAgICogQHJldHVybnMgdGhlIGluaXQgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgYXN5bmMgcGFyc2VJbml0KGluaXQ6IEluaXQpOiBQcm9taXNlPEZ1bmN0aW9uPiB7XHJcblxyXG4gICAgICAgIGxldCBpbml0RnVuYzogc3RyaW5nID0gSGVscGVyLmNvbnRlbnRPZkZ1bmN0aW9uKGluaXQuaW5pdCk7XHJcblxyXG4gICAgICAgIC8vRmluZHMgdGhlIHJlYWwgYXJndW1lbnRzIGFuZCBubyBleHByZXNzaW9ucyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAgICBpZiAoaW5pdC5hcmdzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGluaXQuYXJncykuZm9yRWFjaCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RyOiBzdHJpbmcgPSBgKD88PSg9XFxcXHMpfChcXFxcKCl8KD0pKSgke2FyZ30pYDtcclxuICAgICAgICAgICAgICAgIGluaXRGdW5jID0gaW5pdEZ1bmMucmVwbGFjZShuZXcgUmVnRXhwKHN0ciwgXCJnXCIpLCBgJGFyZ3MuJHthcmd9YCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL0NyZWF0ZSB0aGUgbmV3IHBhcnNlZCBpbml0IGZ1bmN0aW9uXHJcbiAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgICAgICBcInskdGhpcyA9IHVuZGVmaW5lZCwgJGFyZ3MgPSB1bmRlZmluZWR9XCIsXHJcbiAgICAgICAgICAgIGByZXR1cm4gYXN5bmMoKSA9PiB7ICR7aW5pdEZ1bmN9IH07YCxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL1JldHVybiB0aGUgbmV3IGluaXQgZnVuY3Rpb24gYW5kIGV4ZWN1dGVzIGl0XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IG5ld0Z1bmMoe1xyXG4gICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgJGFyZ3M6IGluaXQuYXJncyxcclxuICAgICAgICB9KSgpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZUVsZW1lbnQsIE1ldGhvZFR5cGUsIERhdGFUeXBlLCBDaGlsZCwgQ2hldmVyZUV2ZW50LCBQYXJzZWREYXRhLCBFdmVudEVsZW1lbnRzLCBQYXJzZWRBcmdzIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7Q2hldmVyZURhdGF9IGZyb20gXCIuL0NoZXZlcmVEYXRhXCI7XHJcbmltcG9ydCB7RXZlbnROb2RlLCBUZXh0Tm9kZSwgTW9kZWxOb2RlLCBMb29wTm9kZSwgU2hvd05vZGUgfSBmcm9tIFwiQGFjdGlvbnNcIjtcclxuaW1wb3J0IHsgSGVscGVyLCBDaGlsZHNIZWxwZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlTm9kZSBpbXBsZW1lbnRzIENoZXZlcmVFbGVtZW50IHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGRhdGE6IERhdGFUeXBlO1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIG1ldGhvZHM/OiBNZXRob2RUeXBlO1xyXG4gICAgZWxlbWVudDogRWxlbWVudDtcclxuICAgIGFyZ3M6IHsgW21ldGhvZDogc3RyaW5nXTogUGFyc2VkQXJncyB9ID0ge307XHJcbiAgICBjaGlsZHM/OiBDaGlsZCA9IHtcclxuICAgICAgICBcImV2ZW50XCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS10ZXh0XCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1tb2RlbFwiOiBbXSxcclxuICAgICAgICBcImRhdGEtZm9yXCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1zaG93XCI6IFtdXHJcbiAgICB9O1xyXG4gICAgY2FuU2V0OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZURhdGEsIGVsOiBFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucGFyc2VEYXRhKGRhdGEuZGF0YSk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFBhcnNlIGFsbCAkdGhpcywgJHNlbGYsICRkYXRhLi4uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5tZXRob2RzID0gdGhpcy5wYXJzZU1ldGhvZHMoZGF0YS5tZXRob2RzKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHRoZSBwYXJlbnQgYGRpdmAgYW5kIGdpdmUgaXQgYSB2YWx1ZSBmb3IgdGhlIGRhdGEtaWQgYXR0cmlidXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IEhlbHBlci5zZXREYXRhSWQoMTApO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIHRoaXMuaWQpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgR2V0IHRoZSBldmVudHMgYW5kIGFjdGlvbnMgb2YgdGhlIGNvbXBvbmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2hlY2tGb3JBY3Rpb25zQW5kQ2hpbGRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSBhbGwgdGhlIGRhdGEsIHRoZXkgbmVlZCBnZXR0ZXIgYW5kIGEgc2V0dGVyXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgcHJpbWl0aXZlIGRhdGFcclxuICAgICAqL1xyXG4gICAgcGFyc2VEYXRhKGRhdGE6IERhdGFUeXBlKSB7XHJcbiAgICAgICAgbGV0IG9iajogW3N0cmluZywgUGFyc2VkRGF0YV1bXSA9IFtdO1xyXG5cclxuICAgICAgICBPYmplY3QuZW50cmllcyhkYXRhKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcclxuICAgICAgICAgICAgb2JqLnB1c2goW2tleSwgdGhpcy5wYXJzZWRPYmooa2V5LCB2YWx1ZSldKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhvYmopO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VkIHRoZSBtZXRob2RzIGRlc2NyaWJlZCBpbiB0aGUgbWV0aG9kIHByb3BlcnR5IG9mIHRoZSBkYXRhXHJcbiAgICAgKiBAcGFyYW0ge01ldGhvZFR5cGV9IG1ldGhvZHNcclxuICAgICAqIEByZXR1cm5zIFRoZSBtZXRob2RzIHBhcnNlZFxyXG4gICAgICovXHJcbiAgICBwYXJzZU1ldGhvZHMobWV0aG9kcz86IE1ldGhvZFR5cGUpOiBNZXRob2RUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAobWV0aG9kcyA9PSB1bmRlZmluZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaCgobWV0aG9kKSA9PiB7XHJcbiAgICAgICAgICAgIC8vSWYgdGhlIG1ldGhvZCB3YXMgYWxyZWFkeSBwYXJzZWRcclxuICAgICAgICAgICAgbGV0IHdhc1BhcnNlZDogbnVtYmVyID0gbWV0aG9kc1ttZXRob2RdXHJcbiAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgLnNlYXJjaChcImFub255bW91c1wiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXNQYXJzZWQgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhcmdzOiBQYXJzZWRBcmdzID0gSGVscGVyLm1ldGhvZEFyZ3VtZW50cyhtZXRob2RzW21ldGhvZF0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmKGFyZ3MpIHRoaXMuYXJnc1ttZXRob2RdID0gYXJncztcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyc2VkOiBzdHJpbmcgPSBtZXRob2RzW21ldGhvZF1cclxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLip8W1xcfV0kL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZWQgPSBwYXJzZWQucmVwbGFjZUFsbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCR0aGlzLmRhdGEuJHt2YXJpYWJsZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfS52YWx1ZWAsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuYXJnc1ttZXRob2RdICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXJnc1ttZXRob2RdPy5mb3JFYWNoKChhcmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0cjogc3RyaW5nID0gYCg/PD0oPVxcXFxzKXwoXFxcXCgpfCg9KSkoJHthcmd9KWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZCA9IHBhcnNlZC5yZXBsYWNlKG5ldyBSZWdFeHAoc3RyLCBcImdcIiksIGAkYXJncy4ke2FyZ31gKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBuZXdGdW5jOiBGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbihcclxuICAgICAgICAgICAgICAgICAgICBcInskdGhpcyA9IHVuZGVmaW5lZCwgJGV2ZW50ID0gdW5kZWZpbmVkLCAkYXJncyA9IHVuZGVmaW5lZH1cIixcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZWQsXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIG1ldGhvZHNbbWV0aG9kXSA9IG5ld0Z1bmM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1ldGhvZHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIGFsbCB0aGUgY2hpbGRyZW5zIHRoYXQgaGF2ZSBhbiBhY3Rpb24gYW5kIGRhdGFcclxuICAgICAqL1xyXG4gICAgY2hlY2tGb3JBY3Rpb25zQW5kQ2hpbGRzKCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsbCB0aGUgZWxlbWVudHMgc3VwcG9ydGVkIHdpdGggQ2hldmVyZXhcclxuICAgICAgICAgKiBAY29uc3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdCBsb29wTm9kZXMgICA6IE5vZGVMaXN0T2Y8SFRNTFRlbXBsYXRlRWxlbWVudD4gPSBDaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFGb3IodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgLy9Gb3Igbm9kZXNcclxuICAgICAgICBpZiAobG9vcE5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBsb29wTm9kZXMuZm9yRWFjaCgobG9vcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZGF0YS1mb3JcIl0ucHVzaChuZXcgTG9vcE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGxvb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB0aGlzLmNhblNldCA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY2FuU2V0KSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBldmVudE5vZGVzICA6IEV2ZW50RWxlbWVudHMgICAgICAgPSBDaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFPbkF0dHIodGhpcy5lbGVtZW50KSwgXHJcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZXMgICA6IE5vZGVMaXN0T2Y8RWxlbWVudD4gICA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YVRleHRBdHRyKHRoaXMuZWxlbWVudCksXHJcbiAgICAgICAgICAgICAgICBtb2RlbE5vZGVzICA6IE5vZGVMaXN0T2Y8RWxlbWVudD4gICA9IENoaWxkc0hlbHBlci5nZXRFbGVtZW50c0J5RGF0YU1vZGVsQXR0cih0aGlzLmVsZW1lbnQpLFxyXG4gICAgICAgICAgICAgICAgc2hvd05vZGVzICAgOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ICAgPSBDaGlsZHNIZWxwZXIuZ2V0RWxlbWVudHNCeURhdGFTaG93KHRoaXMuZWxlbWVudCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL0V2ZW50Tm9kZXNcclxuICAgICAgICAgICAgaWYgKGV2ZW50Tm9kZXMpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50Tm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImV2ZW50XCJdLnB1c2gobmV3IEV2ZW50Tm9kZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG5vZGVbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG5vZGVbMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJWYWw6IG5vZGVbMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0RhdGEtdGV4dFxyXG4gICAgICAgICAgICBpZiAodGV4dE5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dE5vZGVzLmZvckVhY2goKHRleHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0ucHVzaChuZXcgVGV4dE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiB0ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0RhdGEtc2hvd1xyXG4gICAgICAgICAgICBpZiAoc2hvd05vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgc2hvd05vZGVzLmZvckVhY2goKHNob3cpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLXNob3dcIl0ucHVzaChuZXcgU2hvd05vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBzaG93IGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL1RleHQgSW5wdXRzIHdpdGggbW9kZWxcclxuICAgICAgICAgICAgaWYgKG1vZGVsTm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbE5vZGVzLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZGF0YS1tb2RlbFwiXS5wdXNoKG5ldyBNb2RlbE5vZGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBpbnB1dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcGFyc2VkIGRhdGEsIHdpdGggdGhlIGdldHRlciBhbmQgc2V0dGVyXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgb2YgdGhlIHVucGFyc2VkIGRhdGEgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoYXQgcHJvcGVydHlcclxuICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgZGF0YVxyXG4gICAgICovXHJcbiAgICBwYXJzZWRPYmoobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogUGFyc2VkRGF0YSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5vbWJyZTogbmFtZSxcclxuICAgICAgICAgICAgX3ZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9UaGVyZSdzIGEgd2VpcmQgZGVsYXkgd2hlbiB5b3UgdHJ5IHRvIHN5bmMgYWxsIGlucHV0cywgSSBkb24ndCBrbm93IHdoeVxyXG4gICAgICAgICAgICAgICAgc2VsZi5jaGlsZHMhW1wiZGF0YS10ZXh0XCJdLmZpbHRlcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHRleHQpID0+IHRleHQuX3ZhcmlhYmxlLm5vbWJyZSA9PSB0aGlzLm5vbWJyZSxcclxuICAgICAgICAgICAgICAgICAgICApLmZvckVhY2goKHRleHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC52YWx1ZSA9IHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TeW5jIHRleHQgd2l0aCBhbGwgaW5wdXRzIHRoYXQgaGF2ZSB0aGlzIHZhcmlhYmxlIGFzIG1vZGVsIGluIHRoZWlyICdkYXRhLW1vZGVsJyBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgICAgIHNlbGYuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl0uZmlsdGVyKChpbnB1dCkgPT4gaW5wdXQudmFyaWFibGUgPT0gdGhpcy5ub21icmUpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKGlucHV0KSA9PiBpbnB1dC5hc3NpZ25UZXh0KHZhbHVlKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5jaGlsZHMhW1wiZGF0YS1zaG93XCJdLmZpbHRlcigobm9kZSkgPT4gbm9kZS52YXJpYWJsZS5ub21icmUgPT0gdGhpcy5ub21icmUpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKHNob3cpID0+IHNob3cudG9nZ2xlSGlkZGVuKCkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQgdmFsdWUoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIGN1c3RvbSBldmVudCBpbiB0aGUgc2NvcGUgb2YgdGhlIGRhdGEtYXR0YWNoZWRcclxuICAgICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdHlwZSwgdGhlIGVsZW1lbnQsIGFuZCB0aGUgZnVuY3Rpb24gd2l0aG91dCBleGVjdXRpbmdcclxuICAgICAqL1xyXG4gICAgc2V0RXZlbnQoZXZlbnQ6IENoZXZlcmVFdmVudCkge1xyXG4gICAgICAgIGV2ZW50LmVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudC50eXBlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LmFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgICAgICRhcmdzOiBldmVudC5hcmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZURhdGFcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQ2hldmVyZU5vZGVcIjsiLCJpbXBvcnQgeyBFdmVudEVsZW1lbnRzIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgQ2hpbGRzSGVscGVyID0ge1xyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFPbkF0dHIoZWxlbWVudDogRWxlbWVudCk6IEV2ZW50RWxlbWVudHMge1xyXG4gICAgICAgIGxldCBub2RlczogRXZlbnRFbGVtZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAvL0dldCBhbGwgY2hpbGRzIG9mIHRoZSBlbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRzOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKTtcclxuXHJcbiAgICAgICAgLy9QdXNoIHRvIGBub2Rlc2AgYWxsIGVsZW1lbnRzIHdpdGggdGhlICdkYXRhLW9uJyBvciAnQG9uJyBhdHRyaWJ1dGVcclxuICAgICAgICBmb3IobGV0IGNoaWxkIG9mIGNoaWxkcykge1xyXG4gICAgICAgICAgICBmb3IobGV0IGF0dHIgb2YgY2hpbGQuYXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJkYXRhLW9uXCIpKSBcclxuICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKFtjaGlsZCwgYXR0ci5uYW1lLnNwbGl0KFwiOlwiKVsxXSwgYXR0ci5ub2RlVmFsdWUhXSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKGF0dHIubmFtZS5zdGFydHNXaXRoKFwiQG9uXCIpKSBcclxuICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKFtjaGlsZCwgYXR0ci5uYW1lLnJlcGxhY2UoXCJAb25cIiwgXCJcIikudG9Mb3dlckNhc2UoKSwgYXR0ci5ub2RlVmFsdWUhXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIChub2Rlcy5sZW5ndGggPT0gMCkgPyB1bmRlZmluZWQgOiBub2RlcztcclxuICAgIH0sXHJcbiAgICBnZXRFbGVtZW50c0J5RGF0YVRleHRBdHRyKGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLXRleHRdXCIpO1xyXG4gICAgfSxcclxuICAgIGdldEVsZW1lbnRzQnlEYXRhTW9kZWxBdHRyKGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRbZGF0YS1tb2RlbF0sIHRleHRhcmVhW2RhdGEtbW9kZWxdLCBzZWxlY3RbZGF0YS1tb2RlbF1cIik7XHJcbiAgICB9LFxyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFGb3IoZWxlbWVudDogRWxlbWVudCk6IE5vZGVMaXN0T2Y8SFRNTFRlbXBsYXRlRWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtkYXRhLWZvcl1cIik7XHJcbiAgICB9LFxyXG4gICAgZ2V0RWxlbWVudHNCeURhdGFTaG93KGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKltkYXRhLXNob3ddXCIpO1xyXG4gICAgfSxcclxufTsiLCJpbXBvcnQgeyBBcmdzRXJyb3JzLCBDb21wYXJlQXJndW1lbnRzLCBQYXJzZWRBcmdzIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XHJcbi8qKlxyXG4gKiBIZWxwZXIgY2xhc3MsIGl0IHByb3ZpZGUgdXNlZnVsbCBtZXRob2RzIHRvIENoZXZlcmUgZWxlbWVudHNcclxuICogQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgSGVscGVyID0ge1xyXG4gICAgaXNFbXB0eShvYmo6IG9iamVjdCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PSAwO1xyXG4gICAgfSxcclxuICAgIHNldERhdGFJZChsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGZpbmFsOiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgICAgICBjb25zdCByb3VuZGVkOiBGdW5jdGlvbiA9IChudW06IG51bWJlcik6IG51bWJlciA9PiB+fihNYXRoLnJhbmRvbSgpICogbnVtKTtcclxuXHJcbiAgICAgICAgY29uc3QgY2hhcnM6IHsgW3R5cGU6IHN0cmluZ106IHN0cmluZyB9ID0ge1xyXG4gICAgICAgICAgICBsZXR0ZXJzIDogXCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiLFxyXG4gICAgICAgICAgICBtYXl1cyAgIDogXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiLFxyXG4gICAgICAgICAgICBudW1iZXJzIDogXCIwMTIzNDU2Nzg5XCIsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGVuZ3RoOyBpKyspIGZpbmFsICs9IGNoYXJzW09iamVjdC5rZXlzKGNoYXJzKVtyb3VuZGVkKDIpXV1bcm91bmRlZChsZW5ndGgpXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZpbmFsO1xyXG4gICAgfSxcclxuICAgIGNoZWNrRm9yRXJyb3JJblZhcmlhYmxlKHN0cjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKC9eWzAtOV18XFxXL2cudGVzdChzdHIpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXHJcbiAgICAgICAgICAgICAgICBcIlZhcmlhYmxlIG5hbWUgY2Fubm90IHN0YXJ0IHdpdGggYSBudW1iZXIgb3IgaGF2ZSBzcGFjZXNcIixcclxuICAgICAgICAgICAgKTtcclxuICAgIH0sXHJcbiAgICBodG1sQXJnc0RhdGFBdHRyKGRhdGFBdHRhY2hlZDogc3RyaW5nKTogUGFyc2VkQXJncyB7XHJcbiAgICAgICAgaWYoIWRhdGFBdHRhY2hlZC5tYXRjaCgvXFwoLitcXCkvZykpIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IG9ubHlBdHRyczogc3RyaW5nID0gZGF0YUF0dGFjaGVkLnRyaW0oKS5yZXBsYWNlKC8uK1xcKHxcXCkuKy9nLCBcIlwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChvbmx5QXR0cnMpID8gb25seUF0dHJzLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICBtZXRob2RBcmd1bWVudHMobWV0aG9kOiBGdW5jdGlvbik6IFBhcnNlZEFyZ3Mge1xyXG4gICAgICAgIGxldCBvbmx5QXJnczogc3RyaW5nID0gbWV0aG9kLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcey4qL2dzLCBcIlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvLitcXCh8XFwpLisvZywgXCJcIik7XHJcblxyXG4gICAgICAgIHJldHVybiAob25seUFyZ3MpID8gb25seUFyZ3Muc3BsaXQoXCIsXCIpIDogdW5kZWZpbmVkOyAgICAgICAgICAgIFxyXG4gICAgfSxcclxuICAgIGdldFJlYWxWYWx1ZXNJbkFyZ3VtZW50cyhkYXRhOiBBcmdzRXJyb3JzKTogYW55W10ge1xyXG4gICAgICAgIGxldCBmaW5hbDogYW55W10gPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmaW5hbCA9IGRhdGEuYXJncy5tYXAoKGFyZykgPT4gbmV3IEZ1bmN0aW9uKGByZXR1cm4gJHthcmd9YCkoKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgYCR7ZXJyb3J9LCBjaGVjayB0aGUgdmFsdWVzIG9mIHlvdXIgJHtkYXRhLm1ldGhvZH0sIGF0IG9uZSBvZiB5b3VyICcke2RhdGEubmFtZX0nIGNvbXBvbmVudHNgLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZpbmFsO1xyXG4gICAgfSxcclxuICAgIGNvbXBhcmVBcmd1bWVudHMoZGF0YTogQ29tcGFyZUFyZ3VtZW50cyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBlcnJvclByZTogc3RyaW5nID0gYFRoZSAke2RhdGEubWV0aG9kfSBmdW5jdGlvbiBvZiB0aGUgJHtkYXRhLmNvbXBvbmVudH0oKSBjb21wb25lbnQgYDsgICAgICAgIFxyXG5cclxuICAgICAgICBzd2l0Y2godHJ1ZSkge1xyXG4gICAgICAgICAgICBjYXNlICgoIWRhdGEuaHRtbEFyZ3MpICYmICghZGF0YS5tZXRob2RBcmdzKSk6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY2FzZSAoKGRhdGEuaHRtbEFyZ3MgIT0gdW5kZWZpbmVkKSAmJiAoIWRhdGEubWV0aG9kQXJncykpOiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JQcmUgKyBgZG9lc24ndCByZWNlaXZlIGFueSBwYXJhbWV0ZXJgKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY2FzZSAoKCFkYXRhLmh0bWxBcmdzKSAmJiAoZGF0YS5tZXRob2RBcmdzICE9IHVuZGVmaW5lZCkpOiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JQcmUgKyBgbmVlZHMgdG8gcmVjZWl2ZSAke2RhdGEubWV0aG9kQXJnc30gcGFyYW1ldGVycywgMCBwYXNzZWRgKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY2FzZSAoKGRhdGEubWV0aG9kQXJncz8ubGVuZ3RoKSAhPSAoZGF0YS5odG1sQXJncz8ubGVuZ3RoKSk6IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclByZSArIGBuZWVkcyB0byByZWNlaXZlICAke2RhdGEubWV0aG9kQXJncz8ubGVuZ3RofSBwYXJhbWV0ZXJzLCBcclxuICAgICAgICAgICAgICAgICAgICAke2RhdGEuaHRtbEFyZ3M/Lmxlbmd0aH0gcGFzc2VkYClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29udGVudE9mRnVuY3Rpb24oZnVuYzogRnVuY3Rpb24pOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBmdW5jLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgLnJlcGxhY2UoLy4rXFx7fFxcfSQvZ3MsIFwiXCIpXHJcbiAgICAgICAgICAgIC50cmltKCk7XHJcbiAgICB9LFxyXG4gICAgbmFtZU9mRnVuY3Rpb24oYXR0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gYXR0ci50cmltKCkucmVwbGFjZSgvXFwoLisvLFwiXCIpO1xyXG4gICAgfSxcclxufTtcclxuIiwiaW1wb3J0IHsgSW5saW5lUGFyc2VyLCBQYXJzZWRGb3IsIFBhcnNlZFRleHQsIEF0dHJpYnV0ZSwgUGFyc2VkU2hvdyB9IGZyb20gXCJAaW50ZXJmYWNlc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBhcnNlcjogSW5saW5lUGFyc2VyID0ge1xyXG4gICAgcGF0dGVybnM6IHtcclxuICAgICAgICB2YXJzOiB7XHJcbiAgICAgICAgICAgIHZhcmlhYmxlRXhwcmVzc2lvbjogL15bYS16QS1aXSsoXFxzfDx8PnwhKT89KFxccyk/L2csXHJcbiAgICAgICAgICAgIHZhcmlhYmxlTmFtZTogL15bYS16QS1aXSsvLFxyXG4gICAgICAgICAgICBlcXVhbGl0eTogLyg8fD58ISk/PXsxLDN9L2csXHJcbiAgICAgICAgICAgIHN0cmluZzogL14oXFxcInxcXCcpXFx3LitcXDEkL2csXHJcbiAgICAgICAgICAgIG51bWJlcjogL14oXFwtKT9bMC05XSsoXFwuKT9bMC05XSskL2csXHJcbiAgICAgICAgICAgIGJvb2xlYW46IC90cnVlfGZhbHNlJC9nLFxyXG4gICAgICAgICAgICB2YWx1ZTogL14uKj0vZyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAganVzdFZhcmlhYmxlOiAvXlthLXpBLVpdKyQvLFxyXG4gICAgICAgICAgICBzaW5nbGVPYmplY3QgOiAvXlthLXpBLVpdKygoXFwuW2EtekEtel0qKXwoXFxbWzAtOV17MSx9XFxdKSkkLyxcclxuICAgICAgICAgICAgbmVzdGVkT2JqZWN0OiAvXlthLXpBLVpdKygoXFwufFxcWylbYS16QS1aMC05XSsoXFwufFxcXSk/KXsxLH1bYS16QS16XSQvXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93OiB7XHJcbiAgICAgICAgICAgIHRydWU6IC9eW2EtekEtWl0rJC8sXHJcbiAgICAgICAgICAgIGZhbHNlOiAvXlxcIVthLXpBLVpdKyQvLFxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwYXJzZXIoZXhwcjogYW55KTogYW55IHtcclxuICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKGByZXR1cm4gJHtleHByfWApKCk7XHJcbiAgICB9LFxyXG4gICAgcGFyc2VkRGF0YVNob3dBdHRyKGRhdGE6IEF0dHJpYnV0ZSk6IFBhcnNlZFNob3cge1xyXG5cclxuICAgICAgICBsZXQgdmFsID0gKHRoaXMucGF0dGVybnMudmFycy52YXJpYWJsZUV4cHJlc3Npb24udGVzdChkYXRhLmF0dHIpKSBcclxuICAgICAgICAgICAgPyBkYXRhLmF0dHIucmVwbGFjZSh0aGlzLnBhdHRlcm5zLnZhcnMudmFsdWUsIFwiXCIpLnRyaW0oKVxyXG4gICAgICAgICAgICA6IE9iamVjdC5lbnRyaWVzKHRoaXMucGF0dGVybnMuc2hvdykuZmluZCgoWywgcmVnZXhwXSkgPT4gcmVnZXhwLnRlc3QoZGF0YS5hdHRyKSkhWzBdO1xyXG5cclxuICAgICAgICBsZXQgcGFyc2UgPSBgJHsoKHRoaXMucGF0dGVybnMudmFycy5lcXVhbGl0eS5leGVjKGRhdGEuYXR0cikpIHx8IFtcIj09XCJdKVswXX0gJHt2YWx9YDtcclxuXHJcbiAgICAgICAgaWYoIXBhcnNlKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1zaG93JyBhdHRyaWJ1dGUgY29udGFpbnMgaW52YWxpZCBleHByZXNzaW9uc1wiKTtcclxuXHJcbiAgICAgICAgY29uc3QgdmFyTmFtZTogc3RyaW5nID0gZGF0YS5hdHRyLm1hdGNoKC9cXHcrLykhWzBdLFxyXG4gICAgICAgICAgICBwYXJlbnRWYXIgPSBkYXRhLm5vZGUuZGF0YVt2YXJOYW1lXTtcclxuXHJcbiAgICAgICAgaWYoIXBhcmVudFZhcilcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBBIGRhdGEgd2l0aCB0aGUgJyR7dmFyTmFtZX0nIGNvdWxkbid0IGJlIGZvdW5kIGluIHRoZSAnJHtkYXRhLm5vZGUubmFtZX0nYCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHZhcmlhYmxlOiBwYXJlbnRWYXIsIFxyXG4gICAgICAgICAgICB2YWx1ZTogcGFyc2UsXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBwYXJzZURhdGFUZXh0QXR0cihkYXRhOiBBdHRyaWJ1dGUpOiBQYXJzZWRUZXh0IHtcclxuICAgICAgICBsZXQgdHlwZSA9IE9iamVjdC5rZXlzKHRoaXMucGF0dGVybnMudGV4dClcclxuICAgICAgICAgICAgLmZpbmQoKHBhdHRlcm4pID0+IHRoaXMucGF0dGVybnMudGV4dFtwYXR0ZXJuXS50ZXN0KGRhdGEuYXR0cikpO1xyXG5cclxuICAgICAgICBpZighdHlwZSkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIlRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtdGV4dCcgYXR0cmlidXRlIGNvbnRhaW5zIGludmFsaWQgZXhwcmVzc2lvbnNcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgdmFyTmFtZTogc3RyaW5nID0gdGhpcy5wYXR0ZXJucy50ZXh0Lmp1c3RWYXJpYWJsZS5leGVjKGRhdGEuYXR0cikhWzBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwYXJzZWQ6IFBhcnNlZFRleHQgPSB7IHZhcmlhYmxlOiBkYXRhLm5vZGUuZGF0YVt2YXJOYW1lXSB9O1xyXG5cclxuICAgICAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwianVzdFZhcmlhYmxlXCIgOiB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZWQudmFsdWUgPSBwYXJzZWQudmFyaWFibGUudmFsdWU7XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIFwic2luZ2xlT2JqZWN0XCIgOiB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZWQudmFsdWUgPSBwYXJzZWQudmFyaWFibGUudmFsdWVbZGF0YS5hdHRyLm1hdGNoKHRoaXMucGF0dGVybnMudGV4dC5pbmRleFZhbHVlKSFbMF1dO1xyXG4gICAgICAgICAgICB9IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBcIm5lc3RlZE9iamVjdFwiIDoge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBzZXBhcmVkOiBzdHJpbmdbXSA9IGRhdGEuYXR0ci5zcGxpdCgvXFxbfFxcXXxcXC58XFwnL2cpLmZpbHRlcih3ID0+IHcgIT09IFwiXCIpLnNsaWNlKDEpLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogbnVtYmVyID0gc2VwYXJlZC5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZmluZE5lc3RlZFByb3AodmFyaWFibGU6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9LCBwb3M6IG51bWJlciA9IDApOiBhbnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBvYmogPSB2YXJpYWJsZVtzZXBhcmVkW3Bvc11dO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAocG9zID09IGxlbmd0aC0xKSA/IG9iaiA6IGZpbmROZXN0ZWRQcm9wKG9iaiwgcG9zICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcnNlZC52YWx1ZSA9IGZpbmROZXN0ZWRQcm9wKHBhcnNlZC52YXJpYWJsZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcGFyc2VkO1xyXG4gICAgfSxcclxuICAgIHBhcnNlRGF0YUZvckF0dHIoZGF0YTogQXR0cmlidXRlKTogUGFyc2VkRm9yIHtcclxuICAgICAgICBsZXQgcGFyc2VkRGF0YTogUGFyc2VkRm9yID0ge307XHJcblxyXG4gICAgICAgIGxldCBleHByZXNzaW9uczogc3RyaW5nW10gPSBkYXRhLmF0dHIuc3BsaXQoXCIgXCIpO1xyXG5cclxuICAgICAgICBpZihleHByZXNzaW9ucy5sZW5ndGggPiAzKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1mb3InIGF0dHJpYnV0ZSBjb250YWlucyBpbnZhbGlkIGV4cHJlc3Npb25zXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHBhcnNlZERhdGEuZXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucztcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdmFyaWFibGUgPSBPYmplY3Qua2V5cyhkYXRhLm5vZGUuZGF0YSkuZmluZCgodmFyaWFibGUpID0+IHZhcmlhYmxlID09IGV4cHJlc3Npb25zWzJdKTtcclxuXHJcbiAgICAgICAgaWYoIXZhcmlhYmxlKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBBIHZhcmlhYmxlIHdpdGggdGhlIG5hbWUgJHtleHByZXNzaW9uc1syXX0gY291bGRuJ3QgYmUgZm91bmQgaW4gdGhlIGRhdGEgb2YgeW91ciAke2RhdGEubm9kZS5uYW1lfSgpIGNvbXBvbmVudGApO1xyXG4gICAgICAgIGVsc2UgcGFyc2VkRGF0YS52YXJpYWJsZSA9IGRhdGEubm9kZS5kYXRhW3ZhcmlhYmxlXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZERhdGE7XHJcbiAgICB9LFxyXG59OyIsImV4cG9ydCAqIGZyb20gXCIuL0hlbHBlclwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9DaGlsZHNIZWxwZXJcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vSW5saW5lUGFyc2VyXCI7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IENoZXZlcmVXaW5kb3csIENoZXZlcmVOb2RlRGF0YSwgQ2hldmVyZXhOb2RlTGlzdCwgQ2hldmVyZXhEYXRhTm9kZSwgQXJndW1lbnRzIH0gZnJvbSBcIkBpbnRlcmZhY2VzXCI7XG5pbXBvcnQge0NoZXZlcmVOb2RlLCBDaGV2ZXJlRGF0YX0gZnJvbSBcIkBjaGV2ZXJlXCI7XG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiQGhlbHBlcnNcIjtcblxuY29uc3QgQ2hldmVyZTogQ2hldmVyZVdpbmRvdyA9IHtcbiAgIG5vZGVzOiBbXSxcbiAgIC8qKlxuICAgICogRmluZCBhIENoZXZlcmVEYXRhIGJ5IHRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtYXR0YWNoZWQnIGF0dHJpYnV0ZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJcbiAgICAqIEBwYXJhbSB7Q2hldmVyZURhdGFbXX0gZGF0YVxuICAgICogQHJldHVybnMgVGhlIGRhdGEgcmVhZHkgZm9yIGluc3RhbmNlIGEgTm9kZUxpc3RPZjxFbGVtZW50PlxuICAgICovXG4gICBmaW5kSXRzRGF0YShhdHRyOiBzdHJpbmcsIGRhdGE6IENoZXZlcmVEYXRhW10pOiBDaGV2ZXJlRGF0YSB7XG4gICAgICAgbGV0IHNlYXJjaDogQ2hldmVyZURhdGEgfCB1bmRlZmluZWQgPSBkYXRhLmZpbmQoKGQpID0+IGQubmFtZSA9PSBhdHRyLnRyaW0oKS5yZXBsYWNlKC9cXCguKlxcKS8sIFwiXCIpKTtcblxuICAgICAgICBpZighc2VhcmNoKSBcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgJyR7YXR0cn0nIGNvdWxkbid0IGJlIGZvdW5kIGluIGFueSBvZiB5b3VyIGRlY2xhcmVkIGNvbXBvbmVudHNgKTtcblxuICAgICAgIHJldHVybiBzZWFyY2g7XG4gICB9LFxuICAgLyoqXG4gICAgKiBTZWFyY2ggZm9yIENoZXZlcmUgTm9kZXMgYXQgdGhlIHNpdGVcbiAgICAqIEBwYXJhbSBkYXRhIEFsbCB0aGUgQ2hldmVyZSBjb21wb25lbnRzXG4gICAgKi9cbiAgICBzdGFydCguLi5kYXRhOiBDaGV2ZXJlRGF0YVtdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzOiBDaGV2ZXJleE5vZGVMaXN0ID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZbZGF0YS1hdHRhY2hlZF1cIildXG4gICAgICAgICAgICAubWFwKChlbGVtZW50KSA9PiAoeyBlbGVtOiBlbGVtZW50LCBkYXRhQXR0cjogZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWF0dGFjaGVkXCIpfSkpO1xuXG4gICAgICAgLy9DcmVhdGUgYSBDaGV2ZXJlTm9kZSBmb3IgZWFjaCBkYXRhLWF0dGFjaGVkXG4gICAgICAgZWxlbWVudHMuZm9yRWFjaCgoZWw6IENoZXZlcmV4RGF0YU5vZGUpID0+IHtcbiAgICAgICAgICAgY29uc3Qgbm9kZTogQ2hldmVyZURhdGEgPSB0aGlzLmZpbmRJdHNEYXRhKGVsLmRhdGFBdHRyISwgZGF0YSk7XG5cbiAgICAgICAgICAgaWYoKG5vZGUuaW5pdCA9PSB1bmRlZmluZWQpICYmIChIZWxwZXIuaHRtbEFyZ3NEYXRhQXR0cihlbC5kYXRhQXR0ciEpICE9IHVuZGVmaW5lZCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSdzIG5vIGluaXQgbWV0aG9kIGRlZmluZWQgaW4geW91ciAnJHtub2RlLm5hbWV9JyBjb21wb25lbnRgKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgLy9JZiB0aGUgaW5pdCBtZXRob2QgaXNuJ3QgdW5kZWZpbmVkXG4gICAgICAgICAgIGlmKG5vZGUuaW5pdCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvL0NoZWNrIGZvciBhcmd1bWVudHNcbiAgICAgICAgICAgICAgICBsZXQgYXJnczogQXJndW1lbnRzID0ge1xuICAgICAgICAgICAgICAgICAgICBpbml0QXJnczogSGVscGVyLm1ldGhvZEFyZ3VtZW50cyhub2RlLmluaXQpLFxuICAgICAgICAgICAgICAgICAgICBIVE1MQXJnczogSGVscGVyLmh0bWxBcmdzRGF0YUF0dHIoZWwuZGF0YUF0dHIhKVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAqIENoZWNrIHRoZSBkaWZmIGJldHdlZW4gdGhlIGFydW1lbnRzIGF0IHRoZSBIVE1MIGFuZCB0aG9zZSBvbmVzIGRlY2xhcmVkIGF0IFxuICAgICAgICAgICAgICAgICogdGhlIGluaXQoKSBtZXRob2RcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGxldCBjaGVja0ZvckluaXRBcmd1bWVudHM6IGJvb2xlYW4gPSBIZWxwZXIuY29tcGFyZUFyZ3VtZW50cyh7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiaW5pdCgpXCIsXG4gICAgICAgICAgICAgICAgICAgIGh0bWxBcmdzOiBhcmdzLkhUTUxBcmdzLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2RBcmdzOiBhcmdzLmluaXRBcmdzXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAoYXN5bmMoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vSWYgdGhlcmUncyBubyBlcnJvcnMsIHBhcnNlIHRoZSBhcmd1bWVudHMsIGFuZCBleGVjdXRlIHRoZSBpbml0KCkgbWV0aG9kXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoY2hlY2tGb3JJbml0QXJndW1lbnRzKSBcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYXdhaXQgbm9kZS5wYXJzZUFyZ3VtZW50cyhhcmdzLkhUTUxBcmdzISwgYXJncy5pbml0QXJncyEpIFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBhd2FpdCBub2RlLnBhcnNlSW5pdCh7IGluaXQ6IG5vZGUuaW5pdCEgfSk7XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMubm9kZXMucHVzaChuZXcgQ2hldmVyZU5vZGUobm9kZSwgZWwuZWxlbSkpO1xuICAgICAgIH0pO1xuICAgfSxcbiAgIGRhdGEoZGF0YTogQ2hldmVyZU5vZGVEYXRhKTogQ2hldmVyZURhdGEge1xuICAgICAgIHJldHVybiBuZXcgQ2hldmVyZURhdGEoZGF0YSk7XG4gICB9LFxufTtcblxud2luZG93LkNoZXZlcmUgPSBDaGV2ZXJlOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==