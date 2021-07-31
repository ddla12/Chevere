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
const Chevere_1 = __webpack_require__(/*! ../Chevere */ "./src/ts/Chevere.ts");
class TextAction {
    constructor(data) {
        this.element = data.element;
        this.element.setAttribute("data-id", Chevere_1.Helper.setId(10));
        this.parent = data.parent;
        this.variable = this.element.getAttribute("data-text");
        this.element.textContent = this._variable.value;
    }
    setText(value) {
        this.element.textContent = value.toString();
    }
    set variable(attr) {
        Chevere_1.Helper.checkForError(attr);
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
        this.element.setAttribute("data-id", Chevere_1.Helper.setId(10));
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
        Chevere_1.Helper.checkForError(attr);
        let variable = Object.keys(this.parent.data).find((data) => data == attr);
        if (!variable)
            throw new ReferenceError(`There's no a '${attr}' variable in the data-attached scope`);
        return variable;
    }
}
exports.InputAction = InputAction;


/***/ }),

/***/ "./src/ts/Chevere.ts":
/*!***************************!*\
  !*** ./src/ts/Chevere.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Chevere = exports.ChevereNode = exports.ChevereData = exports.Helper = void 0;
const Index_1 = __webpack_require__(/*! ./Actions/Index */ "./src/ts/Actions/Index.ts");
/**
 * Helper class for the CheverexNodes and Cheverex childs
 * @class
 * @constructor
 */
exports.Helper = {
    setId(length) {
        let final = "";
        const chars = {
            letters: "abcdefghijklmnopqrstuvwxyz",
            mayus: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            numbers: "0123456789",
        };
        for (let i = 0; i <= length; i++) {
            let rkey = Object.keys(chars)[Math.floor(Math.random() * 2)];
            final += chars[rkey][Math.floor(Math.random() * length)];
        }
        return final;
    },
    checkForError(str) {
        const pattern = /^[0-9]|\s/g;
        if (pattern.test(str))
            throw new SyntaxError("Variable name cannot start with a number or have spaces");
    },
};
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
     * Parse the custom arguments that are in the data-attached attribute
     * @param {string} args The arguments of de data-attached attribute
     */
    parseArguments(args) {
        //The arguments described in the HTML tag
        let htmlArgs = args
            .trim()
            .replace(/^\w*\(/, "")
            .replace(/\)$/, "")
            .split(",");
        if (this.init == undefined && htmlArgs[0] != "")
            throw new Error(`There's not a init() method defined in your ${this.name} component`);
        if (this.init == undefined)
            return;
        //The arguments of the init function defined in your data
        let parsedArgs = this.init
            ?.toString()
            .replace(/\{.*/gs, "")
            .replace("init(", "")
            .replace(")", "")
            .replaceAll(" ", "")
            .split(",");
        if (parsedArgs[0] == "" && htmlArgs[0] != "") {
            throw new Error(`The init() function of the ${this.name}() component doesn't receive any parameter`);
        }
        if (parsedArgs.length != htmlArgs.length) {
            throw new Error(`The init() function of the ${this.name}() component needs to receive 
            ${parsedArgs.length} parameters, ${htmlArgs.length} passed`);
        }
        if (parsedArgs[0] != "" && htmlArgs[0] == "") {
            throw new Error(`The init() function of the ${this.name}() component needs to receive 
            ${parsedArgs.length} parameters, ${htmlArgs.length - 1} passed`);
        }
        if (parsedArgs[0] == "") {
            this.parseInit({
                init: this.init,
            });
            return;
        }
        //Get a valid value for the argument, for example, check for strings with unclosed quotes
        let final = htmlArgs.map((arg) => {
            const n = this.name;
            let name = parsedArgs[htmlArgs.indexOf(arg)];
            //Try get a valid value
            function func() {
                return new Function(`return ${arg}`);
            }
            try {
                func()();
            }
            catch (error) {
                throw new Error(`${error}, check the arguments of one of your '${n}' components`);
            }
            //Return the value
            return [name, func()()];
        });
        //Create the arguments...
        let data = Object.fromEntries(final);
        //...and pass it to the unparsed init function
        this.parseInit({
            init: this.init,
            args: data,
        });
    }
    /**
     * Parse the init function and executes it
     * @param {Function} init The unparsed init function
     * @param {object} args The parsed custom arguments
     * @returns the init function
     */
    parseInit(init) {
        //Quit curly braces
        let func = init.init
            .toString()
            .replace(/\w.*\{/, "")
            .replace(/\}$/, "");
        //Finds the real arguments and no expressions with the same name
        if (init.args) {
            Object.keys(init.args).forEach((arg) => {
                let str = `(?<=(=\\s)|(\\()|(=))(${arg})`;
                func = func.replace(new RegExp(str, "g"), `$args.${arg}`);
            });
        }
        //Create the new parsed init function
        let newFunc = new Function("{$this = undefined, $args = undefined}", func);
        //Return the new init function and executes it
        return newFunc({
            $this: this,
            $args: init.args,
        });
    }
}
exports.ChevereData = ChevereData;
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
         * Get the parent `div` and give it an id
         */
        this.element = el;
        this.id = exports.Helper.setId(10);
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
                let newFunc = new Function("{$this = undefined, $data = undefined}", parsed);
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
exports.ChevereNode = ChevereNode;
/**
 *  The main Chevere object, it initializes the Chevere framework
 *  @const
 */
exports.Chevere = {
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
            const dataAttr = el.getAttribute("data-attached");
            let getData = this.findItsData(dataAttr, props);
            getData.parseArguments(dataAttr);
            let node = new ChevereNode(getData, el);
            this.nodes.push(node);
        });
    },
    data(data) {
        return new ChevereData(data);
    },
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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
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
const Chevere_1 = __webpack_require__(/*! ./Chevere */ "./src/ts/Chevere.ts");
window.Chevere = Chevere_1.Chevere;

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDO1FBRXBELDZDQUE2QztRQUM3QyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDcEIsTUFBTSxRQUFRLEdBQVcsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUUsQ0FBQztZQUUzRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVoRCxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWpDLElBQUksSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUV4QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxJQUFJLENBQUMsSUFBcUI7UUFDdEIsT0FBTyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0osQ0FBQzs7Ozs7OztVQzdhRjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7Ozs7QUN0QkEsOEVBQW9DO0FBRXBDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQU8sQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NoZXZlcmUvLi9zcmMvdHMvQWN0aW9ucy9JbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL0NoZXZlcmUudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jaGV2ZXJlLy4vc3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoZXZlcmVOb2RlLCBIZWxwZXIgfSBmcm9tIFwiLi4vQ2hldmVyZVwiO1xuaW1wb3J0IHsgQ2xpY2ssIFRleHRSZWxhdGlvbiwgSW5wdXRNb2RlbCB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XG5cbmV4cG9ydCBjbGFzcyBUZXh0QWN0aW9uIGltcGxlbWVudHMgVGV4dFJlbGF0aW9uIHtcbiAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XG4gICAgX3ZhcmlhYmxlPzogYW55O1xuXG4gICAgY29uc3RydWN0b3IoZGF0YTogVGV4dFJlbGF0aW9uKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGRhdGEuZWxlbWVudDtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldElkKDEwKSk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQgPSBkYXRhLnBhcmVudDtcblxuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKSE7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5fdmFyaWFibGUudmFsdWU7XG4gICAgfVxuXG4gICAgc2V0VGV4dCh2YWx1ZTogYW55KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc2V0IHZhcmlhYmxlKGF0dHI6IHN0cmluZykge1xuICAgICAgICBIZWxwZXIuY2hlY2tGb3JFcnJvcihhdHRyKTtcblxuICAgICAgICBjb25zdCBhcnJBdHRyOiBzdHJpbmcgPSBhdHRyLnNwbGl0KFwiLlwiKS5zcGxpY2UoMSkuam9pbihcIi5cIik7XG5cbiAgICAgICAgY29uc3QgY3VzdG9tT2JqQXR0ciA9IGF0dHIucmVwbGFjZSgvXFwuLiovLCBgYCk7XG5cbiAgICAgICAgbGV0IHBhcmVudFZhciA9IE9iamVjdC5rZXlzKHRoaXMucGFyZW50LmRhdGEpLmZpbmQoXG4gICAgICAgICAgICAoZCkgPT4gZCA9PSBjdXN0b21PYmpBdHRyLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICghcGFyZW50VmFyKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgIGBUaGUgdmFyaWFibGUgb3IgbWV0aG9kIG5hbWVkICcke3BhcmVudFZhcn0nIHdhc24ndCBmb3VuZCBvbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGlmIChhcnJBdHRyID09PSBcIlwiKSB0aGlzLl92YXJpYWJsZSA9IHRoaXMucGFyZW50LmRhdGFbcGFyZW50VmFyXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgYXJyOiBzdHJpbmdbXSA9IGFyckF0dHIuc3BsaXQoXCIuXCIpO1xuICAgICAgICAgICAgbGV0IGxhc3Q6IHN0cmluZyA9IGFyclthcnIubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSBhcnIubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgLy9GaW5kIHRoZSBuZXN0ZWQgcHJvcGVydHkgYnkgcmVjdXJzaXZpdHlcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZpbmRQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICBvYmo6IGFueSxcbiAgICAgICAgICAgICAgICBrZXk6IGFueSxcbiAgICAgICAgICAgICAgICBwb3M6IG51bWJlcixcbiAgICAgICAgICAgICAgICBuZXN0ZWQ6IG51bWJlcixcbiAgICAgICAgICAgICk6IGFueSB7XG4gICAgICAgICAgICAgICAgaWYgKG5lc3RlZCA9PSBsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSByZXR1cm4gb2JqW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgVGhlcmUncyBubyBhICcke2tleX0nIHByb3BlcnR5IGluIHRoZSAnJHtvYmp9JyBwcm9wZXJ0eSwgIHRoZSAke3BhcmVudFZhcn1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmluZFByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW2Fycltwb3NdXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGVkICsgMSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBleGlzdHMgPSBmaW5kUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVtwYXJlbnRWYXJdLnZhbHVlLFxuICAgICAgICAgICAgICAgIGxhc3QsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coZXhpc3RzKTtcbiAgICAgICAgICAgIGlmICghZXhpc3RzKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFRoZSBwcm9wZXJ0eSBuYW1lZCAnJHthcnJBdHRyfScgd2Fzbid0IGZvdW5kIG9uIHRoZSAnJHtwYXJlbnRWYXJ9JyBkYXRhYCxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB0aGlzLl92YXJpYWJsZSA9IGV4aXN0cztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENsaWNrQWN0aW9uIGltcGxlbWVudHMgQ2xpY2sge1xuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcbiAgICBtZXRob2Q/OiBGdW5jdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKGNsaWNrOiBDbGljaykge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBjbGljay5lbGVtZW50IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBIZWxwZXIuc2V0SWQoMTApKTtcblxuICAgICAgICB0aGlzLnBhcmVudCA9IGNsaWNrLnBhcmVudDtcblxuICAgICAgICB0aGlzLm1ldGhvZCA9IHRoaXMuc2VhcmNoTWV0aG9kKCk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQ/LnNldEV2ZW50KHtcbiAgICAgICAgICAgIGVsZW06IHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgIGFjdGlvbjogdGhpcy5tZXRob2QhLFxuICAgICAgICAgICAgdHlwZTogXCJjbGlja1wiLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZWFyY2hNZXRob2QoKTogRnVuY3Rpb24ge1xuICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtY2xpY2tcIikhO1xuXG4gICAgICAgIGxldCBzYW5pdGl6ZWQ6IHN0cmluZyA9IGF0dHIucmVwbGFjZShcIigpXCIsIFwiXCIpO1xuXG4gICAgICAgIGxldCBtZXRob2Q6IEZ1bmN0aW9uID0gdGhpcy5wYXJlbnQubWV0aG9kcyFbc2FuaXRpemVkXTtcblxuICAgICAgICBpZiAoIW1ldGhvZClcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcbiAgICAgICAgICAgICAgICBgVGhlcmUncyBubyBtZXRob2QgJHthdHRyfSBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBtZXRob2Q7XG4gICAgfVxufVxuXG4vKipcbiAqIFRoZSBjbGFzcyBmb3IgdGhvc2UgaW5wdXRzIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgYGRhdGEtbW9kZWxgIGF0dHJpYnV0ZVxuICogIEBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgSW5wdXRBY3Rpb24gaW1wbGVtZW50cyBJbnB1dE1vZGVsIHtcbiAgICBlbGVtZW50OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgSFRNTElucHV0RWxlbWVudDtcbiAgICBwYXJlbnQ6IENoZXZlcmVOb2RlO1xuICAgIHZhcmlhYmxlOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihpbnB1dDogSW5wdXRNb2RlbCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IGlucHV0LnBhcmVudDtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gaW5wdXQuZWxlbWVudCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXG4gICAgICAgIC8vU2VhcmNoIGlmIHRoZSBpbmRpY2F0ZWQgdmFyaWFibGUgb2YgdGhlIGRhdGEtbW9kZWwgYXR0cmlidXRlIGV4aXN0cyBpbiB0aGUgc2NvcGVcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZ2V0VmFyaWFibGUoKTtcblxuICAgICAgICAvL1NldCB0aGUgZGVmYXVsdCB2YWx1ZVxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdLnZhbHVlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgLy9BZGQgdGhlIGxpc3RlbmVyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zeW5jVGV4dCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3NpZ25UZXh0KHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzeW5jVGV4dCgpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZSA9IHRoaXMuZWxlbWVudC52YWx1ZS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGdldFZhcmlhYmxlKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBhdHRyID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtbW9kZWxcIikhO1xuXG4gICAgICAgIEhlbHBlci5jaGVja0ZvckVycm9yKGF0dHIpO1xuXG4gICAgICAgIGxldCB2YXJpYWJsZSA9IE9iamVjdC5rZXlzKHRoaXMucGFyZW50LmRhdGEpLmZpbmQoXG4gICAgICAgICAgICAoZGF0YSkgPT4gZGF0YSA9PSBhdHRyLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICghdmFyaWFibGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgICAgICAgYFRoZXJlJ3Mgbm8gYSAnJHthdHRyfScgdmFyaWFibGUgaW4gdGhlIGRhdGEtYXR0YWNoZWQgc2NvcGVgLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdmFyaWFibGU7XG4gICAgfVxufSIsImltcG9ydCB7XG4gICAgQ2hldmVyZUV2ZW50LFxuICAgIENoZXZlcmVOb2RlRGF0YSxcbiAgICBDaGV2ZXJlV2luZG93LFxuICAgIENoaWxkLFxuICAgIERhdGFUeXBlLFxuICAgIEluaXQsXG4gICAgTWV0aG9kVHlwZSxcbiAgICBQYXJzZWREYXRhLFxuICAgIFNlbGVjdG9ycyxcbn0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xuaW1wb3J0IHsgQ2hldmVyZUVsZW1lbnQgfSBmcm9tIFwiLi9pbnRlcmZhY2VzXCI7XG5pbXBvcnQgeyBDbGlja0FjdGlvbiwgVGV4dEFjdGlvbiwgSW5wdXRBY3Rpb24gfSBmcm9tIFwiLi9BY3Rpb25zL0luZGV4XCI7XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciB0aGUgQ2hldmVyZXhOb2RlcyBhbmQgQ2hldmVyZXggY2hpbGRzXG4gKiBAY2xhc3NcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgY29uc3QgSGVscGVyID0ge1xuICAgIHNldElkKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGZpbmFsOiBzdHJpbmcgPSBcIlwiO1xuXG4gICAgICAgIGNvbnN0IGNoYXJzOiB7IFt0eXBlOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcbiAgICAgICAgICAgIGxldHRlcnM6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcbiAgICAgICAgICAgIG1heXVzOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXG4gICAgICAgICAgICBudW1iZXJzOiBcIjAxMjM0NTY3ODlcIixcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IHJrZXk6IHN0cmluZyA9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoY2hhcnMpW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXTtcbiAgICAgICAgICAgIGZpbmFsICs9IGNoYXJzW3JrZXldW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbmd0aCldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpbmFsO1xuICAgIH0sXG4gICAgY2hlY2tGb3JFcnJvcihzdHI6IHN0cmluZykge1xuICAgICAgICBjb25zdCBwYXR0ZXJuOiBSZWdFeHAgPSAvXlswLTldfFxccy9nO1xuXG4gICAgICAgIGlmIChwYXR0ZXJuLnRlc3Qoc3RyKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgICBcIlZhcmlhYmxlIG5hbWUgY2Fubm90IHN0YXJ0IHdpdGggYSBudW1iZXIgb3IgaGF2ZSBzcGFjZXNcIixcbiAgICAgICAgICAgICk7XG4gICAgfSxcbn07XG5cbi8qKlxuICogIFRoZSBjbGFzcyB0aGF0IHVzZXJzIGNyZWF0ZSB0aGVpciBjb21wb25lbnRzXG4gKiAgQGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGV2ZXJlRGF0YSBpbXBsZW1lbnRzIENoZXZlcmVOb2RlRGF0YSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGRhdGE6IERhdGFUeXBlO1xuICAgIGluaXQ/OiBGdW5jdGlvbjtcbiAgICBtZXRob2RzPzogTWV0aG9kVHlwZTtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVOb2RlRGF0YSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGEuZGF0YTtcbiAgICAgICAgdGhpcy5pbml0ID0gZGF0YS5pbml0O1xuICAgICAgICB0aGlzLm1ldGhvZHMgPSBkYXRhLm1ldGhvZHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFyc2UgdGhlIGN1c3RvbSBhcmd1bWVudHMgdGhhdCBhcmUgaW4gdGhlIGRhdGEtYXR0YWNoZWQgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFyZ3MgVGhlIGFyZ3VtZW50cyBvZiBkZSBkYXRhLWF0dGFjaGVkIGF0dHJpYnV0ZVxuICAgICAqL1xuICAgIHBhcnNlQXJndW1lbnRzKGFyZ3M6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICAvL1RoZSBhcmd1bWVudHMgZGVzY3JpYmVkIGluIHRoZSBIVE1MIHRhZ1xuICAgICAgICBsZXQgaHRtbEFyZ3MgPSBhcmdzXG4gICAgICAgICAgICAudHJpbSgpXG4gICAgICAgICAgICAucmVwbGFjZSgvXlxcdypcXCgvLCBcIlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcKSQvLCBcIlwiKVxuICAgICAgICAgICAgLnNwbGl0KFwiLFwiKTtcblxuICAgICAgICBpZiAodGhpcy5pbml0ID09IHVuZGVmaW5lZCAmJiBodG1sQXJnc1swXSAhPSBcIlwiKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBUaGVyZSdzIG5vdCBhIGluaXQoKSBtZXRob2QgZGVmaW5lZCBpbiB5b3VyICR7dGhpcy5uYW1lfSBjb21wb25lbnRgLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5pbml0ID09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vVGhlIGFyZ3VtZW50cyBvZiB0aGUgaW5pdCBmdW5jdGlvbiBkZWZpbmVkIGluIHlvdXIgZGF0YVxuICAgICAgICBsZXQgcGFyc2VkQXJncyA9IHRoaXMuaW5pdFxuICAgICAgICAgICAgPy50b1N0cmluZygpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFx7LiovZ3MsIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZShcImluaXQoXCIsIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZShcIilcIiwgXCJcIilcbiAgICAgICAgICAgIC5yZXBsYWNlQWxsKFwiIFwiLCBcIlwiKVxuICAgICAgICAgICAgLnNwbGl0KFwiLFwiKSE7XG5cbiAgICAgICAgaWYgKHBhcnNlZEFyZ3NbMF0gPT0gXCJcIiAmJiBodG1sQXJnc1swXSAhPSBcIlwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFRoZSBpbml0KCkgZnVuY3Rpb24gb2YgdGhlICR7dGhpcy5uYW1lfSgpIGNvbXBvbmVudCBkb2Vzbid0IHJlY2VpdmUgYW55IHBhcmFtZXRlcmAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcnNlZEFyZ3MubGVuZ3RoICE9IGh0bWxBcmdzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgaW5pdCgpIGZ1bmN0aW9uIG9mIHRoZSAke3RoaXMubmFtZX0oKSBjb21wb25lbnQgbmVlZHMgdG8gcmVjZWl2ZSBcbiAgICAgICAgICAgICR7cGFyc2VkQXJncy5sZW5ndGh9IHBhcmFtZXRlcnMsICR7aHRtbEFyZ3MubGVuZ3RofSBwYXNzZWRgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJzZWRBcmdzWzBdICE9IFwiXCIgJiYgaHRtbEFyZ3NbMF0gPT0gXCJcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgaW5pdCgpIGZ1bmN0aW9uIG9mIHRoZSAke1xuICAgICAgICAgICAgICAgIHRoaXMubmFtZVxuICAgICAgICAgICAgfSgpIGNvbXBvbmVudCBuZWVkcyB0byByZWNlaXZlIFxuICAgICAgICAgICAgJHtwYXJzZWRBcmdzLmxlbmd0aH0gcGFyYW1ldGVycywgJHtodG1sQXJncy5sZW5ndGggLSAxfSBwYXNzZWRgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJzZWRBcmdzWzBdID09IFwiXCIpIHtcbiAgICAgICAgICAgIHRoaXMucGFyc2VJbml0KHtcbiAgICAgICAgICAgICAgICBpbml0OiB0aGlzLmluaXQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vR2V0IGEgdmFsaWQgdmFsdWUgZm9yIHRoZSBhcmd1bWVudCwgZm9yIGV4YW1wbGUsIGNoZWNrIGZvciBzdHJpbmdzIHdpdGggdW5jbG9zZWQgcXVvdGVzXG4gICAgICAgIGxldCBmaW5hbCA9IGh0bWxBcmdzLm1hcCgoYXJnKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuID0gdGhpcy5uYW1lO1xuICAgICAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9IHBhcnNlZEFyZ3NbaHRtbEFyZ3MuaW5kZXhPZihhcmcpXTtcblxuICAgICAgICAgICAgLy9UcnkgZ2V0IGEgdmFsaWQgdmFsdWVcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZ1bmMoKTogRnVuY3Rpb24ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oYHJldHVybiAke2FyZ31gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmdW5jKCkoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgJHtlcnJvcn0sIGNoZWNrIHRoZSBhcmd1bWVudHMgb2Ygb25lIG9mIHlvdXIgJyR7bn0nIGNvbXBvbmVudHNgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vUmV0dXJuIHRoZSB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuIFtuYW1lLCBmdW5jKCkoKV07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vQ3JlYXRlIHRoZSBhcmd1bWVudHMuLi5cbiAgICAgICAgbGV0IGRhdGEgPSBPYmplY3QuZnJvbUVudHJpZXMoZmluYWwpO1xuXG4gICAgICAgIC8vLi4uYW5kIHBhc3MgaXQgdG8gdGhlIHVucGFyc2VkIGluaXQgZnVuY3Rpb25cbiAgICAgICAgdGhpcy5wYXJzZUluaXQoe1xuICAgICAgICAgICAgaW5pdDogdGhpcy5pbml0ISxcbiAgICAgICAgICAgIGFyZ3M6IGRhdGEsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhcnNlIHRoZSBpbml0IGZ1bmN0aW9uIGFuZCBleGVjdXRlcyBpdFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGluaXQgVGhlIHVucGFyc2VkIGluaXQgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXJncyBUaGUgcGFyc2VkIGN1c3RvbSBhcmd1bWVudHNcbiAgICAgKiBAcmV0dXJucyB0aGUgaW5pdCBmdW5jdGlvblxuICAgICAqL1xuICAgIHBhcnNlSW5pdChpbml0OiBJbml0KTogRnVuY3Rpb24ge1xuICAgICAgICAvL1F1aXQgY3VybHkgYnJhY2VzXG4gICAgICAgIGxldCBmdW5jOiBzdHJpbmcgPSBpbml0LmluaXRcbiAgICAgICAgICAgIC50b1N0cmluZygpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFx3LipcXHsvLCBcIlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcfSQvLCBcIlwiKTtcblxuICAgICAgICAvL0ZpbmRzIHRoZSByZWFsIGFyZ3VtZW50cyBhbmQgbm8gZXhwcmVzc2lvbnMgd2l0aCB0aGUgc2FtZSBuYW1lXG4gICAgICAgIGlmIChpbml0LmFyZ3MpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGluaXQuYXJncykuZm9yRWFjaCgoYXJnKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHN0cjogc3RyaW5nID0gYCg/PD0oPVxcXFxzKXwoXFxcXCgpfCg9KSkoJHthcmd9KWA7XG4gICAgICAgICAgICAgICAgZnVuYyA9IGZ1bmMucmVwbGFjZShuZXcgUmVnRXhwKHN0ciwgXCJnXCIpLCBgJGFyZ3MuJHthcmd9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vQ3JlYXRlIHRoZSBuZXcgcGFyc2VkIGluaXQgZnVuY3Rpb25cbiAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgXCJ7JHRoaXMgPSB1bmRlZmluZWQsICRhcmdzID0gdW5kZWZpbmVkfVwiLFxuICAgICAgICAgICAgZnVuYyxcbiAgICAgICAgKTtcblxuICAgICAgICAvL1JldHVybiB0aGUgbmV3IGluaXQgZnVuY3Rpb24gYW5kIGV4ZWN1dGVzIGl0XG4gICAgICAgIHJldHVybiBuZXdGdW5jKHtcbiAgICAgICAgICAgICR0aGlzOiB0aGlzLFxuICAgICAgICAgICAgJGFyZ3M6IGluaXQuYXJncyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2hldmVyZU5vZGUgaW1wbGVtZW50cyBDaGV2ZXJlRWxlbWVudCB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGRhdGE6IERhdGFUeXBlO1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbWV0aG9kcz86IE1ldGhvZFR5cGU7XG4gICAgZWxlbWVudDogRWxlbWVudDtcbiAgICBjaGlsZHM/OiBDaGlsZCA9IHtcbiAgICAgICAgXCJkYXRhLWNsaWNrXCI6IFtdLFxuICAgICAgICBcImRhdGEtdGV4dFwiOiBbXSxcbiAgICAgICAgXCJkYXRhLW1vZGVsXCI6IFtdLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlRGF0YSwgZWw6IEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLnBhcnNlRGF0YShkYXRhLmRhdGEpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgUGFyc2UgYWxsICR0aGlzLCAkc2VsZiwgJGRhdGEuLi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubWV0aG9kcyA9IHRoaXMucGFyc2VNZXRob2RzKGRhdGEubWV0aG9kcyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCB0aGUgcGFyZW50IGBkaXZgIGFuZCBnaXZlIGl0IGFuIGlkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbDtcbiAgICAgICAgdGhpcy5pZCA9IEhlbHBlci5zZXRJZCgxMCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIHRoaXMuaWQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgR2V0IHRoZSBldmVudHMgYW5kIGFjdGlvbnMgb2YgdGhlIGNvbXBvbmVudFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZSBhbGwgdGhlIGRhdGEsIHRoZXkgbmVlZCBnZXR0ZXIgYW5kIGEgc2V0dGVyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIHByaW1pdGl2ZSBkYXRhXG4gICAgICovXG4gICAgcGFyc2VEYXRhKGRhdGE6IERhdGFUeXBlKSB7XG4gICAgICAgIGxldCBvYmo6IFtzdHJpbmcsIFBhcnNlZERhdGFdW10gPSBbXTtcblxuICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKChkKSA9PiB7XG4gICAgICAgICAgICBvYmoucHVzaChbZCwgdGhpcy5wYXJzZWRPYmooZCwgZGF0YVtkXSldKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhvYmopO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhcnNlZCB0aGUgbWV0aG9kcyBkZXNjcmliZWQgaW4gdGhlIG1ldGhvZCBwcm9wZXJ0eSBvZiB0aGUgZGF0YVxuICAgICAqIEBwYXJhbSB7TWV0aG9kVHlwZX0gbWV0aG9kc1xuICAgICAqIEByZXR1cm5zIFRoZSBtZXRob2RzIHBhcnNlZFxuICAgICAqL1xuICAgIHBhcnNlTWV0aG9kcyhtZXRob2RzPzogTWV0aG9kVHlwZSk6IE1ldGhvZFR5cGUgfCB1bmRlZmluZWQge1xuICAgICAgICBpZiAobWV0aG9kcyA9PSB1bmRlZmluZWQpIHJldHVybjtcblxuICAgICAgICBPYmplY3Qua2V5cyhtZXRob2RzKS5mb3JFYWNoKChtZXRob2QpID0+IHtcbiAgICAgICAgICAgIGxldCB3YXNQYXJzZWQ6IG51bWJlciA9IG1ldGhvZHNbbWV0aG9kXVxuICAgICAgICAgICAgICAgIC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgLnNlYXJjaChcImFub255bW91c1wiKTtcblxuICAgICAgICAgICAgaWYgKHdhc1BhcnNlZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxldCBwYXJzZWQ6IHN0cmluZyA9IG1ldGhvZHNbbWV0aG9kXVxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXi4qfFtcXH1dJC9nLCBcIlwiKTtcblxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VkID0gcGFyc2VkLnJlcGxhY2VBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHRoaXMuZGF0YS4ke3ZhcmlhYmxlfS52YWx1ZWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgbmV3RnVuYzogRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgIFwieyR0aGlzID0gdW5kZWZpbmVkLCAkZGF0YSA9IHVuZGVmaW5lZH1cIixcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VkLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBtZXRob2RzW21ldGhvZF0gPSBuZXdGdW5jO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbWV0aG9kcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGFsbCB0aGUgY2hpbGRyZW5zIHRoYXQgaGF2ZSBhbiBhY3Rpb24gYW5kIGRhdGFcbiAgICAgKi9cbiAgICBjaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudFNlbGVjdG9yOiBzdHJpbmcgPSBgZGl2W2RhdGEtaWQ9JHt0aGlzLmlkfV0gPiBgO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBbGwgdGhlIGVsZW1lbnRzIHN1cHBvcnRlZCB3aXRoIENoZXZlcmV4XG4gICAgICAgICAqIEBjb25zdFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzOiBTZWxlY3RvcnMgPSB7XG4gICAgICAgICAgICBidXR0b25zOiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICBwYXJlbnRTZWxlY3RvciArIFwiYnV0dG9uW2RhdGEtY2xpY2tdXCIsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdGV4dDogdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgcGFyZW50U2VsZWN0b3IgKyBcIipbZGF0YS10ZXh0XVwiLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGlucHV0czogdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgcGFyZW50U2VsZWN0b3IgK1xuICAgICAgICAgICAgICAgICAgICBcImlucHV0W2RhdGEtbW9kZWxdW3R5cGU9dGV4dF0sXCIgK1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRTZWxlY3RvciArXG4gICAgICAgICAgICAgICAgICAgIFwidGV4dGFyZWFbZGF0YS1tb2RlbF1cIixcbiAgICAgICAgICAgICksXG4gICAgICAgIH07XG5cbiAgICAgICAgLy9CdXR0b25zXG4gICAgICAgIGlmIChzZWxlY3RvcnMuYnV0dG9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGVjdG9ycy5idXR0b25zLmZvckVhY2goKGJ1dHRvbikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWNrID0gbmV3IENsaWNrQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogYnV0dG9uLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLWNsaWNrXCJdLnB1c2goY2xpY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL0RhdGEtdGV4dFxuICAgICAgICBpZiAoc2VsZWN0b3JzLnRleHQubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZWxlY3RvcnMudGV4dC5mb3JFYWNoKCh0ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHh0ID0gbmV3IFRleHRBY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiB0ZXh0LFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLXRleHRcIl0ucHVzaCh0eHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1RleHQgSW5wdXRzIHdpdGggbW9kZWxcbiAgICAgICAgaWYgKHNlbGVjdG9ycy5pbnB1dHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZWxlY3RvcnMuaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wID0gbmV3IElucHV0QWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl0ucHVzaChpbnApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcGFyc2VkIGRhdGEsIHdpdGggdGhlIGdldHRlciBhbmQgc2V0dGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IG9mIHRoZSB1bnBhcnNlZCBkYXRhIG9iamVjdFxuICAgICAqIEBwYXJhbSB7YW55fSB2YWx1ZSB0aGUgdmFsdWUgb2YgdGhhdCBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgZGF0YVxuICAgICAqL1xuICAgIHBhcnNlZE9iaihuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBQYXJzZWREYXRhIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5vbWJyZTogbmFtZSxcbiAgICAgICAgICAgIF92YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xuICAgICAgICAgICAgICAgIC8vVGhlcmUncyBhIHdlaXJkIGRlbGF5IHdoZW4geW91IHRyeSB0byBzeW5jIGFsbCBpbnB1dHMsIEkgZG9uJ3Qga25vdyB3aHlcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2hpbGRzIVtcImRhdGEtdGV4dFwiXS5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAodGV4dCkgPT4gdGV4dC5fdmFyaWFibGUubm9tYnJlID09IHRoaXMubm9tYnJlLFxuICAgICAgICAgICAgICAgICAgICApLmZvckVhY2goKHRleHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQuc2V0VGV4dCh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgMTAwKTtcblxuICAgICAgICAgICAgICAgIC8vU3luYyB0ZXh0IHdpdGggYWxsIGlucHV0cyB0aGF0IGhhdmUgdGhpcyB2YXJpYWJsZSBhcyBtb2RlbCBpbiB0aGVpciAnZGF0YS1tb2RlbCcgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgc2VsZi5jaGlsZHMhW1wiZGF0YS1tb2RlbFwiXS5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgIChpbnB1dCkgPT4gaW5wdXQudmFyaWFibGUgPT0gdGhpcy5ub21icmUsXG4gICAgICAgICAgICAgICAgKS5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dC5hc3NpZ25UZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgY3VzdG9tIGV2ZW50IGluIHRoZSBzY29wZSBvZiB0aGUgZGF0YS1hdHRhY2hlZFxuICAgICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdHlwZSwgdGhlIGVsZW1lbnQsIGFuZCB0aGUgZnVuY3Rpb24gd2l0aG91dCBleGVjdXRpbmdcbiAgICAgKi9cbiAgICBzZXRFdmVudChldmVudDogQ2hldmVyZUV2ZW50KSB7XG4gICAgICAgIGV2ZW50LmVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudC50eXBlLCAoKSA9PiB7XG4gICAgICAgICAgICBldmVudC5hY3Rpb24oe1xuICAgICAgICAgICAgICAgICR0aGlzOiB0aGlzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLyoqXG4gKiAgVGhlIG1haW4gQ2hldmVyZSBvYmplY3QsIGl0IGluaXRpYWxpemVzIHRoZSBDaGV2ZXJlIGZyYW1ld29ya1xuICogIEBjb25zdFxuICovXG5leHBvcnQgY29uc3QgQ2hldmVyZTogQ2hldmVyZVdpbmRvdyA9IHtcbiAgICBub2RlczogW10sXG4gICAgLyoqXG4gICAgICogRmluZCBhIENoZXZlcmVEYXRhIGJ5IHRoZSB2YWx1ZSBvZiB0aGUgJ2RhdGEtYXR0YWNoZWQnIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyXG4gICAgICogQHBhcmFtIHtDaGV2ZXJlRGF0YVtdfSBkYXRhXG4gICAgICogQHJldHVybnMgVGhlIGRhdGEgcmVhZHkgZm9yIGluc3RhbmNlIGEgQ2hldmVyZXhOb2RlXG4gICAgICovXG4gICAgZmluZEl0c0RhdGEoYXR0cjogc3RyaW5nLCBkYXRhOiBDaGV2ZXJlRGF0YVtdKTogQ2hldmVyZURhdGEge1xuICAgICAgICBsZXQgc2VhcmNoOiBDaGV2ZXJlRGF0YSB8IHVuZGVmaW5lZCA9IGRhdGEuZmluZChcbiAgICAgICAgICAgIChkKSA9PiBkLm5hbWUgPT0gYXR0ci5yZXBsYWNlKC9cXCguKlxcKS8sIFwiXCIpLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChzZWFyY2ggPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgICAgICAgIGAnJHthdHRyfScgY291bGRuJ3QgYmUgZm91bmQgaW4gYW55IG9mIHlvdXIgZGVjbGFyZWQgY29tcG9uZW50c2AsXG4gICAgICAgICAgICApO1xuICAgICAgICBlbHNlIHJldHVybiBzZWFyY2g7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBTZWFyY2ggZm9yIENoZXZlcmUgTm9kZXMgYXQgdGhlIHNpdGVcbiAgICAgKiBAcGFyYW0gZGF0YSBBbGwgdGhlIENoZXZlcmUgY29tcG9uZW50c1xuICAgICAqL1xuICAgIHN0YXJ0KC4uLmRhdGE6IENoZXZlcmVEYXRhW10pOiB2b2lkIHtcbiAgICAgICAgbGV0IFsuLi5wcm9wc10gPSBkYXRhO1xuICAgICAgICBjb25zdCBlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PiA9XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2W2RhdGEtYXR0YWNoZWRdXCIpO1xuXG4gICAgICAgIC8vQ3JlYXRlIGEgQ2hldmVyZU5vZGUgZm9yIGVhY2ggZGF0YS1hdHRhY2hlZFxuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGF0YUF0dHI6IHN0cmluZyA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtYXR0YWNoZWRcIikhO1xuXG4gICAgICAgICAgICBsZXQgZ2V0RGF0YSA9IHRoaXMuZmluZEl0c0RhdGEoZGF0YUF0dHIsIHByb3BzKTtcblxuICAgICAgICAgICAgZ2V0RGF0YS5wYXJzZUFyZ3VtZW50cyhkYXRhQXR0cik7XG5cbiAgICAgICAgICAgIGxldCBub2RlID0gbmV3IENoZXZlcmVOb2RlKGdldERhdGEsIGVsKTtcblxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRhdGEoZGF0YTogQ2hldmVyZU5vZGVEYXRhKTogQ2hldmVyZURhdGEge1xuICAgICAgICByZXR1cm4gbmV3IENoZXZlcmVEYXRhKGRhdGEpO1xuICAgIH0sXG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IENoZXZlcmUgfSBmcm9tIFwiLi9DaGV2ZXJlXCI7XG5cbndpbmRvdy5DaGV2ZXJlID0gQ2hldmVyZTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==