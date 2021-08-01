"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputAction = exports.ClickAction = exports.TextAction = void 0;
const Helper_1 = require("../utils/Helper");
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
//# sourceMappingURL=Index.js.map