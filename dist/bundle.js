/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Actions/Index.ts":
/*!******************************!*\
  !*** ./src/Actions/Index.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputAction = exports.ClickAction = exports.TextAction = void 0;
const Chevere_1 = __webpack_require__(/*! ../Chevere */ "./src/Chevere.ts");
class TextAction {
    constructor(data) {
        this.element = data.element;
        this.element.setAttribute("data-id", Chevere_1.Helper.setId(10));
        this.parent = data.parent;
        this.variable = this.element.getAttribute("data-text");
        this.element.textContent = this._variable;
    }
    setText(value) {
        this.element.textContent = value.toString();
    }
    set variable(attr) {
        Chevere_1.Helper.checkForError(attr);
        const arrAttr = attr.split(".").splice(1).join(".");
        const customObjAttr = attr.replace(/\..*/, ``);
        let parentVar = Object.keys(this.parent.data).find((d) => (d == customObjAttr));
        if (!parentVar)
            throw new ReferenceError(`The variable or method named '${parentVar}' wasn't found on the data-attached scope`);
        if (arrAttr === "")
            this._variable = this.parent.data[parentVar].value;
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
            ;
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
            type: "click"
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
    ;
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

/***/ "./src/Chevere.ts":
/*!************************!*\
  !*** ./src/Chevere.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Chevere = exports.ChevereNode = exports.ChevereData = exports.Helper = void 0;
const Index_1 = __webpack_require__(/*! ./Actions/Index */ "./src/Actions/Index.ts");
/**
 * Helper class for the CheverexNodes and Cheverex childs
 * @class
 * @constructor
 */
exports.Helper = {
    setId(length) {
        let final = "";
        const chars = {
            "letters": "abcdefghijklmnopqrstuvwxyz",
            "mayus": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "numbers": "0123456789"
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
    }
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
        if ((this.init == undefined))
            return;
        //Those custom arguments to array
        let htmlArgs = args
            .trim()
            .replace(/^\w*\(/, "")
            .replace(/\)$/, "")
            .split(",");
        if (htmlArgs[0] == "") {
            this.parseInit({
                init: this.init
            });
            return;
        }
        ;
        //The arguments of the init function defined in your data
        let parsedArgs = this.init?.toString()
            .replace(/\{.*/gs, "")
            .replace("init(", "")
            .replace(")", "")
            .replaceAll(" ", "")
            .split(",");
        if (parsedArgs[0] == "") {
            this.parseInit({
                init: this.init
            });
            return;
        }
        ;
        //Get a valid value for the argument, for example, check for strings with unclosed quotes
        let final = htmlArgs.map(arg => {
            const n = this.name;
            let name = parsedArgs[htmlArgs.indexOf(arg)];
            function func() {
                //Try get a valid value
                try {
                    return new Function(`return ${arg}`);
                }
                catch (error) {
                    throw new Error(`${error} at the value ${arg}, check the arguments at your '${n}' components`);
                }
            }
            func();
            //Return the value
            return [name, func()()];
        });
        //Create the arguments...
        let data = Object.fromEntries(final);
        //...and pass it to the unparsed init function
        this.parseInit({
            init: this.init,
            args: data
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
        let func = init.init.toString()
            .replace(/\w.*\{/, "")
            .replace(/\}$/, "");
        //Finds the real arguments and no expressions with the same name
        if (init.args) {
            Object.keys(init.args).forEach((arg) => {
                let str = `(?<=(=\\s)|(\\()|(=))(${arg})`;
                func = func.replace(new RegExp(str, 'g'), `$args.${arg}`);
            });
        }
        //Create the new parsed init function
        let newFunc = new Function("{$this = undefined, $data = undefined, $args = undefined}", func);
        //Return the new init function and executes it
        return newFunc({
            $this: this,
            $data: this.data,
            $args: init.args
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
        ;
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
            obj.push([
                d,
                this.parsedObj(d, data[d])
            ]);
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
            let wasParsed = methods[method].toString().search("anonymous");
            if (wasParsed == -1) {
                let parsed = methods[method].toString().replace(/^.*|[\}]$/g, "");
                Object.keys(this.data).forEach((variable) => {
                    parsed = parsed.replaceAll(`$data.${variable}`, `$data.${variable}.value`);
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
            buttons: this.element.querySelectorAll(parentSelector + 'button[data-click]'),
            text: this.element.querySelectorAll(parentSelector + '*[data-text]'),
            inputs: this.element.querySelectorAll(parentSelector + 'input[data-model][type=text],' + parentSelector + 'textarea[data-model]')
        };
        //Buttons
        if (selectors.buttons.length) {
            selectors.buttons.forEach((button) => {
                const click = new Index_1.ClickAction({
                    element: button,
                    parent: this
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
                    parent: this
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
                    self.childs["data-text"]
                        .filter((text) => text._variable.nombre == this.nombre)
                        .forEach((text) => {
                        text.setText(this.value);
                    });
                }, 100);
                //Sync text with all inputs that have this variable as model in their 'data-model' attribute
                self.childs["data-model"]
                    .filter((input) => input.variable == this.nombre)
                    .forEach((input) => {
                    input.assignText(value);
                });
                this._value = value;
            },
            get value() {
                return this._value;
            }
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
                $data: this.data
            });
        });
    }
    ;
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
        let search = data.find(d => d.name == attr.replace(/\(.*\)/, ""));
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
        elements.forEach(el => {
            const dataAttr = el.getAttribute("data-attached");
            let getData = this.findItsData(dataAttr, props);
            getData.parseArguments(dataAttr);
            let node = new ChevereNode(getData, el);
            this.nodes.push(node);
        });
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
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Chevere_1 = __webpack_require__(/*! ./Chevere */ "./src/Chevere.ts");
const bind = new Chevere_1.ChevereData({
    name: 'bind',
    data: {
        toggle: false
    },
    init() {
        $data.toggle = !$data.toggle;
    }
});
window.addEventListener("load", () => {
    Chevere_1.Chevere.start(bind);
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9DaGV2ZXJlLy4vc3JjL0FjdGlvbnMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9DaGV2ZXJlLnRzIiwid2VicGFjazovL0NoZXZlcmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQWlEO0FBR2pELE1BQWEsVUFBVTtJQUtuQixZQUFZLElBQWtCO1FBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUUsQ0FBQztRQUV4RCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzlDLENBQUM7SUFFRCxPQUFPLENBQUMsS0FBVTtRQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBRUQsSUFBSSxRQUFRLENBQUMsSUFBWTtRQUNyQixnQkFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQixNQUFNLE9BQU8sR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFNUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFD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QUMsQ0FBQztZQUV4QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFDOzs7Ozs7O1VDcllGO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7OztBQ3RCQSwyRUFBaUQ7QUFFakQsTUFBTSxJQUFJLEdBQWdCLElBQUkscUJBQVcsQ0FBQztJQUN0QyxJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRTtRQUNGLE1BQU0sRUFBRSxLQUFLO0tBQ2hCO0lBQ0QsSUFBSTtRQUNBLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTtJQUNoQyxDQUFDO0NBQ0osQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDakMsaUJBQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hldmVyZU5vZGUsIEhlbHBlciB9IGZyb20gXCIuLi9DaGV2ZXJlXCI7XHJcbmltcG9ydCB7IENsaWNrLCBUZXh0UmVsYXRpb24sIElucHV0TW9kZWwgfSBmcm9tIFwiLi4vaW50ZXJmYWNlc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRleHRBY3Rpb24gaW1wbGVtZW50cyBUZXh0UmVsYXRpb24ge1xyXG4gICAgZWxlbWVudDogRWxlbWVudDtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcbiAgICBfdmFyaWFibGU/OiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogVGV4dFJlbGF0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZGF0YS5lbGVtZW50O1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIEhlbHBlci5zZXRJZCgxMCkpO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudCA9IGRhdGEucGFyZW50O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXh0XCIpITtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5fdmFyaWFibGU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dCh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdmFsdWUudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFyaWFibGUoYXR0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgSGVscGVyLmNoZWNrRm9yRXJyb3IoYXR0cik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgYXJyQXR0cjogc3RyaW5nID0gYXR0ci5zcGxpdChcIi5cIikuc3BsaWNlKDEpLmpvaW4oXCIuXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBjdXN0b21PYmpBdHRyID0gYXR0ci5yZXBsYWNlKC9cXC4uKi8sIGBgKTtcclxuXHJcbiAgICAgICAgbGV0IHBhcmVudFZhciA9IE9iamVjdC5rZXlzKHRoaXMucGFyZW50LmRhdGEpLmZpbmQoKGQpID0+IChkID09IGN1c3RvbU9iakF0dHIpKTtcclxuXHJcbiAgICAgICAgaWYoIXBhcmVudFZhcikgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlIHZhcmlhYmxlIG9yIG1ldGhvZCBuYW1lZCAnJHtwYXJlbnRWYXJ9JyB3YXNuJ3QgZm91bmQgb24gdGhlIGRhdGEtYXR0YWNoZWQgc2NvcGVgKTtcclxuICAgICAgICBcclxuICAgICAgICBpZihhcnJBdHRyID09PSBcIlwiKSB0aGlzLl92YXJpYWJsZSA9IHRoaXMucGFyZW50LmRhdGFbcGFyZW50VmFyXS52YWx1ZTtcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBhcnI6IHN0cmluZ1tdID0gYXJyQXR0ci5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgIGxldCBsYXN0OiBzdHJpbmcgPSBhcnJbYXJyLmxlbmd0aC0xXTtcclxuICAgICAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gYXJyLmxlbmd0aC0xO1xyXG5cclxuICAgICAgICAgICAgLy9GaW5kIHRoZSBuZXN0ZWQgcHJvcGVydHkgYnkgcmVjdXJzaXZpdHlcclxuICAgICAgICAgICAgZnVuY3Rpb24gZmluZFByb3BlcnR5KG9iajogYW55LCBrZXk6IGFueSwgcG9zOiBudW1iZXIsIG5lc3RlZDogbnVtYmVyKTogYW55IHtcclxuICAgICAgICAgICAgICAgIGlmKG5lc3RlZCA9PSBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihvYmouaGFzT3duUHJvcGVydHkoa2V5KSkgcmV0dXJuIG9ialtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBUaGVyZSdzIG5vIGEgJyR7a2V5fScgcHJvcGVydHkgaW4gdGhlICcke29ian0nIHByb3BlcnR5LCAgdGhlICR7cGFyZW50VmFyfWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmluZFByb3BlcnR5KG9ialthcnJbcG9zXV0sIGxhc3QsIHBvcysxLCBuZXN0ZWQgKyAxKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGV4aXN0cyA9IGZpbmRQcm9wZXJ0eSh0aGlzLnBhcmVudC5kYXRhW3BhcmVudFZhcl0udmFsdWUsIGxhc3QsIDAsIDApO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXhpc3RzKTtcclxuICAgICAgICAgICAgaWYoIWV4aXN0cylcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlIHByb3BlcnR5IG5hbWVkICcke2FyckF0dHJ9JyB3YXNuJ3QgZm91bmQgb24gdGhlICcke3BhcmVudFZhcn0nIGRhdGFgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3ZhcmlhYmxlID0gZXhpc3RzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENsaWNrQWN0aW9uIGltcGxlbWVudHMgQ2xpY2sge1xyXG4gICAgZWxlbWVudCA6IEVsZW1lbnQ7XHJcbiAgICBwYXJlbnQgIDogQ2hldmVyZU5vZGU7XHJcbiAgICBtZXRob2Q/IDogRnVuY3Rpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2xpY2s6IENsaWNrKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gY2xpY2suZWxlbWVudCBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBIZWxwZXIuc2V0SWQoMTApKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBhcmVudCAgPSBjbGljay5wYXJlbnQ7XHJcblxyXG4gICAgICAgIHRoaXMubWV0aG9kID0gdGhpcy5zZWFyY2hNZXRob2QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnQ/LnNldEV2ZW50KHtcclxuICAgICAgICAgICAgZWxlbTogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICBhY3Rpb246IHRoaXMubWV0aG9kISxcclxuICAgICAgICAgICAgdHlwZTogXCJjbGlja1wiXHJcbiAgICAgICAgfSk7ICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgc2VhcmNoTWV0aG9kKCk6IEZ1bmN0aW9uIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtY2xpY2tcIikhO1xyXG5cclxuICAgICAgICBsZXQgc2FuaXRpemVkOiBzdHJpbmcgPSBhdHRyLnJlcGxhY2UoXCIoKVwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgbGV0IG1ldGhvZDogRnVuY3Rpb24gPSB0aGlzLnBhcmVudC5tZXRob2RzIVtzYW5pdGl6ZWRdO1xyXG5cclxuICAgICAgICBpZighbWV0aG9kKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBUaGVyZSdzIG5vIG1ldGhvZCAke2F0dHJ9IGluIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCk7XHJcblxyXG4gICAgICAgIHJldHVybiBtZXRob2Q7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgY2xhc3MgZm9yIHRob3NlIGlucHV0cyBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIGBkYXRhLW1vZGVsYCBhdHRyaWJ1dGVcclxuICogIEBjbGFzc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIElucHV0QWN0aW9uIGltcGxlbWVudHMgSW5wdXRNb2RlbCB7XHJcbiAgICBlbGVtZW50IDogSFRNTFRleHRBcmVhRWxlbWVudHxIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcGFyZW50ICA6IENoZXZlcmVOb2RlO1xyXG4gICAgdmFyaWFibGU6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihpbnB1dDogSW5wdXRNb2RlbCkge1xyXG4gICAgICAgIHRoaXMucGFyZW50ID0gaW5wdXQucGFyZW50O1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGlucHV0LmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgLy9TZWFyY2ggaWYgdGhlIGluZGljYXRlZCB2YXJpYWJsZSBvZiB0aGUgZGF0YS1tb2RlbCBhdHRyaWJ1dGUgZXhpc3RzIGluIHRoZSBzY29wZVxyXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmdldFZhcmlhYmxlKCk7XHJcblxyXG4gICAgICAgIC8vU2V0IHRoZSBkZWZhdWx0IHZhbHVlXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZS50b1N0cmluZygpO1xyXG5cclxuICAgICAgICAvL0FkZCB0aGUgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zeW5jVGV4dCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2lnblRleHQodmFsdWU6IGFueSkgeyBcclxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSB2YWx1ZS50b1N0cmluZygpXHJcbiAgICB9XHJcblxyXG4gICAgc3luY1RleHQoKSB7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZGF0YVt0aGlzLnZhcmlhYmxlXS52YWx1ZSA9IHRoaXMuZWxlbWVudC52YWx1ZS50b1N0cmluZygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBnZXRWYXJpYWJsZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBhdHRyID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtbW9kZWxcIikhO1xyXG5cclxuICAgICAgICBIZWxwZXIuY2hlY2tGb3JFcnJvcihhdHRyKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdmFyaWFibGUgPSBPYmplY3Qua2V5cyh0aGlzLnBhcmVudC5kYXRhKS5maW5kKChkYXRhKSA9PiBkYXRhID09IGF0dHIpO1xyXG5cclxuICAgICAgICBpZighdmFyaWFibGUpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlcmUncyBubyBhICcke2F0dHJ9JyB2YXJpYWJsZSBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gdmFyaWFibGU7XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgQ2hldmVyZUV2ZW50LCBDaGV2ZXJlTm9kZURhdGEsIENoZXZlcmVXaW5kb3csIENoaWxkLCBEYXRhVHlwZSwgSW5pdCwgTWV0aG9kVHlwZSwgUGFyc2VkRGF0YSwgU2VsZWN0b3JzIH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBDaGV2ZXJlRWxlbWVudCB9IGZyb20gXCIuL2ludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgQ2xpY2tBY3Rpb24sIFRleHRBY3Rpb24sIElucHV0QWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9ucy9JbmRleFwiO1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBjbGFzcyBmb3IgdGhlIENoZXZlcmV4Tm9kZXMgYW5kIENoZXZlcmV4IGNoaWxkc1xyXG4gKiBAY2xhc3NcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgSGVscGVyID0ge1xyXG4gICAgc2V0SWQobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBmaW5hbDogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgY29uc3QgY2hhcnM6IHsgW3R5cGU6IHN0cmluZ106IHN0cmluZyAgfSA9IHtcclxuICAgICAgICAgICAgXCJsZXR0ZXJzXCI6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcclxuICAgICAgICAgICAgXCJtYXl1c1wiOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXHJcbiAgICAgICAgICAgIFwibnVtYmVyc1wiOiBcIjAxMjM0NTY3ODlcIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHJrZXk6IHN0cmluZyA9IE9iamVjdC5rZXlzKGNoYXJzKVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XHJcbiAgICAgICAgICAgIGZpbmFsICs9IGNoYXJzW3JrZXldW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbmd0aCldXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9LFxyXG4gICAgY2hlY2tGb3JFcnJvcihzdHI6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHBhdHRlcm46IFJlZ0V4cCA9IC9eWzAtOV18XFxzL2c7XHJcblxyXG4gICAgICAgIGlmKHBhdHRlcm4udGVzdChzdHIpKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVmFyaWFibGUgbmFtZSBjYW5ub3Qgc3RhcnQgd2l0aCBhIG51bWJlciBvciBoYXZlIHNwYWNlc1wiKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICBUaGUgY2xhc3MgdGhhdCB1c2VycyBjcmVhdGUgdGhlaXIgY29tcG9uZW50c1xyXG4gKiAgQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2hldmVyZURhdGEgaW1wbGVtZW50cyBDaGV2ZXJlTm9kZURhdGEge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZGF0YTogRGF0YVR5cGU7XHJcbiAgICBpbml0PzogRnVuY3Rpb247XHJcbiAgICBtZXRob2RzPzogTWV0aG9kVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlTm9kZURhdGEpIHtcclxuICAgICAgICB0aGlzLm5hbWUgICAgICAgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5kYXRhICAgICAgID0gZGF0YS5kYXRhO1xyXG4gICAgICAgIHRoaXMuaW5pdCAgICAgICA9IGRhdGEuaW5pdDtcclxuICAgICAgICB0aGlzLm1ldGhvZHMgICAgPSBkYXRhLm1ldGhvZHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgY3VzdG9tIGFyZ3VtZW50cyB0aGF0IGFyZSBpbiB0aGUgZGF0YS1hdHRhY2hlZCBhdHRyaWJ1dGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhcmdzIFRoZSBhcmd1bWVudHMgb2YgZGUgZGF0YS1hdHRhY2hlZCBhdHRyaWJ1dGVcclxuICAgICAqL1xyXG4gICAgcGFyc2VBcmd1bWVudHMoYXJnczogc3RyaW5nKTogdm9pZCB7XHJcblxyXG4gICAgICAgIGlmKCh0aGlzLmluaXQgPT0gdW5kZWZpbmVkKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL1Rob3NlIGN1c3RvbSBhcmd1bWVudHMgdG8gYXJyYXlcclxuICAgICAgICBsZXQgaHRtbEFyZ3MgPSBhcmdzXHJcbiAgICAgICAgICAgIC50cmltKClcclxuICAgICAgICAgICAgLnJlcGxhY2UoL15cXHcqXFwoLywgXCJcIilcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcKSQvLCBcIlwiKVxyXG4gICAgICAgICAgICAuc3BsaXQoXCIsXCIpO1xyXG5cclxuICAgICAgICBpZihodG1sQXJnc1swXSA9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyc2VJbml0KHtcclxuICAgICAgICAgICAgICAgIGluaXQ6IHRoaXMuaW5pdFxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vVGhlIGFyZ3VtZW50cyBvZiB0aGUgaW5pdCBmdW5jdGlvbiBkZWZpbmVkIGluIHlvdXIgZGF0YVxyXG4gICAgICAgIGxldCBwYXJzZWRBcmdzID0gdGhpcy5pbml0Py50b1N0cmluZygpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHsuKi9ncywgXCJcIilcclxuICAgICAgICAgICAgLnJlcGxhY2UoXCJpbml0KFwiLCBcIlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZShcIilcIiwgXCJcIilcclxuICAgICAgICAgICAgLnJlcGxhY2VBbGwoXCIgXCIsIFwiXCIpXHJcbiAgICAgICAgICAgIC5zcGxpdChcIixcIikhO1xyXG5cclxuICAgICAgICBpZihwYXJzZWRBcmdzWzBdID09IFwiXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJzZUluaXQoe1xyXG4gICAgICAgICAgICAgICAgaW5pdDogdGhpcy5pbml0XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vR2V0IGEgdmFsaWQgdmFsdWUgZm9yIHRoZSBhcmd1bWVudCwgZm9yIGV4YW1wbGUsIGNoZWNrIGZvciBzdHJpbmdzIHdpdGggdW5jbG9zZWQgcXVvdGVzXHJcbiAgICAgICAgbGV0IGZpbmFsID0gaHRtbEFyZ3MubWFwKGFyZyA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG4gPSB0aGlzLm5hbWU7XHJcbiAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmcgPSBwYXJzZWRBcmdzW2h0bWxBcmdzLmluZGV4T2YoYXJnKV07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBmdW5jKCk6IEZ1bmN0aW9uIHtcclxuICAgICAgICAgICAgICAgIC8vVHJ5IGdldCBhIHZhbGlkIHZhbHVlXHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oYHJldHVybiAke2FyZ31gKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2Vycm9yfSBhdCB0aGUgdmFsdWUgJHthcmd9LCBjaGVjayB0aGUgYXJndW1lbnRzIGF0IHlvdXIgJyR7bn0nIGNvbXBvbmVudHNgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZnVuYygpO1xyXG5cclxuICAgICAgICAgICAgLy9SZXR1cm4gdGhlIHZhbHVlXHJcbiAgICAgICAgICAgIHJldHVybiBbbmFtZSwgZnVuYygpKCldO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL0NyZWF0ZSB0aGUgYXJndW1lbnRzLi4uXHJcbiAgICAgICAgbGV0IGRhdGEgPSBPYmplY3QuZnJvbUVudHJpZXMoZmluYWwpO1xyXG5cclxuICAgICAgICAvLy4uLmFuZCBwYXNzIGl0IHRvIHRoZSB1bnBhcnNlZCBpbml0IGZ1bmN0aW9uXHJcbiAgICAgICAgdGhpcy5wYXJzZUluaXQoe1xyXG4gICAgICAgICAgICBpbml0OiB0aGlzLmluaXQhLFxyXG4gICAgICAgICAgICBhcmdzOiBkYXRhXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgaW5pdCBmdW5jdGlvbiBhbmQgZXhlY3V0ZXMgaXRcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGluaXQgVGhlIHVucGFyc2VkIGluaXQgZnVuY3Rpb25cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIFRoZSBwYXJzZWQgY3VzdG9tIGFyZ3VtZW50c1xyXG4gICAgICogQHJldHVybnMgdGhlIGluaXQgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgcGFyc2VJbml0KGluaXQ6IEluaXQpOiBGdW5jdGlvbiB7XHJcbiAgICAgICAgLy9RdWl0IGN1cmx5IGJyYWNlcyBcclxuICAgICAgICBsZXQgZnVuYzogc3RyaW5nID0gaW5pdC5pbml0LnRvU3RyaW5nKClcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcdy4qXFx7LywgXCJcIilcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcfSQvLCBcIlwiKTtcclxuXHJcbiAgICAgICAgLy9GaW5kcyB0aGUgcmVhbCBhcmd1bWVudHMgYW5kIG5vIGV4cHJlc3Npb25zIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICAgIGlmKGluaXQuYXJncykge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhpbml0LmFyZ3MpLmZvckVhY2goKGFyZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN0cjogc3RyaW5nID0gYCg/PD0oPVxcXFxzKXwoXFxcXCgpfCg9KSkoJHthcmd9KWA7XHJcbiAgICAgICAgICAgICAgICBmdW5jID0gZnVuYy5yZXBsYWNlKG5ldyBSZWdFeHAoc3RyLCAnZycpLCBgJGFyZ3MuJHthcmd9YClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL0NyZWF0ZSB0aGUgbmV3IHBhcnNlZCBpbml0IGZ1bmN0aW9uXHJcbiAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgICAgICBcInskdGhpcyA9IHVuZGVmaW5lZCwgJGRhdGEgPSB1bmRlZmluZWQsICRhcmdzID0gdW5kZWZpbmVkfVwiLFxyXG4gICAgICAgICAgICBmdW5jXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9SZXR1cm4gdGhlIG5ldyBpbml0IGZ1bmN0aW9uIGFuZCBleGVjdXRlcyBpdFxyXG4gICAgICAgIHJldHVybiBuZXdGdW5jKHtcclxuICAgICAgICAgICAgJHRoaXM6IHRoaXMsXHJcbiAgICAgICAgICAgICRkYXRhOiB0aGlzLmRhdGEsXHJcbiAgICAgICAgICAgICRhcmdzOiBpbml0LmFyZ3NcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENoZXZlcmVOb2RlIGltcGxlbWVudHMgQ2hldmVyZUVsZW1lbnQge1xyXG4gICAgbmFtZSAgICA6IHN0cmluZyAgICA7XHJcbiAgICBkYXRhICAgIDogRGF0YVR5cGUgIDtcclxuICAgIGlkICAgICAgOiBzdHJpbmc7XHJcbiAgICBtZXRob2RzPzogTWV0aG9kVHlwZTtcclxuICAgIGVsZW1lbnQgOiBFbGVtZW50ICAgO1xyXG4gICAgY2hpbGRzPyA6IENoaWxkID0ge1xyXG4gICAgICAgIFwiZGF0YS1jbGlja1wiOiBbXSxcclxuICAgICAgICBcImRhdGEtdGV4dFwiIDogW10sXHJcbiAgICAgICAgXCJkYXRhLW1vZGVsXCI6IFtdLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlRGF0YSwgZWw6IEVsZW1lbnQpIHs7XHJcblxyXG4gICAgICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLnBhcnNlRGF0YShkYXRhLmRhdGEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBQYXJzZSBhbGwgJHRoaXMsICRzZWxmLCAkZGF0YS4uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMubWV0aG9kcyAgICA9IHRoaXMucGFyc2VNZXRob2RzKGRhdGEubWV0aG9kcyk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCB0aGUgcGFyZW50IGBkaXZgIGFuZCBnaXZlIGl0IGFuIGlkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IEhlbHBlci5zZXRJZCgxMCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgdGhpcy5pZCk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBHZXQgdGhlIGV2ZW50cyBhbmQgYWN0aW9ucyBvZiB0aGUgY29tcG9uZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSBhbGwgdGhlIGRhdGEsIHRoZXkgbmVlZCBnZXR0ZXIgYW5kIGEgc2V0dGVyXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgcHJpbWl0aXZlIGRhdGFcclxuICAgICAqL1xyXG4gICAgcGFyc2VEYXRhKGRhdGE6IERhdGFUeXBlKSB7XHJcbiAgICAgICAgbGV0IG9iajogW3N0cmluZywgUGFyc2VkRGF0YV1bXSA9IFtdO1xyXG5cclxuICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKChkKSA9PiB7XHJcbiAgICAgICAgICAgIG9iai5wdXNoKFtcclxuICAgICAgICAgICAgICAgIGQsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlZE9iaihkLCBkYXRhW2RdKVxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhvYmopO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VkIHRoZSBtZXRob2RzIGRlc2NyaWJlZCBpbiB0aGUgbWV0aG9kIHByb3BlcnR5IG9mIHRoZSBkYXRhXHJcbiAgICAgKiBAcGFyYW0ge01ldGhvZFR5cGV9IG1ldGhvZHMgXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgbWV0aG9kcyBwYXJzZWRcclxuICAgICAqL1xyXG4gICAgcGFyc2VNZXRob2RzKG1ldGhvZHM/OiBNZXRob2RUeXBlKTogTWV0aG9kVHlwZXx1bmRlZmluZWQge1xyXG4gICAgICAgIGlmKG1ldGhvZHMgPT0gdW5kZWZpbmVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIE9iamVjdC5rZXlzKG1ldGhvZHMpLmZvckVhY2goKG1ldGhvZCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgd2FzUGFyc2VkOiBudW1iZXIgPSBtZXRob2RzW21ldGhvZF0udG9TdHJpbmcoKS5zZWFyY2goXCJhbm9ueW1vdXNcIik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZih3YXNQYXJzZWQgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJzZWQ6IHN0cmluZyA9IG1ldGhvZHNbbWV0aG9kXS50b1N0cmluZygpLnJlcGxhY2UoL14uKnxbXFx9XSQvZywgXCJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5kYXRhKS5mb3JFYWNoKCh2YXJpYWJsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlZCA9IHBhcnNlZC5yZXBsYWNlQWxsKGAkZGF0YS4ke3ZhcmlhYmxlfWAsIGAkZGF0YS4ke3ZhcmlhYmxlfS52YWx1ZWApXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3RnVuYzogRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oXCJ7JHRoaXMgPSB1bmRlZmluZWQsICRkYXRhID0gdW5kZWZpbmVkfVwiLCBwYXJzZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIG1ldGhvZHNbbWV0aG9kXSA9IG5ld0Z1bmM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1ldGhvZHM7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBhbGwgdGhlIGNoaWxkcmVucyB0aGF0IGhhdmUgYW4gYWN0aW9uIGFuZCBkYXRhXHJcbiAgICAgKi9cclxuICAgIGNoZWNrRm9yQWN0aW9uc0FuZENoaWxkcygpIHtcclxuICAgICAgICBjb25zdCBwYXJlbnRTZWxlY3Rvcjogc3RyaW5nID0gYGRpdltkYXRhLWlkPSR7dGhpcy5pZH1dID4gYDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsIHRoZSBlbGVtZW50cyBzdXBwb3J0ZWQgd2l0aCBDaGV2ZXJleFxyXG4gICAgICAgICAqIEBjb25zdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yczogU2VsZWN0b3JzID0ge1xyXG4gICAgICAgICAgICBidXR0b25zIDogdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwocGFyZW50U2VsZWN0b3IgKyAnYnV0dG9uW2RhdGEtY2xpY2tdJyksXHJcbiAgICAgICAgICAgIHRleHQgICAgOiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChwYXJlbnRTZWxlY3RvciArICcqW2RhdGEtdGV4dF0nKSxcclxuICAgICAgICAgICAgaW5wdXRzICA6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgcGFyZW50U2VsZWN0b3IgKyAnaW5wdXRbZGF0YS1tb2RlbF1bdHlwZT10ZXh0XSwnICsgcGFyZW50U2VsZWN0b3IgKyAndGV4dGFyZWFbZGF0YS1tb2RlbF0nXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy9CdXR0b25zXHJcbiAgICAgICAgaWYoc2VsZWN0b3JzLmJ1dHRvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdG9ycy5idXR0b25zLmZvckVhY2goKGJ1dHRvbikgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWNrID0gbmV3IENsaWNrQWN0aW9uKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogYnV0dG9uLCBcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtY2xpY2tcIl0ucHVzaChjbGljayk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9EYXRhLXRleHRcclxuICAgICAgICBpZihzZWxlY3RvcnMudGV4dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZWN0b3JzLnRleHQuZm9yRWFjaCgodGV4dCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHR4dCA9IG5ldyBUZXh0QWN0aW9uKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogdGV4dCwgXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLCBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtdGV4dFwiXS5wdXNoKHR4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9UZXh0IElucHV0cyB3aXRoIG1vZGVsXHJcbiAgICAgICAgaWYoc2VsZWN0b3JzLmlucHV0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZWN0b3JzLmlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnAgPSBuZXcgSW5wdXRBY3Rpb24oeyBcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBpbnB1dCwgIFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZGF0YS1tb2RlbFwiXS5wdXNoKGlucCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBwYXJzZWQgZGF0YSwgd2l0aCB0aGUgZ2V0dGVyIGFuZCBzZXR0ZXJcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBvZiB0aGUgdW5wYXJzZWQgZGF0YSBvYmplY3QgXHJcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoYXQgcHJvcGVydHlcclxuICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgZGF0YVxyXG4gICAgICovXHJcbiAgICBwYXJzZWRPYmoobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogUGFyc2VkRGF0YSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5vbWJyZTogbmFtZSxcclxuICAgICAgICAgICAgX3ZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1RoZXJlJ3MgYSB3ZWlyZCBkZWxheSB3aGVuIHlvdSB0cnkgdG8gc3luYyBhbGwgaW5wdXRzLCBJIGRvbid0IGtub3cgd2h5XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jaGlsZHMhW1wiZGF0YS10ZXh0XCJdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHRleHQpID0+IHRleHQuX3ZhcmlhYmxlLm5vbWJyZSA9PSB0aGlzLm5vbWJyZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKHRleHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQuc2V0VGV4dCh0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU3luYyB0ZXh0IHdpdGggYWxsIGlucHV0cyB0aGF0IGhhdmUgdGhpcyB2YXJpYWJsZSBhcyBtb2RlbCBpbiB0aGVpciAnZGF0YS1tb2RlbCcgYXR0cmlidXRlXHJcbiAgICAgICAgICAgICAgICBzZWxmLmNoaWxkcyFbXCJkYXRhLW1vZGVsXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoaW5wdXQpID0+IGlucHV0LnZhcmlhYmxlID09IHRoaXMubm9tYnJlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5hc3NpZ25UZXh0KHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQgdmFsdWUoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGEgY3VzdG9tIGV2ZW50IGluIHRoZSBzY29wZSBvZiB0aGUgZGF0YS1hdHRhY2hlZFxyXG4gICAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0eXBlLCB0aGUgZWxlbWVudCwgYW5kIHRoZSBmdW5jdGlvbiB3aXRob3V0IGV4ZWN1dGluZ1xyXG4gICAgICovXHJcbiAgICBzZXRFdmVudChldmVudDogQ2hldmVyZUV2ZW50KSB7XHJcbiAgICAgICAgZXZlbnQuZWxlbS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LnR5cGUsICgpID0+IHtcclxuICAgICAgICAgICAgZXZlbnQuYWN0aW9uKHtcclxuICAgICAgICAgICAgICAgICR0aGlzOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgJGRhdGE6IHRoaXMuZGF0YVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG59XHJcblxyXG4vKipcclxuICogIFRoZSBtYWluIENoZXZlcmUgb2JqZWN0LCBpdCBpbml0aWFsaXplcyB0aGUgQ2hldmVyZSBmcmFtZXdvcmsgXHJcbiAqICBAY29uc3RcclxuICovXHJcbmV4cG9ydCBjb25zdCBDaGV2ZXJlOiBDaGV2ZXJlV2luZG93ID0ge1xyXG4gICAgbm9kZXM6IFtdLFxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIGEgQ2hldmVyZURhdGEgYnkgdGhlIHZhbHVlIG9mIHRoZSAnZGF0YS1hdHRhY2hlZCcgYXR0cmlidXRlIFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHIgXHJcbiAgICAgKiBAcGFyYW0ge0NoZXZlcmVEYXRhW119IGRhdGEgIFxyXG4gICAgICogQHJldHVybnMgVGhlIGRhdGEgcmVhZHkgZm9yIGluc3RhbmNlIGEgQ2hldmVyZXhOb2RlXHJcbiAgICAgKi9cclxuICAgIGZpbmRJdHNEYXRhKGF0dHIgOnN0cmluZywgZGF0YTogQ2hldmVyZURhdGFbXSk6IENoZXZlcmVEYXRhIHtcclxuICAgICAgICBsZXQgc2VhcmNoOiBDaGV2ZXJlRGF0YXx1bmRlZmluZWQgPSBkYXRhLmZpbmQoZCA9PiBkLm5hbWUgPT0gYXR0ci5yZXBsYWNlKC9cXCguKlxcKS8sIFwiXCIpKTtcclxuXHJcbiAgICAgICAgaWYoc2VhcmNoID09IHVuZGVmaW5lZCkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgJyR7YXR0cn0nIGNvdWxkbid0IGJlIGZvdW5kIGluIGFueSBvZiB5b3VyIGRlY2xhcmVkIGNvbXBvbmVudHNgKTtcclxuICAgICAgICBlbHNlIFxyXG4gICAgICAgICAgICByZXR1cm4gc2VhcmNoO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogU2VhcmNoIGZvciBDaGV2ZXJlIE5vZGVzIGF0IHRoZSBzaXRlXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBBbGwgdGhlIENoZXZlcmUgY29tcG9uZW50c1xyXG4gICAgICovXHJcbiAgICBzdGFydCguLi5kYXRhOiBDaGV2ZXJlRGF0YVtdKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IFsgLi4ucHJvcHMgXSA9IGRhdGE7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2W2RhdGEtYXR0YWNoZWRdXCIpO1xyXG5cclxuICAgICAgICAvL0NyZWF0ZSBhIENoZXZlcmVOb2RlIGZvciBlYWNoIGRhdGEtYXR0YWNoZWRcclxuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZGF0YUF0dHI6IHN0cmluZyA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtYXR0YWNoZWRcIikhO1xyXG5cclxuICAgICAgICAgICAgbGV0IGdldERhdGEgPSB0aGlzLmZpbmRJdHNEYXRhKGRhdGFBdHRyLCBwcm9wcyk7XHJcblxyXG4gICAgICAgICAgICBnZXREYXRhLnBhcnNlQXJndW1lbnRzKGRhdGFBdHRyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBub2RlID0gbmV3IENoZXZlcmVOb2RlKGdldERhdGEsIGVsKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgQ2hldmVyZSwgQ2hldmVyZURhdGEgfSBmcm9tIFwiLi9DaGV2ZXJlXCI7XHJcblxyXG5jb25zdCBiaW5kOiBDaGV2ZXJlRGF0YSA9IG5ldyBDaGV2ZXJlRGF0YSh7XHJcbiAgICBuYW1lOiAnYmluZCcsXHJcbiAgICBkYXRhOiB7XHJcbiAgICAgICAgdG9nZ2xlOiBmYWxzZVxyXG4gICAgfSxcclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgJGRhdGEudG9nZ2xlID0gISRkYXRhLnRvZ2dsZVxyXG4gICAgfVxyXG59KTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7XHJcbiAgICBDaGV2ZXJlLnN0YXJ0KGJpbmQpO1xyXG59KTsiXSwic291cmNlUm9vdCI6IiJ9