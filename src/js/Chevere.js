"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chevere = exports.ChevereNode = exports.ChevereData = exports.Helper = void 0;
const Index_1 = require("./Actions/Index");
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
        //The arguments described in the HTML tag
        let htmlArgs = args
            .trim()
            .replace(/^\w*\(/, "")
            .replace(/\)$/, "")
            .split(",");
        if ((this.init == undefined) && (htmlArgs[0] != ""))
            throw new Error(`There's not a init() method defined in your ${this.name} component`);
        if ((this.init == undefined))
            return;
        //The arguments of the init function defined in your data
        let parsedArgs = this.init?.toString()
            .replace(/\{.*/gs, "")
            .replace("init(", "")
            .replace(")", "")
            .replaceAll(" ", "")
            .split(",");
        if ((parsedArgs[0] == "") && (htmlArgs[0] != "")) {
            throw new Error(`The init() function of the ${this.name}() component doesn't receive any parameter`);
        }
        if ((parsedArgs.length != htmlArgs.length)) {
            throw new Error(`The init() function of the ${this.name}() component needs to receive 
            ${parsedArgs.length} parameters, ${htmlArgs.length} passed`);
        }
        if ((parsedArgs[0] != "") && (htmlArgs[0] == "")) {
            throw new Error(`The init() function of the ${this.name}() component needs to receive 
            ${parsedArgs.length} parameters, ${htmlArgs.length - 1} passed`);
        }
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
        let newFunc = new Function("{$this = undefined, $args = undefined}", func);
        //Return the new init function and executes it
        return newFunc({
            $this: this,
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
//# sourceMappingURL=Chevere.js.map