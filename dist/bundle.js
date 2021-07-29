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
        this.element.textContent = this._variable.value.toString();
    }
    setText(value) {
        this.element.textContent = value.toString();
    }
    set variable(attr) {
        Chevere_1.Helper.checkForError(attr);
        let parentVar = Object.keys(this.parent.data).find((d) => d == attr);
        if (!parentVar)
            throw new ReferenceError(`The variable or method named '${parentVar}' wasn't found on the data-attached scope`);
        this._variable = this.parent.data[parentVar];
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
        this.methods = data.methods;
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
            let parsed = methods[method].toString().replace(/^.*|[\}]$/g, "");
            Object.keys(this.data).forEach((variable) => {
                parsed = parsed.replaceAll(`$data.${variable}`, `$data.${variable}.value`);
            });
            let newFunc = new Function("{$this = undefined, $data = undefined}", parsed);
            methods[method] = newFunc;
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
            inputs: this.element.querySelectorAll(parentSelector + 'input[data-model],' + parentSelector + 'textarea[data-model]')
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
    /**
     * Find a ChevereData by the value of the 'data-attached' attribute
     * @param {string} attr
     * @param {ChevereData[]} data
     * @returns The data ready for instance a CheverexNode
     */
    findItsData(attr, data) {
        let search = data.find(d => d.name == attr);
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
            new ChevereNode(getData, el);
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
        toggle: false,
        text: "test"
    },
    methods: {
        toggle() {
            $data.toggle = !$data.toggle;
        }
    }
});
window.addEventListener("load", () => {
    Chevere_1.Chevere.start(bind);
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9DaGV2ZXJlLy4vc3JjL0FjdGlvbnMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9DaGV2ZXJlLnRzIiwid2VicGFjazovL0NoZXZlcmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQWlEO0FBR2pELE1BQWEsVUFBVTtJQUtuQixZQUFZLElBQWtCO1FBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUUsQ0FBQztRQUV4RCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0lBRUQsT0FBTyxDQUFDLEtBQVU7UUFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDaEQsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLElBQVk7UUFDckIsZ0JBQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0IsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO1FBRXJFLElBQUcsQ0FBQyxTQUFTO1lBQ1QsTUFBTSxJQUFJLGNBQWMsQ0FBQyxpQ0FBaUMsU0FBUywyQ0FBMkMsQ0FBQyxDQUFDO1FBRXBILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakQsQ0FBQztDQUNKO0FBOUJELGdDQThCQztBQUVELE1BQWEsV0FBVztJQUtwQixZQUFZLEtBQVk7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBNEIsQ0FBQztRQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsTUFBTSxHQUFJLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFFNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFbEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7WUFDbEIsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ2xCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTztZQUNwQixJQUFJLEVBQUUsT0FBTztTQUNoQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsWUFBWTtRQUNSLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBRSxDQUFDO1FBRXRELElBQUksU0FBUyxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRS9DLElBQUksTUFBTSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXZELElBQUcsQ0FBQyxNQUFNO1lBQ04sTUFBTSxJQUFJLGNBQWMsQ0FBQyxxQkFBcUIsSUFBSSw2QkFBNkIsQ0FBQyxDQUFDO1FBRXJGLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQWhDRCxrQ0FnQ0M7QUFFRDs7O0dBR0c7QUFDSCxNQUFhLFdBQVc7SUFLcEIsWUFBWSxLQUFpQjtRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBMkIsQ0FBQztRQUVqRCxrRkFBa0Y7UUFDbEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbkMsdUJBQXVCO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFdEUsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUN4QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQVU7UUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRTtJQUN6QyxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDMUUsQ0FBQztJQUFBLENBQUM7SUFFRixXQUFXO1FBQ1AsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFFLENBQUM7UUFFcEQsZ0JBQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0IsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO1FBRTFFLElBQUcsQ0FBQyxRQUFRO1lBQ1IsTUFBTSxJQUFJLGNBQWMsQ0FBQyxpQkFBaUIsSUFBSSx1Q0FBdUMsQ0FBQyxDQUFDO1FBRTNGLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7Q0FFSjtBQTFDRCxrQ0EwQ0M7Ozs7Ozs7Ozs7Ozs7O0FDakhELHFGQUF1RTtBQUV2RTs7OztHQUlHO0FBQ1UsY0FBTSxHQUFHO0lBQ2xCLEtBQUssQ0FBQyxNQUFjO1FBQ2hCLElBQUksS0FBSyxHQUFXLEVBQUUsQ0FBQztRQUV2QixNQUFNLEtBQUssR0FBZ0M7WUFDdkMsU0FBUyxFQUFFLDRCQUE0QjtZQUN2QyxPQUFPLEVBQUUsNEJBQTRCO1lBQ3JDLFNBQVMsRUFBRSxZQUFZO1NBQzFCLENBQUM7UUFFRixLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdCLElBQUksSUFBSSxHQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1NBQzNEO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNELGFBQWEsQ0FBQyxHQUFXO1FBQ3JCLE1BQU0sT0FBTyxHQUFXLFlBQVksQ0FBQztRQUVyQyxJQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ2hCLE1BQU0sSUFBSSxXQUFXLENBQUMseURBQXlELENBQUMsQ0FBQztJQUN6RixDQUFDO0NBQ0o7QUFFRDs7O0dBR0c7QUFDSCxNQUFhLFdBQVc7SUFLcEIsWUFBWSxJQUFpQjtRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFTLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLElBQUksR0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNuQyxDQUFDO0NBQ0o7QUFWRCxrQ0FVQztBQUVELE1BQWEsV0FBVztJQVlwQixZQUFZLElBQWlCLEVBQUUsRUFBVztRQU4xQyxXQUFNLEdBQVk7WUFDZCxZQUFZLEVBQUUsRUFBRTtZQUNoQixXQUFXLEVBQUcsRUFBRTtZQUNoQixZQUFZLEVBQUUsRUFBRTtTQUNuQixDQUFDO1FBRTJDLENBQUM7UUFFMUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEM7O1dBRUc7UUFDSCxJQUFJLENBQUMsT0FBTyxHQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWxEOztXQUVHO1FBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxjQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFOUM7O1dBRUc7UUFDSCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztJQUVwQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxDQUFDLElBQWM7UUFDcEIsSUFBSSxHQUFHLEdBQTJCLEVBQUUsQ0FBQztRQUVyQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzVCLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0IsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsT0FBb0I7UUFDN0IsSUFBRyxPQUFPLElBQUksU0FBUztZQUFFLE9BQU87UUFFaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNwQyxJQUFJLE1BQU0sR0FBVyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUUxRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDeEMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxRQUFRLEVBQUUsRUFBRSxTQUFTLFFBQVEsUUFBUSxDQUFDO1lBQzlFLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxPQUFPLEdBQWEsSUFBSSxRQUFRLENBQUMsd0NBQXdDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFdkYsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFHRDs7T0FFRztJQUNILHdCQUF3QjtRQUNwQixNQUFNLGNBQWMsR0FBVyxlQUFlLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUU1RDs7O1dBR0c7UUFDSCxNQUFNLFNBQVMsR0FBYztZQUN6QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEdBQUcsb0JBQW9CLENBQUM7WUFDN0UsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztZQUNwRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEdBQUcsb0JBQW9CLEdBQUcsY0FBYyxHQUFHLHNCQUFzQixDQUFDO1NBQ3pILENBQUM7UUFFRixTQUFTO1FBQ1QsSUFBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUN6QixTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUVqQyxNQUFNLEtBQUssR0FBRyxJQUFJLG1CQUFXLENBQUM7b0JBQzFCLE9BQU8sRUFBRSxNQUFNO29CQUNmLE1BQU0sRUFBRSxJQUFJO2lCQUNmLENBQUMsQ0FBQztnQkFFSCxJQUFJLENBQUMsTUFBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztTQUNOO1FBRUQsV0FBVztRQUNYLElBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDdEIsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFFNUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBVSxDQUFDO29CQUN2QixPQUFPLEVBQUUsSUFBSTtvQkFDYixNQUFNLEVBQUUsSUFBSTtpQkFDZixDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLE1BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUVELHdCQUF3QjtRQUN4QixJQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ3hCLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBRS9CLE1BQU0sR0FBRyxHQUFHLElBQUksbUJBQVcsQ0FBQztvQkFDeEIsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsTUFBTSxFQUFFLElBQUk7aUJBQ2YsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxNQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFTLENBQUMsSUFBWSxFQUFFLEtBQVU7UUFDOUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLE9BQU87WUFDSCxNQUFNLEVBQUUsSUFBSTtZQUNaLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxLQUFLLENBQUMsS0FBVTtnQkFFaEIseUVBQXlFO2dCQUN6RSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLE1BQU8sQ0FBQyxXQUFXLENBQUM7eUJBQ3BCLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQzt5QkFDdEQsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7d0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzdCLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFFUiw0RkFBNEY7Z0JBQzVGLElBQUksQ0FBQyxNQUFPLENBQUMsWUFBWSxDQUFDO3FCQUNyQixNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztxQkFDaEQsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQ2YsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUIsQ0FBQyxDQUFDLENBQUM7Z0JBRVAsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDeEIsQ0FBQztZQUNELElBQUksS0FBSztnQkFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDdkIsQ0FBQztTQUNKO0lBRUwsQ0FBQztJQUVEOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxLQUFtQjtRQUN4QixLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ1QsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQ25CLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUFBLENBQUM7Q0FFTDtBQXhMRCxrQ0F3TEM7QUFFRDs7O0dBR0c7QUFDVSxlQUFPLEdBQWtCO0lBQ2xDOzs7OztPQUtHO0lBQ0gsV0FBVyxDQUFDLElBQVksRUFBRSxJQUFtQjtRQUN6QyxJQUFJLE1BQU0sR0FBMEIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFFbkUsSUFBRyxNQUFNLElBQUksU0FBUztZQUNsQixNQUFNLElBQUksY0FBYyxDQUFDLElBQUksSUFBSSx3REFBd0QsQ0FBQyxDQUFDOztZQUUzRixPQUFPLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLEdBQUcsSUFBbUI7UUFDeEIsSUFBSSxDQUFFLEdBQUcsS0FBSyxDQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLE1BQU0sUUFBUSxHQUF3QixRQUFRLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUV0Riw2Q0FBNkM7UUFDN0MsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNsQixNQUFNLFFBQVEsR0FBVyxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBRSxDQUFDO1lBRTNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hELElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFDOzs7Ozs7O1VDL1FGO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7OztBQ3RCQSwyRUFBaUQ7QUFFakQsTUFBTSxJQUFJLEdBQWdCLElBQUkscUJBQVcsQ0FBQztJQUN0QyxJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRTtRQUNGLE1BQU0sRUFBRSxLQUFLO1FBQ2IsSUFBSSxFQUFFLE1BQU07S0FDZjtJQUNELE9BQU8sRUFBRTtRQUNMLE1BQU07WUFDRixLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNqQyxDQUFDO0tBQ0o7Q0FDSixDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNqQyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGV2ZXJlTm9kZSwgSGVscGVyIH0gZnJvbSBcIi4uL0NoZXZlcmVcIjtcclxuaW1wb3J0IHsgQ2xpY2ssIFRleHRSZWxhdGlvbiwgSW5wdXRNb2RlbCB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGV4dEFjdGlvbiBpbXBsZW1lbnRzIFRleHRSZWxhdGlvbiB7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIF92YXJpYWJsZT86IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBUZXh0UmVsYXRpb24pIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkYXRhLmVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldElkKDEwKSk7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gZGF0YS5wYXJlbnQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIikhO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLl92YXJpYWJsZS52YWx1ZS50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHQodmFsdWU6IGFueSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IHZhbHVlLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHZhcmlhYmxlKGF0dHI6IHN0cmluZykge1xyXG4gICAgICAgIEhlbHBlci5jaGVja0ZvckVycm9yKGF0dHIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwYXJlbnRWYXIgPSBPYmplY3Qua2V5cyh0aGlzLnBhcmVudC5kYXRhKS5maW5kKChkKSA9PiBkID09IGF0dHIpO1xyXG5cclxuICAgICAgICBpZighcGFyZW50VmFyKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBUaGUgdmFyaWFibGUgb3IgbWV0aG9kIG5hbWVkICcke3BhcmVudFZhcn0nIHdhc24ndCBmb3VuZCBvbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3ZhcmlhYmxlID0gdGhpcy5wYXJlbnQuZGF0YVtwYXJlbnRWYXJdO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ2xpY2tBY3Rpb24gaW1wbGVtZW50cyBDbGljayB7XHJcbiAgICBlbGVtZW50IDogRWxlbWVudDtcclxuICAgIHBhcmVudCAgOiBDaGV2ZXJlTm9kZTtcclxuICAgIG1ldGhvZD8gOiBGdW5jdGlvbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjbGljazogQ2xpY2spIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBjbGljay5lbGVtZW50IGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIEhlbHBlci5zZXRJZCgxMCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFyZW50ICA9IGNsaWNrLnBhcmVudDtcclxuXHJcbiAgICAgICAgdGhpcy5tZXRob2QgPSB0aGlzLnNlYXJjaE1ldGhvZCgpO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudD8uc2V0RXZlbnQoe1xyXG4gICAgICAgICAgICBlbGVtOiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIGFjdGlvbjogdGhpcy5tZXRob2QhLFxyXG4gICAgICAgICAgICB0eXBlOiBcImNsaWNrXCJcclxuICAgICAgICB9KTsgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBzZWFyY2hNZXRob2QoKTogRnVuY3Rpb24ge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1jbGlja1wiKSE7XHJcblxyXG4gICAgICAgIGxldCBzYW5pdGl6ZWQ6IHN0cmluZyA9IGF0dHIucmVwbGFjZShcIigpXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICBsZXQgbWV0aG9kOiBGdW5jdGlvbiA9IHRoaXMucGFyZW50Lm1ldGhvZHMhW3Nhbml0aXplZF07XHJcblxyXG4gICAgICAgIGlmKCFtZXRob2QpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYFRoZXJlJ3Mgbm8gbWV0aG9kICR7YXR0cn0gaW4gdGhlIGRhdGEtYXR0YWNoZWQgc2NvcGVgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1ldGhvZDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBjbGFzcyBmb3IgdGhvc2UgaW5wdXRzIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgYGRhdGEtbW9kZWxgIGF0dHJpYnV0ZVxyXG4gKiAgQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgSW5wdXRBY3Rpb24gaW1wbGVtZW50cyBJbnB1dE1vZGVsIHtcclxuICAgIGVsZW1lbnQgOiBIVE1MVGV4dEFyZWFFbGVtZW50fEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwYXJlbnQgIDogQ2hldmVyZU5vZGU7XHJcbiAgICB2YXJpYWJsZTogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlucHV0OiBJbnB1dE1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBpbnB1dC5wYXJlbnQ7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gaW5wdXQuZWxlbWVudCBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgICAgICAvL1NlYXJjaCBpZiB0aGUgaW5kaWNhdGVkIHZhcmlhYmxlIG9mIHRoZSBkYXRhLW1vZGVsIGF0dHJpYnV0ZSBleGlzdHMgaW4gdGhlIHNjb3BlXHJcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZ2V0VmFyaWFibGUoKTtcclxuXHJcbiAgICAgICAgLy9TZXQgdGhlIGRlZmF1bHQgdmFsdWVcclxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdLnZhbHVlLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIC8vQWRkIHRoZSBsaXN0ZW5lclxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnN5bmNUZXh0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzaWduVGV4dCh2YWx1ZTogYW55KSB7IFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKClcclxuICAgIH1cclxuXHJcbiAgICBzeW5jVGV4dCgpIHtcclxuICAgICAgICB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdLnZhbHVlID0gdGhpcy5lbGVtZW50LnZhbHVlLnRvU3RyaW5nKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdldFZhcmlhYmxlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGF0dHIgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1tb2RlbFwiKSE7XHJcblxyXG4gICAgICAgIEhlbHBlci5jaGVja0ZvckVycm9yKGF0dHIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB2YXJpYWJsZSA9IE9iamVjdC5rZXlzKHRoaXMucGFyZW50LmRhdGEpLmZpbmQoKGRhdGEpID0+IGRhdGEgPT0gYXR0cik7XHJcblxyXG4gICAgICAgIGlmKCF2YXJpYWJsZSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBUaGVyZSdzIG5vIGEgJyR7YXR0cn0nIHZhcmlhYmxlIGluIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIHJldHVybiB2YXJpYWJsZTtcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBDaGV2ZXJlRXZlbnQsIENoZXZlcmVOb2RlRGF0YSwgQ2hldmVyZVdpbmRvdywgQ2hpbGQsIERhdGFUeXBlLCBNZXRob2RUeXBlLCBQYXJzZWREYXRhLCBTZWxlY3RvcnMgfSBmcm9tIFwiLi9pbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENoZXZlcmVFbGVtZW50IH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBDbGlja0FjdGlvbiwgVGV4dEFjdGlvbiwgSW5wdXRBY3Rpb24gfSBmcm9tIFwiLi9BY3Rpb25zL0luZGV4XCI7XHJcblxyXG4vKipcclxuICogSGVscGVyIGNsYXNzIGZvciB0aGUgQ2hldmVyZXhOb2RlcyBhbmQgQ2hldmVyZXggY2hpbGRzXHJcbiAqIEBjbGFzc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmV4cG9ydCBjb25zdCBIZWxwZXIgPSB7XHJcbiAgICBzZXRJZChsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGZpbmFsOiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgICAgICBjb25zdCBjaGFyczogeyBbdHlwZTogc3RyaW5nXTogc3RyaW5nICB9ID0ge1xyXG4gICAgICAgICAgICBcImxldHRlcnNcIjogXCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiLFxyXG4gICAgICAgICAgICBcIm1heXVzXCI6IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcIixcclxuICAgICAgICAgICAgXCJudW1iZXJzXCI6IFwiMDEyMzQ1Njc4OVwiXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8PSBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcmtleTogc3RyaW5nID0gT2JqZWN0LmtleXMoY2hhcnMpW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXTtcclxuICAgICAgICAgICAgZmluYWwgKz0gY2hhcnNbcmtleV1bTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGVuZ3RoKV1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmaW5hbDtcclxuICAgIH0sXHJcbiAgICBjaGVja0ZvckVycm9yKHN0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgcGF0dGVybjogUmVnRXhwID0gL15bMC05XXxcXHMvZztcclxuXHJcbiAgICAgICAgaWYocGF0dGVybi50ZXN0KHN0cikpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJWYXJpYWJsZSBuYW1lIGNhbm5vdCBzdGFydCB3aXRoIGEgbnVtYmVyIG9yIGhhdmUgc3BhY2VzXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIFRoZSBjbGFzcyB0aGF0IHVzZXJzIGNyZWF0ZSB0aGVpciBjb21wb25lbnRzXHJcbiAqICBAY2xhc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlRGF0YSBpbXBsZW1lbnRzIENoZXZlcmVOb2RlRGF0YSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBkYXRhOiBEYXRhVHlwZTtcclxuICAgIG1ldGhvZHM/OiBNZXRob2RUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IENoZXZlcmVEYXRhKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lICAgICAgID0gZGF0YS5uYW1lO1xyXG4gICAgICAgIHRoaXMuZGF0YSAgICAgICA9IGRhdGEuZGF0YTtcclxuICAgICAgICB0aGlzLm1ldGhvZHMgICAgPSBkYXRhLm1ldGhvZHM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlTm9kZSBpbXBsZW1lbnRzIENoZXZlcmVFbGVtZW50IHtcclxuICAgIG5hbWUgICAgOiBzdHJpbmcgICAgO1xyXG4gICAgZGF0YSAgICA6IERhdGFUeXBlICA7XHJcbiAgICBpZCAgICAgIDogc3RyaW5nO1xyXG4gICAgbWV0aG9kcz86IE1ldGhvZFR5cGU7XHJcbiAgICBlbGVtZW50IDogRWxlbWVudCAgIDtcclxuICAgIGNoaWxkcz8gOiBDaGlsZCA9IHtcclxuICAgICAgICBcImRhdGEtY2xpY2tcIjogW10sXHJcbiAgICAgICAgXCJkYXRhLXRleHRcIiA6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1tb2RlbFwiOiBbXSxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZURhdGEsIGVsOiBFbGVtZW50KSB7O1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5wYXJzZURhdGEoZGF0YS5kYXRhKTtcclxuICAgICAgICBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgUGFyc2UgYWxsICR0aGlzLCAkc2VsZiwgJGRhdGEuLi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm1ldGhvZHMgICAgPSB0aGlzLnBhcnNlTWV0aG9kcyhkYXRhLm1ldGhvZHMpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgdGhlIHBhcmVudCBgZGl2YCBhbmQgZ2l2ZSBpdCBhbiBpZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBIZWxwZXIuc2V0SWQoMTApO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIHRoaXMuaWQpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgR2V0IHRoZSBldmVudHMgYW5kIGFjdGlvbnMgb2YgdGhlIGNvbXBvbmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2hlY2tGb3JBY3Rpb25zQW5kQ2hpbGRzKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgYWxsIHRoZSBkYXRhLCB0aGV5IG5lZWQgZ2V0dGVyIGFuZCBhIHNldHRlclxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIHByaW1pdGl2ZSBkYXRhXHJcbiAgICAgKi9cclxuICAgIHBhcnNlRGF0YShkYXRhOiBEYXRhVHlwZSkge1xyXG4gICAgICAgIGxldCBvYmo6IFtzdHJpbmcsIFBhcnNlZERhdGFdW10gPSBbXTtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICBvYmoucHVzaChbXHJcbiAgICAgICAgICAgICAgICBkLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZWRPYmooZCwgZGF0YVtkXSlcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMob2JqKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlZCB0aGUgbWV0aG9kcyBkZXNjcmliZWQgaW4gdGhlIG1ldGhvZCBwcm9wZXJ0eSBvZiB0aGUgZGF0YVxyXG4gICAgICogQHBhcmFtIHtNZXRob2RUeXBlfSBtZXRob2RzIFxyXG4gICAgICogQHJldHVybnMgVGhlIG1ldGhvZHMgcGFyc2VkXHJcbiAgICAgKi9cclxuICAgIHBhcnNlTWV0aG9kcyhtZXRob2RzPzogTWV0aG9kVHlwZSk6IE1ldGhvZFR5cGV8dW5kZWZpbmVkIHtcclxuICAgICAgICBpZihtZXRob2RzID09IHVuZGVmaW5lZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBPYmplY3Qua2V5cyhtZXRob2RzKS5mb3JFYWNoKChtZXRob2QpID0+IHtcclxuICAgICAgICAgICAgbGV0IHBhcnNlZDogc3RyaW5nID0gbWV0aG9kc1ttZXRob2RdLnRvU3RyaW5nKCkucmVwbGFjZSgvXi4qfFtcXH1dJC9nLCBcIlwiKTtcclxuXHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHBhcnNlZCA9IHBhcnNlZC5yZXBsYWNlQWxsKGAkZGF0YS4ke3ZhcmlhYmxlfWAsIGAkZGF0YS4ke3ZhcmlhYmxlfS52YWx1ZWApXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFwieyR0aGlzID0gdW5kZWZpbmVkLCAkZGF0YSA9IHVuZGVmaW5lZH1cIiwgcGFyc2VkKTtcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHNbbWV0aG9kXSA9IG5ld0Z1bmM7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBtZXRob2RzO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgYWxsIHRoZSBjaGlsZHJlbnMgdGhhdCBoYXZlIGFuIGFjdGlvbiBhbmQgZGF0YVxyXG4gICAgICovXHJcbiAgICBjaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKSB7XHJcbiAgICAgICAgY29uc3QgcGFyZW50U2VsZWN0b3I6IHN0cmluZyA9IGBkaXZbZGF0YS1pZD0ke3RoaXMuaWR9XSA+IGA7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsbCB0aGUgZWxlbWVudHMgc3VwcG9ydGVkIHdpdGggQ2hldmVyZXhcclxuICAgICAgICAgKiBAY29uc3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdCBzZWxlY3RvcnM6IFNlbGVjdG9ycyA9IHtcclxuICAgICAgICAgICAgYnV0dG9uczogdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwocGFyZW50U2VsZWN0b3IgKyAnYnV0dG9uW2RhdGEtY2xpY2tdJyksXHJcbiAgICAgICAgICAgIHRleHQ6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHBhcmVudFNlbGVjdG9yICsgJypbZGF0YS10ZXh0XScpLFxyXG4gICAgICAgICAgICBpbnB1dHM6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHBhcmVudFNlbGVjdG9yICsgJ2lucHV0W2RhdGEtbW9kZWxdLCcgKyBwYXJlbnRTZWxlY3RvciArICd0ZXh0YXJlYVtkYXRhLW1vZGVsXScpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy9CdXR0b25zXHJcbiAgICAgICAgaWYoc2VsZWN0b3JzLmJ1dHRvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdG9ycy5idXR0b25zLmZvckVhY2goKGJ1dHRvbikgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWNrID0gbmV3IENsaWNrQWN0aW9uKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogYnV0dG9uLCBcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtY2xpY2tcIl0ucHVzaChjbGljayk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9EYXRhLXRleHRcclxuICAgICAgICBpZihzZWxlY3RvcnMudGV4dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZWN0b3JzLnRleHQuZm9yRWFjaCgodGV4dCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHR4dCA9IG5ldyBUZXh0QWN0aW9uKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogdGV4dCwgXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLCBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtdGV4dFwiXS5wdXNoKHR4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9UZXh0IElucHV0cyB3aXRoIG1vZGVsXHJcbiAgICAgICAgaWYoc2VsZWN0b3JzLmlucHV0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZWN0b3JzLmlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnAgPSBuZXcgSW5wdXRBY3Rpb24oeyBcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBpbnB1dCwgIFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZGF0YS1tb2RlbFwiXS5wdXNoKGlucCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBwYXJzZWQgZGF0YSwgd2l0aCB0aGUgZ2V0dGVyIGFuZCBzZXR0ZXJcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBvZiB0aGUgdW5wYXJzZWQgZGF0YSBvYmplY3QgXHJcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoYXQgcHJvcGVydHlcclxuICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgZGF0YVxyXG4gICAgICovXHJcbiAgICBwYXJzZWRPYmoobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogUGFyc2VkRGF0YSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbm9tYnJlOiBuYW1lLFxyXG4gICAgICAgICAgICBfdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vVGhlcmUncyBhIHdlaXJkIGRlbGF5IHdoZW4geW91IHRyeSB0byBzeW5jIGFsbCBpbnB1dHMsIEkgZG9uJ3Qga25vdyB3aHlcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmNoaWxkcyFbXCJkYXRhLXRleHRcIl1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigodGV4dCkgPT4gdGV4dC5fdmFyaWFibGUubm9tYnJlID09IHRoaXMubm9tYnJlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC5zZXRUZXh0KHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TeW5jIHRleHQgd2l0aCBhbGwgaW5wdXRzIHRoYXQgaGF2ZSB0aGlzIHZhcmlhYmxlIGFzIG1vZGVsIGluIHRoZWlyICdkYXRhLW1vZGVsJyBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgICAgIHNlbGYuY2hpbGRzIVtcImRhdGEtbW9kZWxcIl1cclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChpbnB1dCkgPT4gaW5wdXQudmFyaWFibGUgPT0gdGhpcy5ub21icmUpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LmFzc2lnblRleHQodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldCB2YWx1ZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgYSBjdXN0b20gZXZlbnQgaW4gdGhlIHNjb3BlIG9mIHRoZSBkYXRhLWF0dGFjaGVkXHJcbiAgICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHR5cGUsIHRoZSBlbGVtZW50LCBhbmQgdGhlIGZ1bmN0aW9uIHdpdGhvdXQgZXhlY3V0aW5nXHJcbiAgICAgKi9cclxuICAgIHNldEV2ZW50KGV2ZW50OiBDaGV2ZXJlRXZlbnQpIHtcclxuICAgICAgICBldmVudC5lbGVtLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQudHlwZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBldmVudC5hY3Rpb24oe1xyXG4gICAgICAgICAgICAgICAgJHRoaXM6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAkZGF0YTogdGhpcy5kYXRhXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiAgVGhlIG1haW4gQ2hldmVyZSBvYmplY3QsIGl0IGluaXRpYWxpemVzIHRoZSBDaGV2ZXJlIGZyYW1ld29yayBcclxuICogIEBjb25zdFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENoZXZlcmU6IENoZXZlcmVXaW5kb3cgPSB7XHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgYSBDaGV2ZXJlRGF0YSBieSB0aGUgdmFsdWUgb2YgdGhlICdkYXRhLWF0dGFjaGVkJyBhdHRyaWJ1dGUgXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0ciBcclxuICAgICAqIEBwYXJhbSB7Q2hldmVyZURhdGFbXX0gZGF0YSAgXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgZGF0YSByZWFkeSBmb3IgaW5zdGFuY2UgYSBDaGV2ZXJleE5vZGVcclxuICAgICAqL1xyXG4gICAgZmluZEl0c0RhdGEoYXR0ciA6c3RyaW5nLCBkYXRhOiBDaGV2ZXJlRGF0YVtdKTogQ2hldmVyZURhdGEge1xyXG4gICAgICAgIGxldCBzZWFyY2g6IENoZXZlcmVEYXRhfHVuZGVmaW5lZCA9IGRhdGEuZmluZChkID0+IGQubmFtZSA9PSBhdHRyKTtcclxuXHJcbiAgICAgICAgaWYoc2VhcmNoID09IHVuZGVmaW5lZCkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgJyR7YXR0cn0nIGNvdWxkbid0IGJlIGZvdW5kIGluIGFueSBvZiB5b3VyIGRlY2xhcmVkIGNvbXBvbmVudHNgKTtcclxuICAgICAgICBlbHNlIFxyXG4gICAgICAgICAgICByZXR1cm4gc2VhcmNoO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogU2VhcmNoIGZvciBDaGV2ZXJlIE5vZGVzIGF0IHRoZSBzaXRlXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBBbGwgdGhlIENoZXZlcmUgY29tcG9uZW50c1xyXG4gICAgICovXHJcbiAgICBzdGFydCguLi5kYXRhOiBDaGV2ZXJlRGF0YVtdKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IFsgLi4ucHJvcHMgXSA9IGRhdGE7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2W2RhdGEtYXR0YWNoZWRdXCIpO1xyXG5cclxuICAgICAgICAvL0NyZWF0ZSBhIENoZXZlcmVOb2RlIGZvciBlYWNoIGRhdGEtYXR0YWNoZWRcclxuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZGF0YUF0dHI6IHN0cmluZyA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtYXR0YWNoZWRcIikhO1xyXG5cclxuICAgICAgICAgICAgbGV0IGdldERhdGEgPSB0aGlzLmZpbmRJdHNEYXRhKGRhdGFBdHRyLCBwcm9wcyk7XHJcbiAgICAgICAgICAgIG5ldyBDaGV2ZXJlTm9kZShnZXREYXRhLCBlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IENoZXZlcmUsIENoZXZlcmVEYXRhIH0gZnJvbSBcIi4vQ2hldmVyZVwiO1xyXG5cclxuY29uc3QgYmluZDogQ2hldmVyZURhdGEgPSBuZXcgQ2hldmVyZURhdGEoe1xyXG4gICAgbmFtZTogJ2JpbmQnLFxyXG4gICAgZGF0YToge1xyXG4gICAgICAgIHRvZ2dsZTogZmFsc2VcclxuICAgICAgICB0ZXh0OiBcInRlc3RcIlxyXG4gICAgfSxcclxuICAgIG1ldGhvZHM6IHtcclxuICAgICAgICB0b2dnbGUoKSB7XHJcbiAgICAgICAgICAgICRkYXRhLnRvZ2dsZSA9ICEkZGF0YS50b2dnbGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7XHJcbiAgICBDaGV2ZXJlLnN0YXJ0KGJpbmQpO1xyXG59KTsiXSwic291cmNlUm9vdCI6IiJ9