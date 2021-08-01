/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ts/Actions/Index.ts":
/*!*********************************!*\
  !*** ./src/ts/Actions/Index.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputAction = exports.ClickAction = exports.TextAction = void 0;
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
class ClickAction {
    constructor(click) {
        this.element = click.element;
        this.element.setAttribute("data-id", Helper_1.Helper.setDataId(10));
        this.parent = click.parent;
        this.method = this.searchMethod();
        this.parent?.setEvent({
            elem: this.element,
            action: this.method,
            type: "click",
        });
    }
    searchMethod() {
        const attr = this.element.getAttribute("data-click");
        let sanitized = attr.replace("()", "");
        let method = this.parent.methods[sanitized];
        if (!method)
            throw new ReferenceError(`There's no method ${attr} in the data-attached scope`);
        return method;
    }
}
exports.ClickAction = ClickAction;
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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Index_1 = __webpack_require__(/*! ../Actions/Index */ "./src/ts/Actions/Index.ts");
const Helper_1 = __webpack_require__(/*! ../utils/Helper */ "./src/ts/utils/Helper.ts");
class ChevereNode {
    constructor(data, el) {
        this.childs = {
            "data-click": [],
            "data-text": [],
            "data-model": [],
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
                let parsed = methods[method]
                    .toString()
                    .replace(/^.*|[\}]$/g, "");
                Object.keys(this.data).forEach((variable) => {
                    parsed = parsed.replaceAll(`$this.data.${variable}`, `$this.data.${variable}.value`);
                });
                let newFunc = new Function("{$this = undefined}", parsed);
                methods[method] = newFunc;
            }
        });
        return methods;
    }
    /**
     * Find all the childrens that have an action and data
     */
    checkForActionsAndChilds() {
        const parentSelector = `div[data-id=${this.id}] > `;
        /**
         * All the elements supported with Cheverex
         * @const
         */
        const selectors = {
            buttons: this.element.querySelectorAll(parentSelector + "button[data-click]"),
            text: this.element.querySelectorAll(parentSelector + "*[data-text]"),
            inputs: this.element.querySelectorAll(parentSelector +
                "input[data-model][type=text]," +
                parentSelector +
                "textarea[data-model]"),
        };
        //Buttons
        if (selectors.buttons.length) {
            selectors.buttons.forEach((button) => {
                const click = new Index_1.ClickAction({
                    element: button,
                    parent: this,
                });
                this.childs["data-click"].push(click);
            });
        }
        //Data-text
        if (selectors.text.length) {
            selectors.text.forEach((text) => {
                const txt = new Index_1.TextAction({
                    element: text,
                    parent: this,
                });
                this.childs["data-text"].push(txt);
            });
        }
        //Text Inputs with model
        if (selectors.inputs.length) {
            selectors.inputs.forEach((input) => {
                const inp = new Index_1.InputAction({
                    element: input,
                    parent: this,
                });
                this.childs["data-model"].push(inp);
            });
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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d2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvY2hldmVyZS9DaGV2ZXJlRGF0YS50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2NoZXZlcmUvQ2hldmVyZU5vZGUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS8uL3NyYy90cy9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL3V0aWxzL0hlbHBlci50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NoZXZlcmUvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9jaGV2ZXJlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ2hldmVyZU5vZGUgZnJvbSBcIi4uL2NoZXZlcmUvQ2hldmVyZU5vZGVcIjtcbmltcG9ydCB7IENsaWNrLCBUZXh0UmVsYXRpb24sIElucHV0TW9kZWwgfSBmcm9tIFwiLi4vaW50ZXJmYWNlc1wiO1xuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIi4uL3V0aWxzL0hlbHBlclwiO1xuXG5leHBvcnQgY2xhc3MgVGV4dEFjdGlvbiBpbXBsZW1lbnRzIFRleHRSZWxhdGlvbiB7XG4gICAgZWxlbWVudDogRWxlbWVudDtcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xuICAgIF92YXJpYWJsZT86IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IFRleHRSZWxhdGlvbikge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkYXRhLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIEhlbHBlci5zZXREYXRhSWQoMTApKTtcblxuICAgICAgICB0aGlzLnBhcmVudCA9IGRhdGEucGFyZW50O1xuXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpITtcblxuICAgICAgICB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLl92YXJpYWJsZS52YWx1ZTtcbiAgICB9XG5cbiAgICBzZXRUZXh0KHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzZXQgdmFyaWFibGUoYXR0cjogc3RyaW5nKSB7XG4gICAgICAgIEhlbHBlci5jaGVja0ZvckVycm9ySW5WYXJpYWJsZShhdHRyKTtcblxuICAgICAgICBjb25zdCBhcnJBdHRyOiBzdHJpbmcgPSBhdHRyLnNwbGl0KFwiLlwiKS5zcGxpY2UoMSkuam9pbihcIi5cIik7XG5cbiAgICAgICAgY29uc3QgY3VzdG9tT2JqQXR0ciA9IGF0dHIucmVwbGFjZSgvXFwuLiovLCBgYCk7XG5cbiAgICAgICAgbGV0IHBhcmVudFZhciA9IE9iamVjdC5rZXlzKHRoaXMucGFyZW50LmRhdGEpLmZpbmQoXG4gICAgICAgICAgICAoZCkgPT4gZCA9PSBjdXN0b21PYmpBdHRyLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICghcGFyZW50VmFyKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgIGBUaGUgdmFyaWFibGUgb3IgbWV0aG9kIG5hbWVkICcke3BhcmVudFZhcn0nIHdhc24ndCBmb3VuZCBvbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGlmIChhcnJBdHRyID09PSBcIlwiKSB0aGlzLl92YXJpYWJsZSA9IHRoaXMucGFyZW50LmRhdGFbcGFyZW50VmFyXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgYXJyOiBzdHJpbmdbXSA9IGFyckF0dHIuc3BsaXQoXCIuXCIpO1xuICAgICAgICAgICAgbGV0IGxhc3Q6IHN0cmluZyA9IGFyclthcnIubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSBhcnIubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgLy9GaW5kIHRoZSBuZXN0ZWQgcHJvcGVydHkgYnkgcmVjdXJzaXZpdHlcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZpbmRQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICBvYmo6IGFueSxcbiAgICAgICAgICAgICAgICBrZXk6IGFueSxcbiAgICAgICAgICAgICAgICBwb3M6IG51bWJlcixcbiAgICAgICAgICAgICAgICBuZXN0ZWQ6IG51bWJlcixcbiAgICAgICAgICAgICk6IGFueSB7XG4gICAgICAgICAgICAgICAgaWYgKG5lc3RlZCA9PSBsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSByZXR1cm4gb2JqW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgVGhlcmUncyBubyBhICcke2tleX0nIHByb3BlcnR5IGluIHRoZSAnJHtvYmp9JyBwcm9wZXJ0eSwgIHRoZSAke3BhcmVudFZhcn1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmluZFByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW2Fycltwb3NdXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGVkICsgMSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBleGlzdHMgPSBmaW5kUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVtwYXJlbnRWYXJdLnZhbHVlLFxuICAgICAgICAgICAgICAgIGxhc3QsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coZXhpc3RzKTtcbiAgICAgICAgICAgIGlmICghZXhpc3RzKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFRoZSBwcm9wZXJ0eSBuYW1lZCAnJHthcnJBdHRyfScgd2Fzbid0IGZvdW5kIG9uIHRoZSAnJHtwYXJlbnRWYXJ9JyBkYXRhYCxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB0aGlzLl92YXJpYWJsZSA9IGV4aXN0cztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENsaWNrQWN0aW9uIGltcGxlbWVudHMgQ2xpY2sge1xuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcbiAgICBtZXRob2Q/OiBGdW5jdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKGNsaWNrOiBDbGljaykge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBjbGljay5lbGVtZW50IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBIZWxwZXIuc2V0RGF0YUlkKDEwKSk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQgPSBjbGljay5wYXJlbnQ7XG5cbiAgICAgICAgdGhpcy5tZXRob2QgPSB0aGlzLnNlYXJjaE1ldGhvZCgpO1xuXG4gICAgICAgIHRoaXMucGFyZW50Py5zZXRFdmVudCh7XG4gICAgICAgICAgICBlbGVtOiB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgICBhY3Rpb246IHRoaXMubWV0aG9kISxcbiAgICAgICAgICAgIHR5cGU6IFwiY2xpY2tcIixcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VhcmNoTWV0aG9kKCk6IEZ1bmN0aW9uIHtcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNsaWNrXCIpITtcblxuICAgICAgICBsZXQgc2FuaXRpemVkOiBzdHJpbmcgPSBhdHRyLnJlcGxhY2UoXCIoKVwiLCBcIlwiKTtcblxuICAgICAgICBsZXQgbWV0aG9kOiBGdW5jdGlvbiA9IHRoaXMucGFyZW50Lm1ldGhvZHMhW3Nhbml0aXplZF07XG5cbiAgICAgICAgaWYgKCFtZXRob2QpXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgICAgICAgYFRoZXJlJ3Mgbm8gbWV0aG9kICR7YXR0cn0gaW4gdGhlIGRhdGEtYXR0YWNoZWQgc2NvcGVgLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gbWV0aG9kO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaGUgY2xhc3MgZm9yIHRob3NlIGlucHV0cyBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIGBkYXRhLW1vZGVsYCBhdHRyaWJ1dGVcbiAqICBAY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIElucHV0QWN0aW9uIGltcGxlbWVudHMgSW5wdXRNb2RlbCB7XG4gICAgZWxlbWVudDogSFRNTFRleHRBcmVhRWxlbWVudCB8IEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcbiAgICB2YXJpYWJsZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoaW5wdXQ6IElucHV0TW9kZWwpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBpbnB1dC5wYXJlbnQ7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGlucHV0LmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudDtcblxuICAgICAgICAvL1NlYXJjaCBpZiB0aGUgaW5kaWNhdGVkIHZhcmlhYmxlIG9mIHRoZSBkYXRhLW1vZGVsIGF0dHJpYnV0ZSBleGlzdHMgaW4gdGhlIHNjb3BlXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmdldFZhcmlhYmxlKCk7XG5cbiAgICAgICAgLy9TZXQgdGhlIGRlZmF1bHQgdmFsdWVcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZS50b1N0cmluZygpO1xuXG4gICAgICAgIC8vQWRkIHRoZSBsaXN0ZW5lclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3luY1RleHQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXNzaWduVGV4dCh2YWx1ZTogYW55KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3luY1RleHQoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUgPSB0aGlzLmVsZW1lbnQudmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBnZXRWYXJpYWJsZSgpOiBzdHJpbmcge1xuICAgICAgICBsZXQgYXR0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLW1vZGVsXCIpITtcblxuICAgICAgICBIZWxwZXIuY2hlY2tGb3JFcnJvckluVmFyaWFibGUoYXR0cik7XG5cbiAgICAgICAgbGV0IHZhcmlhYmxlID0gT2JqZWN0LmtleXModGhpcy5wYXJlbnQuZGF0YSkuZmluZChcbiAgICAgICAgICAgIChkYXRhKSA9PiBkYXRhID09IGF0dHIsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCF2YXJpYWJsZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcbiAgICAgICAgICAgICAgICBgVGhlcmUncyBubyBhICcke2F0dHJ9JyB2YXJpYWJsZSBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB2YXJpYWJsZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ2hldmVyZU5vZGVEYXRhLCBEYXRhVHlwZSwgTWV0aG9kVHlwZSwgQXJndW1lbnRzT2JqZWN0LCBJbml0IH0gZnJvbSBcIi4uL2ludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgSGVscGVyIH0gZnJvbSBcIi4uL3V0aWxzL0hlbHBlclwiO1xyXG5cclxuLyoqXHJcbiAqICBUaGUgY2xhc3MgdGhhdCB1c2VycyBjcmVhdGUgdGhlaXIgY29tcG9uZW50c1xyXG4gKiAgQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGV2ZXJlRGF0YSBpbXBsZW1lbnRzIENoZXZlcmVOb2RlRGF0YSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBkYXRhOiBEYXRhVHlwZTtcclxuICAgIGluaXQ/OiBGdW5jdGlvbjtcclxuICAgIG1ldGhvZHM/OiBNZXRob2RUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVOb2RlRGF0YSkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhLmRhdGE7XHJcbiAgICAgICAgdGhpcy5pbml0ID0gZGF0YS5pbml0O1xyXG4gICAgICAgIHRoaXMubWV0aG9kcyA9IGRhdGEubWV0aG9kcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBhcmd1bWVudHMgb2YgdGggaW5pdCgpIG1ldGhvZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gaHRtbEFyZ3MgVGhlIGFyZ3VtZW50cyBvZiBkZSBkYXRhLWF0dGFjaGVkIGF0dHJpYnV0ZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gaW5pdEFyZ3MgVGhlIGFyZ3VtZW50cyBkZWZpbmVkIGluIHRoZSBpbml0KCkgbWV0aG9kXHJcbiAgICAgKi9cclxuICAgIHBhcnNlQXJndW1lbnRzKGh0bWxBcmdzOiBzdHJpbmdbXSwgbWV0aG9kQXJnczogc3RyaW5nW10pOiB2b2lkIHtcclxuXHJcbiAgICAgICAgLy9HZXQgYSB2YWxpZCB2YWx1ZSBmb3IgdGhlIGFyZ3VtZW50LCBmb3IgZXhhbXBsZSwgY2hlY2sgZm9yIHN0cmluZ3Mgd2l0aCB1bmNsb3NlZCBxdW90ZXNcclxuICAgICAgICBsZXQgZmluYWwgPSBIZWxwZXIuZ2V0UmVhbFZhbHVlc0luQXJndW1lbnRzKHtcclxuICAgICAgICAgICAgYXJnczogaHRtbEFyZ3MsXHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgbWV0aG9kOiBcImluaXQoKVwiXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vQ3JlYXRlIHRoZSBhcmd1bWVudCBvYmplY3RcclxuICAgICAgICBsZXQgYXJnc09iajogQXJndW1lbnRzT2JqZWN0ID0ge307XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSBpbiBtZXRob2RBcmdzKSBhcmdzT2JqW21ldGhvZEFyZ3NbaV1dID0gZmluYWxbaV07XHJcblxyXG4gICAgICAgIC8vLi4uYW5kIHBhc3MgaXQgdG8gdGhlIHVucGFyc2VkIGluaXQgZnVuY3Rpb25cclxuICAgICAgICB0aGlzLnBhcnNlSW5pdCh7XHJcbiAgICAgICAgICAgIGluaXQ6IHRoaXMuaW5pdCEsXHJcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3NPYmosXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgaW5pdCBmdW5jdGlvbiBhbmQgZXhlY3V0ZXMgaXRcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGluaXQgVGhlIHVucGFyc2VkIGluaXQgZnVuY3Rpb25cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIFRoZSBwYXJzZWQgY3VzdG9tIGFyZ3VtZW50c1xyXG4gICAgICogQHJldHVybnMgdGhlIGluaXQgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgcGFyc2VJbml0KGluaXQ6IEluaXQpOiBGdW5jdGlvbiB7XHJcblxyXG4gICAgICAgIGxldCBpbml0RnVuYzogc3RyaW5nID0gSGVscGVyLmNvbnRlbnRPZkZ1bmN0aW9uKGluaXQuaW5pdCk7XHJcblxyXG4gICAgICAgIC8vRmluZHMgdGhlIHJlYWwgYXJndW1lbnRzIGFuZCBubyBleHByZXNzaW9ucyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAgICBpZiAoaW5pdC5hcmdzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGluaXQuYXJncykuZm9yRWFjaCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RyOiBzdHJpbmcgPSBgKD88PSg9XFxcXHMpfChcXFxcKCl8KD0pKSgke2FyZ30pYDtcclxuICAgICAgICAgICAgICAgIGluaXRGdW5jID0gaW5pdEZ1bmMucmVwbGFjZShuZXcgUmVnRXhwKHN0ciwgXCJnXCIpLCBgJGFyZ3MuJHthcmd9YCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9DcmVhdGUgdGhlIG5ldyBwYXJzZWQgaW5pdCBmdW5jdGlvblxyXG4gICAgICAgIGxldCBuZXdGdW5jOiBGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbihcclxuICAgICAgICAgICAgXCJ7JHRoaXMgPSB1bmRlZmluZWQsICRhcmdzID0gdW5kZWZpbmVkfVwiLFxyXG4gICAgICAgICAgICBpbml0RnVuYyxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL1JldHVybiB0aGUgbmV3IGluaXQgZnVuY3Rpb24gYW5kIGV4ZWN1dGVzIGl0XHJcbiAgICAgICAgcmV0dXJuIG5ld0Z1bmMoe1xyXG4gICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgJGFyZ3M6IGluaXQuYXJncyxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IENoZXZlcmVFbGVtZW50LCBNZXRob2RUeXBlLCBEYXRhVHlwZSwgQ2hpbGQsIENoZXZlcmVFdmVudCwgUGFyc2VkRGF0YSwgU2VsZWN0b3JzIH0gZnJvbSBcIi4uL2ludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgQ2xpY2tBY3Rpb24sIFRleHRBY3Rpb24sIElucHV0QWN0aW9uIH0gZnJvbSBcIi4uL0FjdGlvbnMvSW5kZXhcIjtcclxuaW1wb3J0IENoZXZlcmVEYXRhIGZyb20gXCIuL0NoZXZlcmVEYXRhXCI7XHJcbmltcG9ydCB7IEhlbHBlciB9IGZyb20gXCIuLi91dGlscy9IZWxwZXJcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoZXZlcmVOb2RlIGltcGxlbWVudHMgQ2hldmVyZUVsZW1lbnQge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZGF0YTogRGF0YVR5cGU7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgbWV0aG9kcz86IE1ldGhvZFR5cGU7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgY2hpbGRzPzogQ2hpbGQgPSB7XHJcbiAgICAgICAgXCJkYXRhLWNsaWNrXCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS10ZXh0XCI6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1tb2RlbFwiOiBbXSxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZURhdGEsIGVsOiBFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucGFyc2VEYXRhKGRhdGEuZGF0YSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBQYXJzZSBhbGwgJHRoaXMsICRzZWxmLCAkZGF0YS4uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMubWV0aG9kcyA9IHRoaXMucGFyc2VNZXRob2RzKGRhdGEubWV0aG9kcyk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCB0aGUgcGFyZW50IGBkaXZgIGFuZCBnaXZlIGl0IGEgdmFsdWUgZm9yIHRoZSBkYXRhLWlkIGF0dHJpYnV0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBIZWxwZXIuc2V0RGF0YUlkKDEwKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCB0aGlzLmlkKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIEdldCB0aGUgZXZlbnRzIGFuZCBhY3Rpb25zIG9mIHRoZSBjb21wb25lbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNoZWNrRm9yQWN0aW9uc0FuZENoaWxkcygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgYWxsIHRoZSBkYXRhLCB0aGV5IG5lZWQgZ2V0dGVyIGFuZCBhIHNldHRlclxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIHByaW1pdGl2ZSBkYXRhXHJcbiAgICAgKi9cclxuICAgIHBhcnNlRGF0YShkYXRhOiBEYXRhVHlwZSkge1xyXG4gICAgICAgIGxldCBvYmo6IFtzdHJpbmcsIFBhcnNlZERhdGFdW10gPSBbXTtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICBvYmoucHVzaChbZCwgdGhpcy5wYXJzZWRPYmooZCwgZGF0YVtkXSldKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhvYmopO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VkIHRoZSBtZXRob2RzIGRlc2NyaWJlZCBpbiB0aGUgbWV0aG9kIHByb3BlcnR5IG9mIHRoZSBkYXRhXHJcbiAgICAgKiBAcGFyYW0ge01ldGhvZFR5cGV9IG1ldGhvZHNcclxuICAgICAqIEByZXR1cm5zIFRoZSBtZXRob2RzIHBhcnNlZFxyXG4gICAgICovXHJcbiAgICBwYXJzZU1ldGhvZHMobWV0aG9kcz86IE1ldGhvZFR5cGUpOiBNZXRob2RUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAobWV0aG9kcyA9PSB1bmRlZmluZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaCgobWV0aG9kKSA9PiB7XHJcbiAgICAgICAgICAgIC8vSWYgdGhlIG1ldGhvZCB3YXMgYWxyZWFkeSBwYXJzZWRcclxuICAgICAgICAgICAgbGV0IHdhc1BhcnNlZDogbnVtYmVyID0gbWV0aG9kc1ttZXRob2RdXHJcbiAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgLnNlYXJjaChcImFub255bW91c1wiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXNQYXJzZWQgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJzZWQ6IHN0cmluZyA9IG1ldGhvZHNbbWV0aG9kXVxyXG4gICAgICAgICAgICAgICAgICAgIC50b1N0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14uKnxbXFx9XSQvZywgXCJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5kYXRhKS5mb3JFYWNoKCh2YXJpYWJsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlZCA9IHBhcnNlZC5yZXBsYWNlQWxsKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGAkdGhpcy5kYXRhLiR7dmFyaWFibGV9LnZhbHVlYCxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIFwieyR0aGlzID0gdW5kZWZpbmVkfVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlZCxcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWV0aG9kc1ttZXRob2RdID0gbmV3RnVuYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gbWV0aG9kcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgYWxsIHRoZSBjaGlsZHJlbnMgdGhhdCBoYXZlIGFuIGFjdGlvbiBhbmQgZGF0YVxyXG4gICAgICovXHJcbiAgICBjaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKSB7XHJcbiAgICAgICAgY29uc3QgcGFyZW50U2VsZWN0b3I6IHN0cmluZyA9IGBkaXZbZGF0YS1pZD0ke3RoaXMuaWR9XSA+IGA7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsbCB0aGUgZWxlbWVudHMgc3VwcG9ydGVkIHdpdGggQ2hldmVyZXhcclxuICAgICAgICAgKiBAY29uc3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdCBzZWxlY3RvcnM6IFNlbGVjdG9ycyA9IHtcclxuICAgICAgICAgICAgYnV0dG9uczogdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRTZWxlY3RvciArIFwiYnV0dG9uW2RhdGEtY2xpY2tdXCIsXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgIHRleHQ6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgcGFyZW50U2VsZWN0b3IgKyBcIipbZGF0YS10ZXh0XVwiLFxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBpbnB1dHM6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgcGFyZW50U2VsZWN0b3IgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbZGF0YS1tb2RlbF1bdHlwZT10ZXh0XSxcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50U2VsZWN0b3IgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwidGV4dGFyZWFbZGF0YS1tb2RlbF1cIixcclxuICAgICAgICAgICAgKSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvL0J1dHRvbnNcclxuICAgICAgICBpZiAoc2VsZWN0b3JzLmJ1dHRvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdG9ycy5idXR0b25zLmZvckVhY2goKGJ1dHRvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xpY2sgPSBuZXcgQ2xpY2tBY3Rpb24oe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGJ1dHRvbixcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLWNsaWNrXCJdLnB1c2goY2xpY2spO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vRGF0YS10ZXh0XHJcbiAgICAgICAgaWYgKHNlbGVjdG9ycy50ZXh0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxlY3RvcnMudGV4dC5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eHQgPSBuZXcgVGV4dEFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogdGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0ucHVzaCh0eHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vVGV4dCBJbnB1dHMgd2l0aCBtb2RlbFxyXG4gICAgICAgIGlmIChzZWxlY3RvcnMuaW5wdXRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxlY3RvcnMuaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnAgPSBuZXcgSW5wdXRBY3Rpb24oe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGlucHV0LFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl0ucHVzaChpbnApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcGFyc2VkIGRhdGEsIHdpdGggdGhlIGdldHRlciBhbmQgc2V0dGVyXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgb2YgdGhlIHVucGFyc2VkIGRhdGEgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoYXQgcHJvcGVydHlcclxuICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgZGF0YVxyXG4gICAgICovXHJcbiAgICBwYXJzZWRPYmoobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogUGFyc2VkRGF0YSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5vbWJyZTogbmFtZSxcclxuICAgICAgICAgICAgX3ZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vVGhlcmUncyBhIHdlaXJkIGRlbGF5IHdoZW4geW91IHRyeSB0byBzeW5jIGFsbCBpbnB1dHMsIEkgZG9uJ3Qga25vdyB3aHlcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0uZmlsdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAodGV4dCkgPT4gdGV4dC5fdmFyaWFibGUubm9tYnJlID09IHRoaXMubm9tYnJlLFxyXG4gICAgICAgICAgICAgICAgICAgICkuZm9yRWFjaCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0LnNldFRleHQodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU3luYyB0ZXh0IHdpdGggYWxsIGlucHV0cyB0aGF0IGhhdmUgdGhpcyB2YXJpYWJsZSBhcyBtb2RlbCBpbiB0aGVpciAnZGF0YS1tb2RlbCcgYXR0cmlidXRlXHJcbiAgICAgICAgICAgICAgICBzZWxmLmNoaWxkcyFbXCJkYXRhLW1vZGVsXCJdLmZpbHRlcihcclxuICAgICAgICAgICAgICAgICAgICAoaW5wdXQpID0+IGlucHV0LnZhcmlhYmxlID09IHRoaXMubm9tYnJlLFxyXG4gICAgICAgICAgICAgICAgKS5mb3JFYWNoKChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0LmFzc2lnblRleHQodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0IHZhbHVlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgYSBjdXN0b20gZXZlbnQgaW4gdGhlIHNjb3BlIG9mIHRoZSBkYXRhLWF0dGFjaGVkXHJcbiAgICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHR5cGUsIHRoZSBlbGVtZW50LCBhbmQgdGhlIGZ1bmN0aW9uIHdpdGhvdXQgZXhlY3V0aW5nXHJcbiAgICAgKi9cclxuICAgIHNldEV2ZW50KGV2ZW50OiBDaGV2ZXJlRXZlbnQpIHtcclxuICAgICAgICBldmVudC5lbGVtLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQudHlwZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBldmVudC5hY3Rpb24oe1xyXG4gICAgICAgICAgICAgICAgJHRoaXM6IHRoaXMsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZVdpbmRvdywgUGFyc2VkQXJncywgQ2hldmVyZU5vZGVEYXRhIH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xuaW1wb3J0IENoZXZlcmVOb2RlIGZyb20gXCIuL2NoZXZlcmUvQ2hldmVyZU5vZGVcIjtcbmltcG9ydCBDaGV2ZXJlRGF0YSBmcm9tIFwiLi9jaGV2ZXJlL0NoZXZlcmVEYXRhXCI7XG5pbXBvcnQgeyBIZWxwZXIgfSBmcm9tIFwiLi91dGlscy9IZWxwZXJcIjtcblxuY29uc3QgQ2hldmVyZTogQ2hldmVyZVdpbmRvdyA9IHtcbiAgIG5vZGVzOiBbXSxcbiAgIC8qKlxuICAgICogRmluZCBhIENoZXZlcmVEYXRhIGJ5IHRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtYXR0YWNoZWQnIGF0dHJpYnV0ZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJcbiAgICAqIEBwYXJhbSB7Q2hldmVyZURhdGFbXX0gZGF0YVxuICAgICogQHJldHVybnMgVGhlIGRhdGEgcmVhZHkgZm9yIGluc3RhbmNlIGEgQ2hldmVyZXhOb2RlXG4gICAgKi9cbiAgIGZpbmRJdHNEYXRhKGF0dHI6IHN0cmluZywgZGF0YTogQ2hldmVyZURhdGFbXSk6IENoZXZlcmVEYXRhIHtcbiAgICAgICBsZXQgc2VhcmNoOiBDaGV2ZXJlRGF0YSB8IHVuZGVmaW5lZCA9IGRhdGEuZmluZChcbiAgICAgICAgICAgKGQpID0+IGQubmFtZSA9PSBhdHRyLnJlcGxhY2UoL1xcKC4qXFwpLywgXCJcIiksXG4gICAgICAgKTtcblxuICAgICAgIGlmIChzZWFyY2ggPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgICAgICBgJyR7YXR0cn0nIGNvdWxkbid0IGJlIGZvdW5kIGluIGFueSBvZiB5b3VyIGRlY2xhcmVkIGNvbXBvbmVudHNgLFxuICAgICAgICAgICApO1xuICAgICAgIGVsc2UgcmV0dXJuIHNlYXJjaDtcbiAgIH0sXG4gICAvKipcbiAgICAqIFNlYXJjaCBmb3IgQ2hldmVyZSBOb2RlcyBhdCB0aGUgc2l0ZVxuICAgICogQHBhcmFtIGRhdGEgQWxsIHRoZSBDaGV2ZXJlIGNvbXBvbmVudHNcbiAgICAqL1xuICAgc3RhcnQoLi4uZGF0YTogQ2hldmVyZURhdGFbXSk6IHZvaWQge1xuICAgICAgIGxldCBbLi4ucHJvcHNdID0gZGF0YTtcbiAgICAgICBjb25zdCBlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PiA9XG4gICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZbZGF0YS1hdHRhY2hlZF1cIik7XG5cbiAgICAgICAvL0NyZWF0ZSBhIENoZXZlcmVOb2RlIGZvciBlYWNoIGRhdGEtYXR0YWNoZWRcbiAgICAgICBlbGVtZW50cy5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICBsZXQgZGF0YUF0dGFjaGVkQXR0cjogc3RyaW5nID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1hdHRhY2hlZFwiKSE7XG5cbiAgICAgICAgICAgY29uc3QgZ2V0RGF0YTogQ2hldmVyZURhdGEgPSB0aGlzLmZpbmRJdHNEYXRhKGRhdGFBdHRhY2hlZEF0dHIsIHByb3BzKTtcblxuICAgICAgICAgICAvL0lmIHRoZSBpbml0IG1ldGhvZCBpc24ndCB1bmRlZmluZWRcbiAgICAgICAgICAgaWYoZ2V0RGF0YS5pbml0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgLy9DaGVjayBmb3IgYXJndW1lbnRzXG4gICAgICAgICAgICAgICBsZXQgaW5pdEFyZ3M6IFBhcnNlZEFyZ3MgPSBIZWxwZXIubWV0aG9kQXJndW1lbnRzKGdldERhdGEuaW5pdCk7XG4gICAgICAgICAgICAgICBsZXQgSFRNTEFyZ3M6IFBhcnNlZEFyZ3MgPSBIZWxwZXIuaHRtbEFyZ3NEYXRhQXR0cihkYXRhQXR0YWNoZWRBdHRyKTtcblxuICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgKiBDaGVjayB0aGUgZGlmZiBiZXR3ZWVuIHRoZSBhcnVtZW50cyBhdCB0aGUgSFRNTCBhbmQgdGhvc2Ugb25lcyBkZWNsYXJlZCBhdCBcbiAgICAgICAgICAgICAgICAqIHRoZSBpbml0KCkgbWV0aG9kXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgIGxldCBjaGVja0ZvckluaXRBcmd1bWVudHM6IGJvb2xlYW4gPSBIZWxwZXIuY29tcGFyZUFyZ3VtZW50cyh7XG4gICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBnZXREYXRhLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcImluaXQoKVwiLFxuICAgICAgICAgICAgICAgICAgIGh0bWxBcmdzOiBIVE1MQXJncyxcbiAgICAgICAgICAgICAgICAgICBtZXRob2RBcmdzOiBpbml0QXJnc1xuICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgIC8vSWYgdGhlcmUncyBubyBlcnJvcnMsIHBhcnNlIHRoZSBhcmd1bWVudHMsIGFuZCBleGVjdXRlIHRoZSBpbml0KCkgbWV0aG9kXG4gICAgICAgICAgICAgICBpZihjaGVja0ZvckluaXRBcmd1bWVudHMpIGdldERhdGEucGFyc2VBcmd1bWVudHMoSFRNTEFyZ3MhLCBpbml0QXJncyEpO1xuICAgICAgICAgICAgICAgZWxzZSBnZXREYXRhLnBhcnNlSW5pdCh7XG4gICAgICAgICAgICAgICAgICAgaW5pdDogZ2V0RGF0YS5pbml0XG4gICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgfTtcbiAgICAgICBcbiAgICAgICAgICAgbGV0IG5vZGUgPSBuZXcgQ2hldmVyZU5vZGUoZ2V0RGF0YSwgZWwpO1xuXG4gICAgICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcbiAgICAgICB9KTtcbiAgIH0sXG4gICBkYXRhKGRhdGE6IENoZXZlcmVOb2RlRGF0YSk6IENoZXZlcmVEYXRhIHtcbiAgICAgICByZXR1cm4gbmV3IENoZXZlcmVEYXRhKGRhdGEpO1xuICAgfSxcbn07XG5cbndpbmRvdy5DaGV2ZXJlID0gQ2hldmVyZTsiLCJpbXBvcnQgeyBBcmdzRXJyb3JzLCBDb21wYXJlQXJndW1lbnRzLCBQYXJzZWRBcmdzIH0gZnJvbSBcIi4uL2ludGVyZmFjZXNcIjtcclxuXHJcbi8qKlxyXG4gKiBIZWxwZXIgY2xhc3MsIGl0IHByb3ZpZGUgdXNlZnVsbCBtZXRob2RzIHRvIENoZXZlcmUgZWxlbWVudHNcclxuICogQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgSGVscGVyID0ge1xyXG4gICAgc2V0RGF0YUlkKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgZmluYWw6IHN0cmluZyA9IFwiXCI7XHJcblxyXG4gICAgICAgIGNvbnN0IHJvdW5kZWQ6IEZ1bmN0aW9uID0gKG51bTogbnVtYmVyKTogbnVtYmVyID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG51bSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNoYXJzOiB7IFt0eXBlOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcclxuICAgICAgICAgICAgbGV0dGVycyA6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcclxuICAgICAgICAgICAgbWF5dXMgICA6IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcIixcclxuICAgICAgICAgICAgbnVtYmVycyA6IFwiMDEyMzQ1Njc4OVwiLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBya2V5OiBzdHJpbmcgPSBPYmplY3Qua2V5cyhjaGFycylbcm91bmRlZCgyKV07XHJcbiAgICAgICAgICAgIGZpbmFsICs9IGNoYXJzW3JrZXldW3JvdW5kZWQobGVuZ3RoKV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9LFxyXG4gICAgY2hlY2tGb3JFcnJvckluVmFyaWFibGUoc3RyOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwYXR0ZXJuOiBSZWdFeHAgPSAvXlswLTldfFxccy9nO1xyXG5cclxuICAgICAgICBpZiAocGF0dGVybi50ZXN0KHN0cikpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcclxuICAgICAgICAgICAgICAgIFwiVmFyaWFibGUgbmFtZSBjYW5ub3Qgc3RhcnQgd2l0aCBhIG51bWJlciBvciBoYXZlIHNwYWNlc1wiLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgfSxcclxuICAgIGh0bWxBcmdzRGF0YUF0dHIoZGF0YUF0dGFjaGVkOiBzdHJpbmcpOiBQYXJzZWRBcmdzIHtcclxuICAgICAgICBsZXQgb25seUF0dHJzOiBzdHJpbmcgPSBkYXRhQXR0YWNoZWQucmVwbGFjZSgvXihcXHcrXFwoKXxcXCkrJC9nLCBcIlwiKS5yZXBsYWNlKFwiIFwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChvbmx5QXR0cnMpID8gb25seUF0dHJzLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICBtZXRob2RBcmd1bWVudHMobWV0aG9kOiBGdW5jdGlvbik6IFBhcnNlZEFyZ3Mge1xyXG4gICAgICAgIGxldCBvbmx5QXJnczogc3RyaW5nID0gbWV0aG9kLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcey4qL2dzLCBcIlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxzL2csIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eKFxcdytcXCgpfFxcKSskL2csIFwiXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gKG9ubHlBcmdzKSA/IG9ubHlBcmdzLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZDsgICAgICAgICAgICBcclxuICAgIH0sXHJcbiAgICBnZXRSZWFsVmFsdWVzSW5Bcmd1bWVudHMoZGF0YTogQXJnc0Vycm9ycyk6IGFueVtdIHtcclxuICAgICAgICBsZXQgZmluYWw6IGFueVtdID0gZGF0YS5hcmdzLm1hcCgoYXJnKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAvL1RyeSBnZXQgYSB2YWxpZCB2YWx1ZVxyXG4gICAgICAgICAgICBjb25zdCBmdW5jOiBGdW5jdGlvbiA9ICgpOiBGdW5jdGlvbiA9PiBuZXcgRnVuY3Rpb24oYHJldHVybiAke2FyZ31gKTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmdW5jKCkoKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICAgICBgJHtlcnJvcn0sIGNoZWNrIHRoZSB2YWx1ZXMgb2YgeW91ciAke2RhdGEubWV0aG9kfSwgYXQgb25lIG9mIHlvdXIgJyR7ZGF0YS5uYW1lfScgY29tcG9uZW50c2AsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1JldHVybiB0aGUgdmFsdWVcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmMoKSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9LFxyXG4gICAgY29tcGFyZUFyZ3VtZW50cyhkYXRhOiBDb21wYXJlQXJndW1lbnRzKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGVycm9yUHJlOiBzdHJpbmcgPSBgVGhlICR7ZGF0YS5tZXRob2R9IGZ1bmN0aW9uIG9mIHRoZSAke2RhdGEuY29tcG9uZW50fSgpIGNvbXBvbmVudCBgOyAgICAgICAgXHJcblxyXG4gICAgICAgIHN3aXRjaCh0cnVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgKCghZGF0YS5odG1sQXJncykgJiYgKCFkYXRhLm1ldGhvZEFyZ3MpKToge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoZGF0YS5odG1sQXJncyAhPSB1bmRlZmluZWQpICYmICghZGF0YS5tZXRob2RBcmdzKSk6IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclByZSArIGBkb2Vzbid0IHJlY2VpdmUgYW55IHBhcmFtZXRlcmApO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoIWRhdGEuaHRtbEFyZ3MpICYmIChkYXRhLm1ldGhvZEFyZ3MgIT0gdW5kZWZpbmVkKSk6IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclByZSArIGBuZWVkcyB0byByZWNlaXZlICR7ZGF0YS5tZXRob2RBcmdzfSBwYXJhbWV0ZXJzLCAwIHBhc3NlZGApO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlICgoZGF0YS5tZXRob2RBcmdzPy5sZW5ndGgpICE9IChkYXRhLmh0bWxBcmdzPy5sZW5ndGgpKToge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yUHJlICsgYG5lZWRzIHRvIHJlY2VpdmUgICR7ZGF0YS5tZXRob2RBcmdzPy5sZW5ndGh9IHBhcmFtZXRlcnMsIFxyXG4gICAgICAgICAgICAgICAgICAgICR7ZGF0YS5odG1sQXJncz8ubGVuZ3RofSBwYXNzZWRgKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb250ZW50T2ZGdW5jdGlvbihmdW5jOiBGdW5jdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmMudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvKF5cXHcuKlxceykvZ3MsIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXH0kLywgXCJcIilcclxuICAgICAgICAgICAgLnRyaW0oKTtcclxuICAgIH1cclxufTtcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3RzL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9