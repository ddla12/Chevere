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
        this.setSelfText();
    }
    setSelfText() {
        this.element.textContent = this._variable.value.toString();
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
class InputAction {
    constructor(input) {
        this.parent = input.parent;
        this.element = input.element;
        this.variable = this.getVariable();
        //Set the default value
        this.element.value = this.parent.data[this.variable].value.toString();
        //Add the listener
        this.element.addEventListener("input", () => {
            this.setText();
        });
    }
    setText() {
        this.parent.data[this.variable].value = this.element.value.toString();
    }
    ;
    getVariable() {
        let attr = this.element.getAttribute("data-model");
        Chevere_1.Helper.checkForError(attr);
        let variable = Object.keys(this.parent.data).find((data) => data == attr);
        console.log(variable);
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
        this.actions = [];
        this.childs = {
            "data-click": [],
            "data-text": [],
            "data-model": [],
        };
        ;
        this.name = data.name;
        this.parseData(data.data);
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
    parseData(data) {
        let obj = [];
        Object.keys(data).forEach((d) => {
            obj.push([
                d,
                this.parsedObj(d, data[d])
            ]);
        });
        this.data = Object.fromEntries(obj);
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
            let newFunc = new Function("{$this = undefined, $data = undefined}", parsed);
            methods[method] = newFunc;
        });
        return methods;
    }
    checkForActionsAndChilds() {
        const parentSelector = `div[data-id=${this.id}] > `;
        const selectors = {
            buttons: this.element.querySelectorAll(parentSelector + 'button[data-click]'),
            text: this.element.querySelectorAll(parentSelector + '*[data-text]'),
            inputs: this.element.querySelectorAll(parentSelector + 'input[data-model]')
        };
        if (selectors.buttons.length) {
            selectors.buttons.forEach((button) => {
                const click = new Index_1.ClickAction({
                    element: button,
                    parent: this
                });
                this.childs["data-click"].push(click);
            });
        }
        if (selectors.text.length) {
            selectors.text.forEach((text) => {
                const txt = new Index_1.TextAction({
                    element: text,
                    parent: this,
                });
                this.childs["data-text"].push(txt);
            });
        }
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
    parsedObj(name, value) {
        const self = this;
        return {
            nombre: name,
            _value: value,
            set value(value) {
                self.childs["data-text"].forEach(text => {
                    text.setSelfText();
                });
                this._value = value;
            },
            get value() {
                return this._value;
            }
        };
    }
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
    findItsData(attr, data) {
        let search = data.find(d => d.name == attr);
        if (search == undefined)
            throw new ReferenceError(`'${attr}' couldn't be found in any of your declared components`);
        else
            return search;
    },
    start(...data) {
        let [...props] = data;
        const elements = document.querySelectorAll("div[data-attached]");
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
            alert($data.toggle);
        }
    }
});
window.addEventListener("load", () => {
    Chevere_1.Chevere.start(bind);
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9DaGV2ZXJlLy4vc3JjL0FjdGlvbnMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9DaGV2ZXJlLnRzIiwid2VicGFjazovL0NoZXZlcmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQWlEO0FBR2pELE1BQWEsVUFBVTtJQUtuQixZQUFZLElBQWtCO1FBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUUsQ0FBQztRQUV4RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0lBRUQsSUFBSSxRQUFRLENBQUMsSUFBWTtRQUNyQixnQkFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQixJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7UUFFckUsSUFBRyxDQUFDLFNBQVM7WUFDVCxNQUFNLElBQUksY0FBYyxDQUFD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TUFBTSxRQUFRLEdBQVcsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUUsQ0FBQztZQUUzRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRCxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQzs7Ozs7OztVQzVORjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7Ozs7QUN0QkEsMkVBQWlEO0FBRWpELE1BQU0sSUFBSSxHQUFnQixJQUFJLHFCQUFXLENBQUM7SUFDdEMsSUFBSSxFQUFFLE1BQU07SUFDWixJQUFJLEVBQUU7UUFDRixNQUFNLEVBQUUsS0FBSztRQUNiLElBQUksRUFBRSxNQUFNO0tBQ2Y7SUFDRCxPQUFPLEVBQUU7UUFDTCxNQUFNO1lBQ0YsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDN0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QixDQUFDO0tBQ0o7Q0FDSixDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNqQyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGV2ZXJlTm9kZSwgSGVscGVyIH0gZnJvbSBcIi4uL0NoZXZlcmVcIjtcclxuaW1wb3J0IHsgQ2xpY2ssIFRleHRSZWxhdGlvbiwgSW5wdXRNb2RlbCB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGV4dEFjdGlvbiBpbXBsZW1lbnRzIFRleHRSZWxhdGlvbiB7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIF92YXJpYWJsZT86IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBUZXh0UmVsYXRpb24pIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkYXRhLmVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldElkKDEwKSk7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gZGF0YS5wYXJlbnQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRleHRcIikhO1xyXG5cclxuICAgICAgICB0aGlzLnNldFNlbGZUZXh0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0U2VsZlRleHQoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5fdmFyaWFibGUudmFsdWUudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFyaWFibGUoYXR0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgSGVscGVyLmNoZWNrRm9yRXJyb3IoYXR0cik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBhcmVudFZhciA9IE9iamVjdC5rZXlzKHRoaXMucGFyZW50LmRhdGEpLmZpbmQoKGQpID0+IGQgPT0gYXR0cik7XHJcblxyXG4gICAgICAgIGlmKCFwYXJlbnRWYXIpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYFRoZSB2YXJpYWJsZSBvciBtZXRob2QgbmFtZWQgJyR7cGFyZW50VmFyfScgd2Fzbid0IGZvdW5kIG9uIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fdmFyaWFibGUgPSB0aGlzLnBhcmVudC5kYXRhW3BhcmVudFZhcl07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDbGlja0FjdGlvbiBpbXBsZW1lbnRzIENsaWNrIHtcclxuICAgIGVsZW1lbnQgOiBFbGVtZW50O1xyXG4gICAgcGFyZW50ICA6IENoZXZlcmVOb2RlO1xyXG4gICAgbWV0aG9kPyA6IEZ1bmN0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNsaWNrOiBDbGljaykge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGNsaWNrLmVsZW1lbnQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgSGVscGVyLnNldElkKDEwKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5wYXJlbnQgID0gY2xpY2sucGFyZW50O1xyXG5cclxuICAgICAgICB0aGlzLm1ldGhvZCA9IHRoaXMuc2VhcmNoTWV0aG9kKCk7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50Py5zZXRFdmVudCh7XHJcbiAgICAgICAgICAgIGVsZW06IHRoaXMuZWxlbWVudCxcclxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLm1ldGhvZCEsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiY2xpY2tcIlxyXG4gICAgICAgIH0pOyAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHNlYXJjaE1ldGhvZCgpOiBGdW5jdGlvbiB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNsaWNrXCIpITtcclxuXHJcbiAgICAgICAgbGV0IHNhbml0aXplZDogc3RyaW5nID0gYXR0ci5yZXBsYWNlKFwiKClcIiwgXCJcIik7XHJcblxyXG4gICAgICAgIGxldCBtZXRob2Q6IEZ1bmN0aW9uID0gdGhpcy5wYXJlbnQubWV0aG9kcyFbc2FuaXRpemVkXTtcclxuXHJcbiAgICAgICAgaWYoIW1ldGhvZCkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlcmUncyBubyBtZXRob2QgJHthdHRyfSBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWApO1xyXG5cclxuICAgICAgICByZXR1cm4gbWV0aG9kO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSW5wdXRBY3Rpb24gaW1wbGVtZW50cyBJbnB1dE1vZGVsIHtcclxuICAgIGVsZW1lbnQgOiBFbGVtZW50O1xyXG4gICAgcGFyZW50ICA6IENoZXZlcmVOb2RlO1xyXG4gICAgdmFyaWFibGU6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihpbnB1dDogSW5wdXRNb2RlbCkge1xyXG4gICAgICAgIHRoaXMucGFyZW50ID0gaW5wdXQucGFyZW50O1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGlucHV0LmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHRoaXMuZ2V0VmFyaWFibGUoKTtcclxuXHJcbiAgICAgICAgLy9TZXQgdGhlIGRlZmF1bHQgdmFsdWVcclxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSB0aGlzLnBhcmVudC5kYXRhW3RoaXMudmFyaWFibGVdLnZhbHVlLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIC8vQWRkIHRoZSBsaXN0ZW5lclxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldFRleHQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUZXh0KCkge1xyXG4gICAgICAgIHRoaXMucGFyZW50LmRhdGFbdGhpcy52YXJpYWJsZV0udmFsdWUgPSB0aGlzLmVsZW1lbnQudmFsdWUudG9TdHJpbmcoKTtcclxuICAgIH07XHJcblxyXG4gICAgZ2V0VmFyaWFibGUoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgYXR0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLW1vZGVsXCIpITtcclxuXHJcbiAgICAgICAgSGVscGVyLmNoZWNrRm9yRXJyb3IoYXR0cik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHZhcmlhYmxlID0gT2JqZWN0LmtleXModGhpcy5wYXJlbnQuZGF0YSkuZmluZCgoZGF0YSkgPT4gZGF0YSA9PSBhdHRyKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codmFyaWFibGUpO1xyXG5cclxuICAgICAgICBpZighdmFyaWFibGUpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlcmUncyBubyBhICcke2F0dHJ9JyB2YXJpYWJsZSBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gdmFyaWFibGU7XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgQWN0aW9uLCBDaGV2ZXJlRXZlbnQsIENoZXZlcmVOb2RlRGF0YSwgQ2hldmVyZVdpbmRvdywgQ2hpbGQsIERhdGFUeXBlLCBNYWluRGF0YSwgTWV0aG9kVHlwZSwgUGFyc2VkRGF0YSwgU2VsZWN0b3JzIH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBDaGV2ZXJlRWxlbWVudCB9IGZyb20gXCIuL2ludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgQ2xpY2tBY3Rpb24sIFRleHRBY3Rpb24sIElucHV0QWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9ucy9JbmRleFwiO1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBjbGFzcyBmb3IgdGhlIENoZXZlcmV4Tm9kZXMgYW5kIENoZXZlcmV4IGNoaWxkc1xyXG4gKiBAY2xhc3NcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgSGVscGVyID0ge1xyXG4gICAgc2V0SWQobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBmaW5hbDogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgY29uc3QgY2hhcnM6IHsgW3R5cGU6IHN0cmluZ106IHN0cmluZyAgfSA9IHtcclxuICAgICAgICAgICAgXCJsZXR0ZXJzXCI6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcclxuICAgICAgICAgICAgXCJtYXl1c1wiOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXHJcbiAgICAgICAgICAgIFwibnVtYmVyc1wiOiBcIjAxMjM0NTY3ODlcIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHJrZXk6IHN0cmluZyA9IE9iamVjdC5rZXlzKGNoYXJzKVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XHJcbiAgICAgICAgICAgIGZpbmFsICs9IGNoYXJzW3JrZXldW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbmd0aCldXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9LFxyXG4gICAgY2hlY2tGb3JFcnJvcihzdHI6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHBhdHRlcm46IFJlZ0V4cCA9IC9eWzAtOV18XFxzL2c7XHJcblxyXG4gICAgICAgIGlmKHBhdHRlcm4udGVzdChzdHIpKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVmFyaWFibGUgbmFtZSBjYW5ub3Qgc3RhcnQgd2l0aCBhIG51bWJlciBvciBoYXZlIHNwYWNlc1wiKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICBUaGUgY2xhc3MgdGhhdCB1c2VycyBjcmVhdGUgdGhlaXIgY29tcG9uZW50c1xyXG4gKiAgQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2hldmVyZURhdGEgaW1wbGVtZW50cyBDaGV2ZXJlTm9kZURhdGEge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZGF0YTogRGF0YVR5cGU7XHJcbiAgICBtZXRob2RzPzogTWV0aG9kVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlRGF0YSkge1xyXG4gICAgICAgIHRoaXMubmFtZSAgICAgICA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmRhdGEgICAgICAgPSBkYXRhLmRhdGE7XHJcbiAgICAgICAgdGhpcy5tZXRob2RzICAgID0gZGF0YS5tZXRob2RzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ2hldmVyZU5vZGUgaW1wbGVtZW50cyBDaGV2ZXJlRWxlbWVudCB7XHJcbiAgICBuYW1lICAgIDogc3RyaW5nICAgIDtcclxuICAgIGRhdGEgICAgOiBEYXRhVHlwZSAgO1xyXG4gICAgaWQgICAgICA6IHN0cmluZztcclxuICAgIG1ldGhvZHM/OiBNZXRob2RUeXBlO1xyXG4gICAgZWxlbWVudCA6IEVsZW1lbnQgICA7XHJcbiAgICBhY3Rpb25zPzogQWN0aW9uW10gPSBbXTtcclxuICAgIGNoaWxkcz8gOiBDaGlsZCA9IHtcclxuICAgICAgICBcImRhdGEtY2xpY2tcIjogW10sXHJcbiAgICAgICAgXCJkYXRhLXRleHRcIiA6IFtdLFxyXG4gICAgICAgIFwiZGF0YS1tb2RlbFwiOiBbXSxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZURhdGEsIGVsOiBFbGVtZW50KSB7O1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5wYXJzZURhdGEoZGF0YS5kYXRhKTtcclxuICAgICAgICBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgUGFyc2UgYWxsICR0aGlzLCAkc2VsZiwgJGRhdGEuLi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm1ldGhvZHMgICAgPSB0aGlzLnBhcnNlTWV0aG9kcyhkYXRhLm1ldGhvZHMpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgdGhlIHBhcmVudCBgZGl2YCBhbmQgZ2l2ZSBpdCBhbiBpZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBIZWxwZXIuc2V0SWQoMTApO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIHRoaXMuaWQpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgR2V0IHRoZSBldmVudHMgYW5kIGFjdGlvbnMgb2YgdGhlIGNvbXBvbmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2hlY2tGb3JBY3Rpb25zQW5kQ2hpbGRzKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlRGF0YShkYXRhOiBEYXRhVHlwZSkge1xyXG4gICAgICAgIGxldCBvYmo6IFtzdHJpbmcsIFBhcnNlZERhdGFdW10gPSBbXTtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICBvYmoucHVzaChbXHJcbiAgICAgICAgICAgICAgICBkLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZWRPYmooZCwgZGF0YVtkXSlcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YSA9IE9iamVjdC5mcm9tRW50cmllcyhvYmopO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VkIHRoZSBtZXRob2RzIGRlc2NyaWJlZCBpbiB0aGUgbWV0aG9kIHByb3BlcnR5IG9mIHRoZSBkYXRhXHJcbiAgICAgKiBAcGFyYW0ge01ldGhvZFR5cGV9IG1ldGhvZHMgXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgbWV0aG9kcyBwYXJzZWRcclxuICAgICAqL1xyXG4gICAgcGFyc2VNZXRob2RzKG1ldGhvZHM/OiBNZXRob2RUeXBlKTogTWV0aG9kVHlwZXx1bmRlZmluZWQge1xyXG4gICAgICAgIGlmKG1ldGhvZHMgPT0gdW5kZWZpbmVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIE9iamVjdC5rZXlzKG1ldGhvZHMpLmZvckVhY2goKG1ldGhvZCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcGFyc2VkOiBzdHJpbmcgPSBtZXRob2RzW21ldGhvZF0udG9TdHJpbmcoKS5yZXBsYWNlKC9eLip8W1xcfV0kL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5ld0Z1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFwieyR0aGlzID0gdW5kZWZpbmVkLCAkZGF0YSA9IHVuZGVmaW5lZH1cIiwgcGFyc2VkKTtcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHNbbWV0aG9kXSA9IG5ld0Z1bmM7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBtZXRob2RzO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBjaGVja0ZvckFjdGlvbnNBbmRDaGlsZHMoKSB7XHJcbiAgICAgICAgY29uc3QgcGFyZW50U2VsZWN0b3I6IHN0cmluZyA9IGBkaXZbZGF0YS1pZD0ke3RoaXMuaWR9XSA+IGA7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yczogU2VsZWN0b3JzID0ge1xyXG4gICAgICAgICAgICBidXR0b25zOiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChwYXJlbnRTZWxlY3RvciArICdidXR0b25bZGF0YS1jbGlja10nKSxcclxuICAgICAgICAgICAgdGV4dDogdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwocGFyZW50U2VsZWN0b3IgKyAnKltkYXRhLXRleHRdJyksXHJcbiAgICAgICAgICAgIGlucHV0czogdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwocGFyZW50U2VsZWN0b3IgKyAnaW5wdXRbZGF0YS1tb2RlbF0nKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmKHNlbGVjdG9ycy5idXR0b25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxlY3RvcnMuYnV0dG9ucy5mb3JFYWNoKChidXR0b24pID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGljayA9IG5ldyBDbGlja0FjdGlvbih7IFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGJ1dHRvbiwgXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcyFbXCJkYXRhLWNsaWNrXCJdLnB1c2goY2xpY2spO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBpZihzZWxlY3RvcnMudGV4dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZWN0b3JzLnRleHQuZm9yRWFjaCgodGV4dCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHR4dCA9IG5ldyBUZXh0QWN0aW9uKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogdGV4dCwgXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLCBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRzIVtcImRhdGEtdGV4dFwiXS5wdXNoKHR4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoc2VsZWN0b3JzLmlucHV0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZWN0b3JzLmlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnAgPSBuZXcgSW5wdXRBY3Rpb24oeyBcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBpbnB1dCwgIFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHMhW1wiZGF0YS1tb2RlbFwiXS5wdXNoKGlucCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwYXJzZWRPYmoobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogUGFyc2VkRGF0YSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbm9tYnJlOiBuYW1lLFxyXG4gICAgICAgICAgICBfdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jaGlsZHMhW1wiZGF0YS10ZXh0XCJdLmZvckVhY2godGV4dCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dC5zZXRTZWxmVGV4dCgpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldCB2YWx1ZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0RXZlbnQoZXZlbnQ6IENoZXZlcmVFdmVudCkge1xyXG4gICAgICAgIGV2ZW50LmVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudC50eXBlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LmFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICAkdGhpczogdGhpcyxcclxuICAgICAgICAgICAgICAgICRkYXRhOiB0aGlzLmRhdGFcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqICBUaGUgbWFpbiBDaGV2ZXJlIG9iamVjdCwgaXQgaW5pdGlhbGl6ZXMgdGhlIENoZXZlcmUgZnJhbWV3b3JrIFxyXG4gKiAgQGNvbnN0XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQ2hldmVyZTogQ2hldmVyZVdpbmRvdyA9IHtcclxuICAgIGZpbmRJdHNEYXRhKGF0dHIgOnN0cmluZywgZGF0YTogQ2hldmVyZURhdGFbXSk6IENoZXZlcmVEYXRhIHtcclxuICAgICAgICBsZXQgc2VhcmNoOiBDaGV2ZXJlRGF0YXx1bmRlZmluZWQgPSBkYXRhLmZpbmQoZCA9PiBkLm5hbWUgPT0gYXR0cik7XHJcblxyXG4gICAgICAgIGlmKHNlYXJjaCA9PSB1bmRlZmluZWQpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYCcke2F0dHJ9JyBjb3VsZG4ndCBiZSBmb3VuZCBpbiBhbnkgb2YgeW91ciBkZWNsYXJlZCBjb21wb25lbnRzYCk7XHJcbiAgICAgICAgZWxzZSBcclxuICAgICAgICAgICAgcmV0dXJuIHNlYXJjaDtcclxuICAgIH0sXHJcbiAgICBzdGFydCguLi5kYXRhOiBDaGV2ZXJlRGF0YVtdKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IFsgLi4ucHJvcHMgXSA9IGRhdGE7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2W2RhdGEtYXR0YWNoZWRdXCIpO1xyXG5cclxuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZGF0YUF0dHI6IHN0cmluZyA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtYXR0YWNoZWRcIikhO1xyXG5cclxuICAgICAgICAgICAgbGV0IGdldERhdGEgPSB0aGlzLmZpbmRJdHNEYXRhKGRhdGFBdHRyLCBwcm9wcyk7XHJcbiAgICAgICAgICAgIG5ldyBDaGV2ZXJlTm9kZShnZXREYXRhLCBlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IENoZXZlcmUsIENoZXZlcmVEYXRhIH0gZnJvbSBcIi4vQ2hldmVyZVwiO1xyXG5cclxuY29uc3QgYmluZDogQ2hldmVyZURhdGEgPSBuZXcgQ2hldmVyZURhdGEoe1xyXG4gICAgbmFtZTogJ2JpbmQnLFxyXG4gICAgZGF0YToge1xyXG4gICAgICAgIHRvZ2dsZTogZmFsc2VcclxuICAgICAgICB0ZXh0OiBcInRlc3RcIlxyXG4gICAgfSxcclxuICAgIG1ldGhvZHM6IHtcclxuICAgICAgICB0b2dnbGUoKSB7XHJcbiAgICAgICAgICAgICRkYXRhLnRvZ2dsZSA9ICEkZGF0YS50b2dnbGU7XHJcbiAgICAgICAgICAgIGFsZXJ0KCRkYXRhLnRvZ2dsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7XHJcbiAgICBDaGV2ZXJlLnN0YXJ0KGJpbmQpO1xyXG59KTsiXSwic291cmNlUm9vdCI6IiJ9