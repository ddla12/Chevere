"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Index_1 = require("../Actions/Index");
const Helper_1 = require("../utils/Helper");
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
//# sourceMappingURL=ChevereNode.js.map