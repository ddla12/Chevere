/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Actions/Index.ts":
/*!******************************!*\
  !*** ./src/Actions/Index.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputAction = exports.ClickAction = exports.TextAction = void 0;
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
    }
    registerListener() {
        setListener({
            type: "click",
            el: this.element,
            actions: [
                this._action(),
                this.parent.resetText(),
            ],
        });
    }
    action() {
        const attr = this.element.getAttribute("data-click");
        let sanitized = attr.replace("()", "");
        let method = this.data[sanitized];
        if (!method)
            throw new ReferenceError(`There's no method ${attr} in the data-attached scope`);
        let strFun = this.data[sanitized].toString()
            .replace(/^\w.*\(.*\)\{{0}/g, "")
            .replaceAll("this.", "this.data.")
            .replace(/^.*|[\}]$/g, "");
        let func = new Function(strFun);
        return func;
    }
    getActions() {
        this.registerListener();
        return {
            elem: this.element,
            type: "click",
            action: this._action.toString(),
        };
    }
}
exports.ClickAction = ClickAction;
class InputAction {
    constructor(input) {
        this.data = input.data;
        this.parent = input.parent;
        this.element = input.element;
        this.variable = this.element.getAttribute("data-model");
        this.setValue();
        this.getAttachedEls();
    }
    getAttachedEls() {
        let selector = document.querySelectorAll(`#${this.parent.id} > *[data-text=${this.name}]`);
        if (selector)
            this.attached = selector;
        setListener({
            type: "input",
            el: this.element,
            actions: [
                this.setTextForAttached(this.attached).toString(),
            ],
        });
    }
    setValue() {
        this.element.value = this._variable;
    }
    setTextForAttached(elems) {
        elems.forEach((text) => {
            text.textContent = this.element.value;
        });
    }
    set variable(attr) {
        if (attr === null)
            throw new TypeError(`The data-model attribute is null, on your ${this.parent.data.name} component`);
        this.name = Object.keys(this.data).filter((dat) => {
            return dat == attr;
        })[0];
        this._variable = this.data[this.name];
    }
    getActions() {
        return {
            elem: this.element,
            type: "model",
            action: this._variable,
        };
    }
}
exports.InputAction = InputAction;
function setListener(event) {
    console.log(event.actions);
    event.el.addEventListener(event.type, () => {
        event.actions.forEach((action) => action.call());
    });
}


/***/ }),

/***/ "./src/Chevere.ts":
/*!************************!*\
  !*** ./src/Chevere.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Chevere = exports.ChevereNode = exports.ChevereData = void 0;
const Index_1 = __webpack_require__(/*! ./Actions/Index */ "./src/Actions/Index.ts");
/**
 * @class ChevereData
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
        this.id = this.setId(10);
        this.element = el;
        this.element.id = this.id;
        this.data = data;
        this.checkForActions();
        console.log(this);
    }
    checkForActions() {
        const selectors = {
            buttons: this.element.querySelectorAll(`#${this.id} > button[data-click]`),
            text: this.element.querySelectorAll(`#${this.id} > *[data-text]`),
            //inputs: this.element.querySelectorAll(`#${this.id} > input[data-model]`)
        };
        if (selectors.buttons.length) {
            selectors.buttons.forEach((button) => {
                const click = new Index_1.ClickAction({ element: button, data: this.data.methods, parent: this });
                this.actions.push(click.getActions());
            });
        }
        if (selectors.text.length) {
            selectors.text.forEach((text) => {
                const txt = new Index_1.TextAction({ element: text, data: this.data.data, parent: this });
                this.actions.push(txt.getActions());
            });
        }
        /*if(selectors.inputs.length) {
            selectors.inputs.forEach((input) => {
                const inp = new InputAction({ element: input, data: this.data.data, parent: this});
                action.push(inp.getActions());
            });
        }*/
    }
    resetText() {
        const textChilds = this.actions?.filter((action) => {
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
        toggle: false
    },
    methods: {
        toggle() {
            this.toggle = !this.toggle;
        }
    }
});
window.addEventListener("load", () => {
    Chevere_1.Chevere.start(toggle);
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9DaGV2ZXJlLy4vc3JjL0FjdGlvbnMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9DaGV2ZXJlLnRzIiwid2VicGFjazovL0NoZXZlcmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQ2hldmVyZS8uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBR0EsTUFBZSxPQUFPO0NBRXJCO0FBRUQsTUFBYSxVQUFVO0lBTW5CLFlBQVksSUFBa0I7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQWdCLENBQUM7UUFFbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUUsQ0FBQztRQUV4RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLElBQVk7UUFDckIsTUFBTSxPQUFPLEdBQVcsWUFBWSxDQUFDO1FBRXJDLElBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDakIsTUFBTSxJQUFJLFdBQVcsQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO1FBRXJGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRCxVQUFVO1FBQ04sT0FBTztZQUNILElBQUksRUFBRSxJQUFJLENBQUMsT0FBTztZQUNsQixJQUFJLEVBQUUsTUFBTTtZQUNaLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUztTQUN6QjtJQUNMLENBQUM7Q0FDSjtBQWpDRCxnQ0FpQ0M7QUFFRCxNQUFh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ZW50IjpbImltcG9ydCB7IENoZXZlcmVOb2RlIH0gZnJvbSBcIi4uL0NoZXZlcmVcIjtcclxuaW1wb3J0IHsgQ2hldmVyZUNvbXBvbmVudCwgQ2xpY2ssIEFjdGlvbiwgVGV4dFJlbGF0aW9uLCBDaGV2ZXJlRXZlbnQsIElucHV0TW9kZWwsIERhdGFUeXBlLCBNZXRob2RUeXBlLCBDaGlsZE1ldGhvZFR5cGUsIFJlbGF0ZWRFbGVtZW50cywgU2VsZWN0b3JzIH0gZnJvbSBcIi4uL2ludGVyZmFjZXNcIjtcclxuXHJcbmFic3RyYWN0IGNsYXNzIEFjdGlvbnMge1xyXG4gICAgYWJzdHJhY3QgZ2V0QWN0aW9ucyhhY3Rpb246IEFjdGlvbik6IEFjdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFRleHRBY3Rpb24gaW1wbGVtZW50cyBUZXh0UmVsYXRpb24sIEFjdGlvbnMge1xyXG4gICAgZWxlbWVudDogRWxlbWVudDtcclxuICAgIGRhdGE6IENoaWxkTWV0aG9kVHlwZTtcclxuICAgIF92YXJpYWJsZT86IGFueTtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogVGV4dFJlbGF0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZGF0YS5lbGVtZW50O1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGEuZGF0YSBhcyBEYXRhVHlwZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdGV4dFwiKSE7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gZGF0YS5wYXJlbnQ7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50LnNldERlZmF1bHRUZXh0KHRoaXMuX3ZhcmlhYmxlLCB0aGlzLmVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCB2YXJpYWJsZShhdHRyOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBwYXR0ZXJuOiBSZWdFeHAgPSAvXlswLTldfFxccy9nO1xyXG5cclxuICAgICAgICBpZihwYXR0ZXJuLnRlc3QoYXR0cikpIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJWYXJpYWJsZSBuYW1lIGNhbm5vdCBzdGFydCB3aXRoIGEgbnVtYmVyIG9yIGhhdmUgc3BhY2VzXCIpO1xyXG5cclxuICAgICAgICB0aGlzLl92YXJpYWJsZSA9IGF0dHI7ICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBnZXRBY3Rpb25zKCk6IEFjdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZWxlbTogdGhpcy5lbGVtZW50LFxyXG4gICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLl92YXJpYWJsZSxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDbGlja0FjdGlvbiBpbXBsZW1lbnRzIENsaWNrIHtcclxuICAgIGRhdGE6IENoaWxkTWV0aG9kVHlwZTtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBfYWN0aW9uOiBGdW5jdGlvbjtcclxuICAgIF9hcmd1bWVudHM/OiBhbnlbXTtcclxuICAgIHBhcmVudDogQ2hldmVyZU5vZGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2xpY2s6IENsaWNrKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gY2xpY2suZGF0YSBhcyBNZXRob2RUeXBlO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGNsaWNrLmVsZW1lbnQ7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50ID0gY2xpY2sucGFyZW50O1xyXG5cclxuICAgICAgICB0aGlzLl9hY3Rpb24gPSB0aGlzLmFjdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyTGlzdGVuZXIoKTogdm9pZCB7XHJcbiAgICAgICAgc2V0TGlzdGVuZXIoe1xyXG4gICAgICAgICAgICB0eXBlOiBcImNsaWNrXCIsXHJcbiAgICAgICAgICAgIGVsOiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbigpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVzZXRUZXh0KCksXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWN0aW9uKCk6IEZ1bmN0aW9uIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtY2xpY2tcIikhO1xyXG5cclxuICAgICAgICBsZXQgc2FuaXRpemVkOiBzdHJpbmcgPSBhdHRyLnJlcGxhY2UoXCIoKVwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgbGV0IG1ldGhvZDogRnVuY3Rpb24gPSB0aGlzLmRhdGFbc2FuaXRpemVkXTtcclxuXHJcbiAgICAgICAgaWYoIW1ldGhvZCkgXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlcmUncyBubyBtZXRob2QgJHthdHRyfSBpbiB0aGUgZGF0YS1hdHRhY2hlZCBzY29wZWApO1xyXG5cclxuICAgICAgICBsZXQgc3RyRnVuOiBzdHJpbmcgPSB0aGlzLmRhdGFbc2FuaXRpemVkXS50b1N0cmluZygpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eXFx3LipcXCguKlxcKVxce3swfS9nLCBcIlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZUFsbChcInRoaXMuXCIsIFwidGhpcy5kYXRhLlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXi4qfFtcXH1dJC9nLCBcIlwiKTtcclxuXHJcbiAgICAgICAgbGV0IGZ1bmM6IEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHN0ckZ1bik7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFjdGlvbnMoKTogQWN0aW9uIHtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyTGlzdGVuZXIoKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBlbGVtOiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiY2xpY2tcIixcclxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLl9hY3Rpb24udG9TdHJpbmcoKSxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbnB1dEFjdGlvbiBpbXBsZW1lbnRzIElucHV0TW9kZWwge1xyXG4gICAgX3ZhcmlhYmxlPzogYW55O1xyXG4gICAgZGF0YTogQ2hpbGRNZXRob2RUeXBlO1xyXG4gICAgcGFyZW50OiBDaGV2ZXJlTm9kZTtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBhdHRhY2hlZD86IE5vZGVMaXN0T2Y8RWxlbWVudD47XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoaW5wdXQ6IElucHV0TW9kZWwpIHtcclxuICAgICAgICB0aGlzLmRhdGEgPSBpbnB1dC5kYXRhIGFzIERhdGFUeXBlO1xyXG4gICAgICAgIHRoaXMucGFyZW50ID0gaW5wdXQucGFyZW50O1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGlucHV0LmVsZW1lbnQ7XHJcblxyXG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1tb2RlbFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSgpO1xyXG4gICAgICAgIHRoaXMuZ2V0QXR0YWNoZWRFbHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBdHRhY2hlZEVscygpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZWN0b3I6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAjJHt0aGlzLnBhcmVudC5pZH0gPiAqW2RhdGEtdGV4dD0ke3RoaXMubmFtZX1dYCk7XHJcblxyXG5cclxuICAgICAgICBpZihzZWxlY3RvcikgdGhpcy5hdHRhY2hlZCA9IHNlbGVjdG9yO1xyXG4gXHJcbiAgICAgICAgc2V0TGlzdGVuZXIoe1xyXG4gICAgICAgICAgICB0eXBlOiBcImlucHV0XCIsXHJcbiAgICAgICAgICAgIGVsOiB0aGlzLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGV4dEZvckF0dGFjaGVkKHRoaXMuYXR0YWNoZWQhKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFZhbHVlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IHRoaXMuX3ZhcmlhYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHRGb3JBdHRhY2hlZChlbGVtczogTm9kZUxpc3RPZjxFbGVtZW50Pik6IHZvaWQge1xyXG4gICAgICAgIGVsZW1zLmZvckVhY2goKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dC50ZXh0Q29udGVudCA9IHRoaXMuZWxlbWVudC52YWx1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmFyaWFibGUoYXR0cjogc3RyaW5nfG51bGwpIHtcclxuICAgICAgICBpZihhdHRyID09PSBudWxsKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgZGF0YS1tb2RlbCBhdHRyaWJ1dGUgaXMgbnVsbCwgb24geW91ciAke3RoaXMucGFyZW50LmRhdGEubmFtZX0gY29tcG9uZW50YCk7XHJcblxyXG4gICAgICAgIHRoaXMubmFtZSA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YSEpLmZpbHRlcigoZGF0KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXQgPT0gYXR0cjtcclxuICAgICAgICB9KVswXTtcclxuXHJcbiAgICAgICAgdGhpcy5fdmFyaWFibGUgPSB0aGlzLmRhdGEhW3RoaXMubmFtZV07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QWN0aW9ucygpOiBBY3Rpb24ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGVsZW06IHRoaXMuZWxlbWVudCxcclxuICAgICAgICAgICAgdHlwZTogXCJtb2RlbFwiLFxyXG4gICAgICAgICAgICBhY3Rpb246IHRoaXMuX3ZhcmlhYmxlLFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0TGlzdGVuZXIoZXZlbnQ6IENoZXZlcmVFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc29sZS5sb2coZXZlbnQuYWN0aW9ucylcclxuICAgIGV2ZW50LmVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQudHlwZSwgKCkgPT57XHJcbiAgICAgICAgZXZlbnQuYWN0aW9ucy5mb3JFYWNoKChhY3Rpb24pID0+IGFjdGlvbi5jYWxsKCkpO1xyXG4gICAgfSk7XHJcbn0iLCJpbXBvcnQgeyBBY3Rpb24sIENoZXZlcmVDb21wb25lbnQsIENoZXZlcmVXaW5kb3csIERhdGFUeXBlLCBTZWxlY3RvcnMgfSBmcm9tIFwiLi9pbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IENoZXZlcmVFbGVtZW50IH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBDbGlja0FjdGlvbiwgSW5wdXRBY3Rpb24sIFRleHRBY3Rpb24gfSBmcm9tIFwiLi9BY3Rpb25zL0luZGV4XCI7XHJcblxyXG4vKipcclxuICogQGNsYXNzIENoZXZlcmVEYXRhXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2hldmVyZURhdGEgaW1wbGVtZW50cyBDaGV2ZXJlQ29tcG9uZW50IHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGRhdGE6IG9iamVjdDtcclxuICAgIG1ldGhvZHM/OiB7IFttZXRob2Q6IHN0cmluZ106IEZ1bmN0aW9uIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZURhdGEpIHtcclxuICAgICAgICB0aGlzLm5hbWUgICAgICAgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5kYXRhICAgICAgID0gZGF0YS5kYXRhO1xyXG4gICAgICAgIHRoaXMubWV0aG9kcyAgICA9IGRhdGEubWV0aG9kcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENoZXZlcmVOb2RlIGltcGxlbWVudHMgQ2hldmVyZUVsZW1lbnQge1xyXG4gICAgZGF0YTogQ2hldmVyZUNvbXBvbmVudDtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBhY3Rpb25zPzogQWN0aW9uW10gPSBbXTtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogQ2hldmVyZUNvbXBvbmVudCwgZWw6IEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmlkID0gdGhpcy5zZXRJZCgxMCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5pZCA9IHRoaXMuaWQ7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5jaGVja0ZvckFjdGlvbnMoKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcylcclxuICAgIH1cclxuXHJcbiAgICBjaGVja0ZvckFjdGlvbnMoKSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzOiBTZWxlY3RvcnMgPSB7XHJcbiAgICAgICAgICAgIGJ1dHRvbnM6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGAjJHt0aGlzLmlkfSA+IGJ1dHRvbltkYXRhLWNsaWNrXWApLFxyXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgIyR7dGhpcy5pZH0gPiAqW2RhdGEtdGV4dF1gKSxcclxuICAgICAgICAgICAgLy9pbnB1dHM6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGAjJHt0aGlzLmlkfSA+IGlucHV0W2RhdGEtbW9kZWxdYClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZihzZWxlY3RvcnMuYnV0dG9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZWN0b3JzLmJ1dHRvbnMuZm9yRWFjaCgoYnV0dG9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGljayA9IG5ldyBDbGlja0FjdGlvbih7IGVsZW1lbnQ6IGJ1dHRvbiwgZGF0YTogdGhpcy5kYXRhLm1ldGhvZHMsIHBhcmVudDogdGhpc30pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpb25zLnB1c2goY2xpY2suZ2V0QWN0aW9ucygpKTsgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoc2VsZWN0b3JzLnRleHQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdG9ycy50ZXh0LmZvckVhY2goKHRleHQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR4dCA9IG5ldyBUZXh0QWN0aW9uKHsgZWxlbWVudDogdGV4dCwgZGF0YTogdGhpcy5kYXRhLmRhdGEsIHBhcmVudDogdGhpcyB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHR4dC5nZXRBY3Rpb25zKCkpOyBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKmlmKHNlbGVjdG9ycy5pbnB1dHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdG9ycy5pbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlucCA9IG5ldyBJbnB1dEFjdGlvbih7IGVsZW1lbnQ6IGlucHV0LCBkYXRhOiB0aGlzLmRhdGEuZGF0YSwgcGFyZW50OiB0aGlzfSk7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb24ucHVzaChpbnAuZ2V0QWN0aW9ucygpKTsgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0qL1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0VGV4dCgpIHtcclxuICAgICAgICBjb25zdCB0ZXh0Q2hpbGRzOiBBY3Rpb25bXXx1bmRlZmluZWQgPSB0aGlzLmFjdGlvbnM/LmZpbHRlcigoYWN0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBhY3Rpb24udHlwZSA9PSBcInRleHRcIlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0ZXh0Q2hpbGRzIS5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGVmYXVsdFRleHQodGV4dC5hY3Rpb24gYXMgc3RyaW5nLCB0ZXh0LmVsZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNldERlZmF1bHRUZXh0KHZhcmlhYmxlOiBzdHJpbmcsIGVsZW1lbnQ6IEVsZW1lbnQpIHtcclxuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5kYXRhLmRhdGFbdmFyaWFibGVdLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBmaW5hbDogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgY29uc3QgY2hhcnM6IHsgW3R5cGU6IHN0cmluZ106IHN0cmluZyAgfSA9IHtcclxuICAgICAgICAgICAgXCJsZXR0ZXJzXCI6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcclxuICAgICAgICAgICAgXCJtYXl1c1wiOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXHJcbiAgICAgICAgICAgIFwibnVtYmVyc1wiOiBcIjAxMjM0NTY3ODlcIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHJrZXk6IHN0cmluZyA9IE9iamVjdC5rZXlzKGNoYXJzKVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XHJcbiAgICAgICAgICAgIGZpbmFsICs9IGNoYXJzW3JrZXldW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbmd0aCldXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAgVGhlIG1haW4gQ2hldmVyZSBvYmplY3QsIGl0IGluaXRpYWxpemVzIHRoZSBDaGV2ZXJlIGZyYW1ld29yayBcclxuICogIEBjb25zdFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENoZXZlcmU6IENoZXZlcmVXaW5kb3cgPSB7XHJcbiAgICBmaW5kSXRzRGF0YShhdHRyIDpzdHJpbmcsIGRhdGE6IENoZXZlcmVEYXRhW10pOiBDaGV2ZXJlRGF0YSB7XHJcbiAgICAgICAgbGV0IHNlYXJjaDogQ2hldmVyZURhdGF8dW5kZWZpbmVkID0gZGF0YS5maW5kKGQgPT4gZC5uYW1lID09IGF0dHIpO1xyXG5cclxuICAgICAgICBpZihzZWFyY2ggPT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYCcke2F0dHJ9JyBjb3VsZG4ndCBiZSBmb3VuZCBpbiBhbnkgb2YgeW91ciBkZWNsYXJlZCBjb21wb25lbnRzYCk7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gc2VhcmNoO1xyXG4gICAgfSxcclxuICAgIHN0YXJ0KC4uLmRhdGE6IENoZXZlcmVEYXRhW10pOiB2b2lkIHtcclxuICAgICAgICBsZXQgWyAuLi5wcm9wcyBdID0gZGF0YTtcclxuICAgICAgICBjb25zdCBlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZbZGF0YS1hdHRhY2hlZF1cIik7XHJcblxyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhQXR0cjogc3RyaW5nID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1hdHRhY2hlZFwiKSE7XHJcblxyXG4gICAgICAgICAgICBsZXQgZ2V0RGF0YSA9IHRoaXMuZmluZEl0c0RhdGEoZGF0YUF0dHIsIHByb3BzKTtcclxuICAgICAgICAgICAgbmV3IENoZXZlcmVOb2RlKGdldERhdGEsIGVsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgQ2hldmVyZSwgQ2hldmVyZURhdGEgfSBmcm9tIFwiLi9DaGV2ZXJlXCI7XHJcblxyXG5jb25zdCB0b2dnbGU6IENoZXZlcmVEYXRhID0gbmV3IENoZXZlcmVEYXRhKHtcclxuICAgIG5hbWU6ICd0b2dnbGUnLFxyXG4gICAgZGF0YToge1xyXG4gICAgICAgIHRvZ2dsZTogZmFsc2VcclxuICAgIH0sXHJcbiAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgdG9nZ2xlKCkge1xyXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSA9ICF0aGlzLnRvZ2dsZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHtcclxuICAgIENoZXZlcmUuc3RhcnQodG9nZ2xlKTtcclxufSk7Il0sInNvdXJjZVJvb3QiOiIifQ==