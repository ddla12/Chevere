/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Actions/Index.ts":
/*!******************************!*\
  !*** ./src/Actions/Index.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClickAction = exports.TextAction = void 0;
class Actions {
}
class TextAction {
    constructor(data) {
        this.element = data.element;
        this.data = data.data;
        this.variable = this.element.getAttribute("data-text");
        this.parent = data.parent;
        this.parent.setDefaultText(this._variable, this.element);
    }
    set variable(attr) {
        const pattern = /^[0-9]|\s/g;
        if (pattern.test(attr))
            throw new SyntaxError("Variable name cannot start with a number or have spaces");
        this._variable = attr;
    }
    getActions() {
        return {
            elem: this.element,
            type: "text",
            action: this._variable,
        };
    }
}
exports.TextAction = TextAction;
class ClickAction {
    constructor(click) {
        this.data = click.data;
        this.element = click.element;
        this.parent = click.parent;
        this._action = this.action();
        this.element.addEventListener("click", () => {
            this._action();
            this.parent.resetText();
        });
    }
    action() {
        const attr = this.element.getAttribute("data-click");
        let sanitized = attr.replace("()", "");
        let method = this.data.methods[sanitized];
        if (!method)
            throw new ReferenceError(`There's no method ${attr} in the data-attached scope`);
        let strFun = this.data.methods[sanitized].toString()
            .replace(/^\w.*\(.*\)\{{0}/g, "")
            .replaceAll("this.", "this.data.data.")
            .replace(/^.*|[\}]$/g, "");
        let func = new Function(strFun);
        return func;
    }
    getActions() {
        return {
            elem: this.element,
            type: "click",
            action: this._action.toString(),
        };
    }
}
exports.ClickAction = ClickAction;
/*
export class InputAction implements InputModel {
    _variable?: any;
    data: ChildMethodType;
    parent: ChevereNode;
    element: Element;
    attached?: NodeListOf<Element>;
    name: string;

    constructor(input: InputModel) {
        this.data = input.data as DataType;
        this.parent = input.parent;
        this.element = input.element;

        this.variable = this.element.getAttribute("data-model");

        this.setValue();
        this.getAttachedEls();
    }

    getAttachedEls(): void {
        let selector: NodeListOf<Element> = document.querySelectorAll(`#${this.parent.id} > *[data-text=${this.name}]`);


        if(selector) this.attached = selector;
 
        setListener({
            type: "input",
            el: this.element,
            actions: [
                this.setTextForAttached(this.attached!).toString(),
            ],
        });
    }

    setValue(): void {
        this.element.value = this._variable;
    }

    setTextForAttached(elems: NodeListOf<Element>): void {
        elems.forEach((text) => {
            text.textContent = this.element.value;
        });
    }

    set variable(attr: string|null) {
        if(attr === null)
            throw new TypeError(`The data-model attribute is null, on your ${this.parent.data.name} component`);

        this.name = Object.keys(this.data!).filter((dat) => {
            return dat == attr;
        })[0];

        this._variable = this.data![this.name];
    }

    getActions(): Action {
        return {
            elem: this.element,
            type: "model",
            action: this._variable,
        }
    }
}*/ 


/***/ }),

/***/ "./src/Chevere.ts":
/*!************************!*\
  !*** ./src/Chevere.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Chevere = exports.ChevereNode = exports.ChevereData = void 0;
const Index_1 = __webpack_require__(/*! ./Actions/Index */ "./src/Actions/Index.ts");
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
        this._actions = [];
        this.id = this.setId(10);
        this.element = el;
        this.element.id = this.id;
        this.data = data;
        this._actions = this.checkForActions();
    }
    checkForActions() {
        let action = [];
        const selectors = {
            buttons: this.element.querySelectorAll(`#${this.id} > button[data-click]`),
            text: this.element.querySelectorAll(`#${this.id} > *[data-text]`),
            //inputs: this.element.querySelectorAll(`#${this.id} > input[data-model]`)
        };
        if (selectors.buttons.length) {
            selectors.buttons.forEach((button) => {
                const click = new Index_1.ClickAction({
                    element: button,
                    data: this.data,
                    parent: this
                });
                action.push(click.getActions());
            });
        }
        if (selectors.text.length) {
            selectors.text.forEach((text) => {
                const txt = new Index_1.TextAction({
                    element: text,
                    data: this.data,
                    parent: this
                });
                action.push(txt.getActions());
            });
        }
        /*if(selectors.inputs.length) {
            selectors.inputs.forEach((input) => {
                const inp = new InputAction({ element: input, data: this.data.data, parent: this});
                action.push(inp.getActions());
            });
        }*/
        return action;
    }
    resetText() {
        const textChilds = this._actions.filter((action) => {
            return action.type == "text";
        });
        textChilds.forEach((text) => {
            this.setDefaultText(text.action, text.elem);
        });
    }
    setDefaultText(variable, element) {
        element.textContent = this.data.data[variable].toString();
    }
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
    }
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
const toggle = new Chevere_1.ChevereData({
    name: 'toggle',
    data: {
        counter: 0
    },
    methods: {
        toggle() {
            this.counter++;
        }
    }
});
window.addEventListener("load", () => {
    Chevere_1.Chevere.start(toggle);
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9DaGV2ZXJlLy4vc3JjL0FjdGlvbnMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9DaGV2ZXJlLnRzIiwid2VicGFjazovL0NoZXZlcmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBR0EsTUFBZSxPQUFPO0NBRXJCO0FBRUQsTUFBYSxVQUFVO0lBTW5CLFlBQVksSUFBa0I7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUV0QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBRSxDQUFDO1FBRXhELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUUxQixJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsSUFBSSxRQUFRLENBQUMsSUFBWTtRQUNyQixNQUFNLE9BQU8sR0FBVyxZQUFZLENBQUM7UUFFckMsSUFBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNqQixNQUFNLElBQUksV0FBVyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7UUFFckYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVELFVBQVU7UUFDTixPQUFPO1lBQ0gsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ2xCLElBQUksRUFBRSxNQUFNO1lBQ1osTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTO1NBQ3pCO0lBQ0wsQ0FBQztDQUNKO0FBakNELGdDQWlDQztBQUVELE1BQWEs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LE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDakMsaUJBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hldmVyZU5vZGUgfSBmcm9tIFwiLi4vQ2hldmVyZVwiO1xyXG5pbXBvcnQgeyBDbGljaywgQWN0aW9uLCBUZXh0UmVsYXRpb24sIENoZXZlcmVFdmVudCwgSW5wdXRNb2RlbCwgRGF0YVR5cGUsIE1ldGhvZFR5cGUsIENoaWxkTWV0aG9kVHlwZSwgUmVsYXRlZEVsZW1lbnRzLCBTZWxlY3RvcnMgfSBmcm9tIFwiLi4vaW50ZXJmYWNlc1wiO1xyXG5cclxuYWJzdHJhY3QgY2xhc3MgQWN0aW9ucyB7XHJcbiAgICBhYnN0cmFjdCBnZXRBY3Rpb25zKCk6IEFjdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFRleHRBY3Rpb24gaW1wbGVtZW50cyBUZXh0UmVsYXRpb24sIEFjdGlvbnMge1xyXG4gICAgZWxlbWVudDogRWxlbWVudDtcclxuICAgIGRhdGE6IENoaWxkTWV0aG9kVHlwZTtcclxuICAgIF92YXJpYWJsZT86IGFueTtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogVGV4dFJlbGF0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZGF0YS5lbGVtZW50O1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGEuZGF0YTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKSE7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gZGF0YS5wYXJlbnQ7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50LnNldERlZmF1bHRUZXh0KHRoaXMuX3ZhcmlhYmxlLCB0aGlzLmVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCB2YXJpYWJsZShhdHRyOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBwYXR0ZXJuOiBSZWdFeHAgPSAvXlswLTldfFxccy9nO1xyXG5cclxuICAgICAgICBpZihwYXR0ZXJuLnRlc3QoYXR0cikpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJWYXJpYWJsZSBuYW1lIGNhbm5vdCBzdGFydCB3aXRoIGEgbnVtYmVyIG9yIGhhdmUgc3BhY2VzXCIpO1xyXG5cclxuICAgICAgICB0aGlzLl92YXJpYWJsZSA9IGF0dHI7ICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBnZXRBY3Rpb25zKCk6IEFjdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZWxlbTogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLl92YXJpYWJsZSxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDbGlja0FjdGlvbiBpbXBsZW1lbnRzIENsaWNrLCBBY3Rpb25zIHtcclxuICAgIGRhdGE6IENoaWxkTWV0aG9kVHlwZTtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBfYWN0aW9uOiBGdW5jdGlvbjtcclxuICAgIF9hcmd1bWVudHM/OiBhbnlbXTtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2xpY2s6IENsaWNrKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gY2xpY2suZGF0YSE7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gY2xpY2suZWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBjbGljay5wYXJlbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGlvbiA9IHRoaXMuYWN0aW9uKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9hY3Rpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVzZXRUZXh0KClcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhY3Rpb24oKTogRnVuY3Rpb24ge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1jbGlja1wiKSE7XHJcblxyXG4gICAgICAgIGxldCBzYW5pdGl6ZWQ6IHN0cmluZyA9IGF0dHIucmVwbGFjZShcIigpXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICBsZXQgbWV0aG9kOiBGdW5jdGlvbiA9IHRoaXMuZGF0YSEubWV0aG9kc1tzYW5pdGl6ZWRdO1xyXG5cclxuICAgICAgICBpZighbWV0aG9kKSBcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBUaGVyZSdzIG5vIG1ldGhvZCAke2F0dHJ9IGluIHRoZSBkYXRhLWF0dGFjaGVkIHNjb3BlYCk7XHJcblxyXG4gICAgICAgIGxldCBzdHJGdW46IHN0cmluZyA9IHRoaXMuZGF0YSEubWV0aG9kc1tzYW5pdGl6ZWRdLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgLnJlcGxhY2UoL15cXHcuKlxcKC4qXFwpXFx7ezB9L2csIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlQWxsKFwidGhpcy5cIiwgXCJ0aGlzLmRhdGEuZGF0YS5cIilcclxuICAgICAgICAgICAgLnJlcGxhY2UoL14uKnxbXFx9XSQvZywgXCJcIik7XHJcblxyXG4gICAgICAgIGxldCBmdW5jOiBGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbihzdHJGdW4pO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuYztcclxuICAgIH1cclxuXHJcbiAgICBnZXRBY3Rpb25zKCk6IEFjdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZWxlbTogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICB0eXBlOiBcImNsaWNrXCIsXHJcbiAgICAgICAgICAgIGFjdGlvbjogdGhpcy5fYWN0aW9uLnRvU3RyaW5nKCksXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKlxyXG5leHBvcnQgY2xhc3MgSW5wdXRBY3Rpb24gaW1wbGVtZW50cyBJbnB1dE1vZGVsIHtcclxuICAgIF92YXJpYWJsZT86IGFueTtcclxuICAgIGRhdGE6IENoaWxkTWV0aG9kVHlwZTtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcbiAgICBlbGVtZW50OiBFbGVtZW50O1xyXG4gICAgYXR0YWNoZWQ/OiBOb2RlTGlzdE9mPEVsZW1lbnQ+O1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlucHV0OiBJbnB1dE1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gaW5wdXQuZGF0YSBhcyBEYXRhVHlwZTtcclxuICAgICAgICB0aGlzLnBhcmVudCA9IGlucHV0LnBhcmVudDtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBpbnB1dC5lbGVtZW50O1xyXG5cclxuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtbW9kZWxcIik7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoKTtcclxuICAgICAgICB0aGlzLmdldEF0dGFjaGVkRWxzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QXR0YWNoZWRFbHMoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgIyR7dGhpcy5wYXJlbnQuaWR9ID4gKltkYXRhLXRleHQ9JHt0aGlzLm5hbWV9XWApO1xyXG5cclxuXHJcbiAgICAgICAgaWYoc2VsZWN0b3IpIHRoaXMuYXR0YWNoZWQgPSBzZWxlY3RvcjtcclxuIFxyXG4gICAgICAgIHNldExpc3RlbmVyKHtcclxuICAgICAgICAgICAgdHlwZTogXCJpbnB1dFwiLFxyXG4gICAgICAgICAgICBlbDogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRleHRGb3JBdHRhY2hlZCh0aGlzLmF0dGFjaGVkISkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRWYWx1ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSB0aGlzLl92YXJpYWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUZXh0Rm9yQXR0YWNoZWQoZWxlbXM6IE5vZGVMaXN0T2Y8RWxlbWVudD4pOiB2b2lkIHtcclxuICAgICAgICBlbGVtcy5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHQudGV4dENvbnRlbnQgPSB0aGlzLmVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHZhcmlhYmxlKGF0dHI6IHN0cmluZ3xudWxsKSB7XHJcbiAgICAgICAgaWYoYXR0ciA9PT0gbnVsbClcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVGhlIGRhdGEtbW9kZWwgYXR0cmlidXRlIGlzIG51bGwsIG9uIHlvdXIgJHt0aGlzLnBhcmVudC5kYXRhLm5hbWV9IGNvbXBvbmVudGApO1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEhKS5maWx0ZXIoKGRhdCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ID09IGF0dHI7XHJcbiAgICAgICAgfSlbMF07XHJcblxyXG4gICAgICAgIHRoaXMuX3ZhcmlhYmxlID0gdGhpcy5kYXRhIVt0aGlzLm5hbWVdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFjdGlvbnMoKTogQWN0aW9uIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBlbGVtOiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIHR5cGU6IFwibW9kZWxcIixcclxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLl92YXJpYWJsZSxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0qLyIsImltcG9ydCB7IEFjdGlvbiwgQ2hldmVyZUNvbXBvbmVudCwgQ2hldmVyZVdpbmRvdywgRGF0YVR5cGUsIE1ldGhvZFR5cGUsIFNlbGVjdG9ycyB9IGZyb20gXCIuL2ludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgQ2hldmVyZUVsZW1lbnQgfSBmcm9tIFwiLi9pbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENsaWNrQWN0aW9uLCBJbnB1dEFjdGlvbiwgVGV4dEFjdGlvbiB9IGZyb20gXCIuL0FjdGlvbnMvSW5kZXhcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDaGV2ZXJlRGF0YSBpbXBsZW1lbnRzIENoZXZlcmVDb21wb25lbnQge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZGF0YTogRGF0YVR5cGU7XHJcbiAgICBtZXRob2RzPzogTWV0aG9kVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBDaGV2ZXJlRGF0YSkge1xyXG4gICAgICAgIHRoaXMubmFtZSAgICAgICA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmRhdGEgICAgICAgPSBkYXRhLmRhdGE7XHJcbiAgICAgICAgdGhpcy5tZXRob2RzICAgID0gZGF0YS5tZXRob2RzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ2hldmVyZU5vZGUgaW1wbGVtZW50cyBDaGV2ZXJlRWxlbWVudCB7XHJcbiAgICBkYXRhOiBDaGV2ZXJlQ29tcG9uZW50O1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIF9hY3Rpb25zPzogQWN0aW9uW10gPSBbXTtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZUNvbXBvbmVudCwgZWw6IEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmlkID0gdGhpcy5zZXRJZCgxMCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5pZCA9IHRoaXMuaWQ7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGlvbnMgPSB0aGlzLmNoZWNrRm9yQWN0aW9ucygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrRm9yQWN0aW9ucygpOiBBY3Rpb25bXXx1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCBhY3Rpb246IEFjdGlvbltdID0gW107XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yczogU2VsZWN0b3JzID0ge1xyXG4gICAgICAgICAgICBidXR0b25zOiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgIyR7dGhpcy5pZH0gPiBidXR0b25bZGF0YS1jbGlja11gKSxcclxuICAgICAgICAgICAgdGV4dDogdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYCMke3RoaXMuaWR9ID4gKltkYXRhLXRleHRdYCksXHJcbiAgICAgICAgICAgIC8vaW5wdXRzOiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgIyR7dGhpcy5pZH0gPiBpbnB1dFtkYXRhLW1vZGVsXWApXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYoc2VsZWN0b3JzLmJ1dHRvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdG9ycy5idXR0b25zLmZvckVhY2goKGJ1dHRvbikgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWNrID0gbmV3IENsaWNrQWN0aW9uKHsgXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogYnV0dG9uLCBcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsIFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpc30pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFjdGlvbi5wdXNoKGNsaWNrLmdldEFjdGlvbnMoKSk7IFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHNlbGVjdG9ycy50ZXh0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxlY3RvcnMudGV4dC5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgdHh0ID0gbmV3IFRleHRBY3Rpb24oeyBcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiB0ZXh0LCBcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsIFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGhpcyBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFjdGlvbi5wdXNoKHR4dC5nZXRBY3Rpb25zKCkpOyBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKmlmKHNlbGVjdG9ycy5pbnB1dHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdG9ycy5pbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlucCA9IG5ldyBJbnB1dEFjdGlvbih7IGVsZW1lbnQ6IGlucHV0LCBkYXRhOiB0aGlzLmRhdGEuZGF0YSwgcGFyZW50OiB0aGlzfSk7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb24ucHVzaChpbnAuZ2V0QWN0aW9ucygpKTsgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gYWN0aW9uO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXNldFRleHQoKSB7XHJcbiAgICAgICAgY29uc3QgdGV4dENoaWxkczogQWN0aW9uW10gPSB0aGlzLl9hY3Rpb25zIS5maWx0ZXIoKGFjdGlvbikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uLnR5cGUgPT0gXCJ0ZXh0XCJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGV4dENoaWxkcy5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGVmYXVsdFRleHQodGV4dC5hY3Rpb24gYXMgc3RyaW5nLCB0ZXh0LmVsZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNldERlZmF1bHRUZXh0KHZhcmlhYmxlOiBzdHJpbmcsIGVsZW1lbnQ6IEVsZW1lbnQpIHtcclxuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5kYXRhLmRhdGFbdmFyaWFibGVdLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBmaW5hbDogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgY29uc3QgY2hhcnM6IHsgW3R5cGU6IHN0cmluZ106IHN0cmluZyAgfSA9IHtcclxuICAgICAgICAgICAgXCJsZXR0ZXJzXCI6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcclxuICAgICAgICAgICAgXCJtYXl1c1wiOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXHJcbiAgICAgICAgICAgIFwibnVtYmVyc1wiOiBcIjAxMjM0NTY3ODlcIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHJrZXk6IHN0cmluZyA9IE9iamVjdC5rZXlzKGNoYXJzKVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XHJcbiAgICAgICAgICAgIGZpbmFsICs9IGNoYXJzW3JrZXldW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbmd0aCldXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAgVGhlIG1haW4gQ2hldmVyZSBvYmplY3QsIGl0IGluaXRpYWxpemVzIHRoZSBDaGV2ZXJlIGZyYW1ld29yayBcclxuICogIEBjb25zdFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENoZXZlcmU6IENoZXZlcmVXaW5kb3cgPSB7XHJcbiAgICBmaW5kSXRzRGF0YShhdHRyIDpzdHJpbmcsIGRhdGE6IENoZXZlcmVEYXRhW10pOiBDaGV2ZXJlRGF0YSB7XHJcbiAgICAgICAgbGV0IHNlYXJjaDogQ2hldmVyZURhdGF8dW5kZWZpbmVkID0gZGF0YS5maW5kKGQgPT4gZC5uYW1lID09IGF0dHIpO1xyXG5cclxuICAgICAgICBpZihzZWFyY2ggPT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYCcke2F0dHJ9JyBjb3VsZG4ndCBiZSBmb3VuZCBpbiBhbnkgb2YgeW91ciBkZWNsYXJlZCBjb21wb25lbnRzYCk7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gc2VhcmNoO1xyXG4gICAgfSxcclxuICAgIHN0YXJ0KC4uLmRhdGE6IENoZXZlcmVEYXRhW10pOiB2b2lkIHtcclxuICAgICAgICBsZXQgWyAuLi5wcm9wcyBdID0gZGF0YTtcclxuICAgICAgICBjb25zdCBlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZbZGF0YS1hdHRhY2hlZF1cIik7XHJcblxyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhQXR0cjogc3RyaW5nID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1hdHRhY2hlZFwiKSE7XHJcblxyXG4gICAgICAgICAgICBsZXQgZ2V0RGF0YSA9IHRoaXMuZmluZEl0c0RhdGEoZGF0YUF0dHIsIHByb3BzKTtcclxuICAgICAgICAgICAgbmV3IENoZXZlcmVOb2RlKGdldERhdGEsIGVsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgQ2hldmVyZSwgQ2hldmVyZURhdGEgfSBmcm9tIFwiLi9DaGV2ZXJlXCI7XHJcblxyXG5jb25zdCB0b2dnbGU6IENoZXZlcmVEYXRhID0gbmV3IENoZXZlcmVEYXRhKHtcclxuICAgIG5hbWU6ICd0b2dnbGUnLFxyXG4gICAgZGF0YToge1xyXG4gICAgICAgIGNvdW50ZXI6IDBcclxuICAgIH0sXHJcbiAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgdG9nZ2xlKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvdW50ZXIrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHtcclxuICAgIENoZXZlcmUuc3RhcnQodG9nZ2xlKTtcclxufSk7Il0sInNvdXJjZVJvb3QiOiIifQ==