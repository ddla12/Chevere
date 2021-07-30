import { ChevereEvent, ChevereNodeData, ChevereWindow, Child, DataType, Init, MethodType, ParsedData, Selectors } from "./interfaces";
import { ChevereElement } from "./interfaces";
import { ClickAction, TextAction, InputAction } from "./Actions/Index";

/**
 * Helper class for the CheverexNodes and Cheverex childs
 * @class
 * @constructor
 */
export const Helper = {
    setId(length: number): string {
        let final: string = "";

        const chars: { [type: string]: string  } = {
            "letters": "abcdefghijklmnopqrstuvwxyz",
            "mayus": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "numbers": "0123456789"
        };

        for(let i = 0; i <= length; i++) {
            let rkey: string = Object.keys(chars)[Math.floor(Math.random() * 2)];
            final += chars[rkey][Math.floor(Math.random() * length)]
        }

        return final;
    },
    checkForError(str: string) {
        const pattern: RegExp = /^[0-9]|\s/g;

        if(pattern.test(str)) 
            throw new SyntaxError("Variable name cannot start with a number or have spaces");
    }
}

/**
 *  The class that users create their components
 *  @class
 */
export class ChevereData implements ChevereNodeData {
    name: string;
    data: DataType;
    init?: Function;
    methods?: MethodType;

    constructor(data: ChevereNodeData) {
        this.name       = data.name;
        this.data       = data.data;
        this.init       = data.init;
        this.methods    = data.methods;
    }

    /**
     * Parse the custom arguments that are in the data-attached attribute
     * @param {string} args The arguments of de data-attached attribute
     */
    parseArguments(args: string): void {

        if((this.init == undefined)) return;

        //Those custom arguments to array
        let htmlArgs = args
            .trim()
            .replace(/^\w*\(/, "")
            .replace(/\)$/, "")
            .split(",");

        if(htmlArgs[0] == "") {
            this.parseInit({
                init: this.init
            })

            return;
        };

        //The arguments of the init function defined in your data
        let parsedArgs = this.init?.toString()
            .replace(/\{.*/gs, "")
            .replace("init(", "")
            .replace(")", "")
            .replaceAll(" ", "")
            .split(",")!;

        if(parsedArgs[0] == "") {
            this.parseInit({
                init: this.init
            });

            return;
        };

        //Get a valid value for the argument, for example, check for strings with unclosed quotes
        let final = htmlArgs.map(arg => {
            const n = this.name;
            let name: string = parsedArgs[htmlArgs.indexOf(arg)];

            function func(): Function {
                //Try get a valid value
                try {
                    return new Function(`return ${arg}`);
                } catch (error) {
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
            init: this.init!,
            args: data
        });
    }

    /**
     * Parse the init function and executes it
     * @param {Function} init The unparsed init function
     * @param {object} args The parsed custom arguments
     * @returns the init function
     */
    parseInit(init: Init): Function {
        //Quit curly braces 
        let func: string = init.init.toString()
            .replace(/\w.*\{/, "")
            .replace(/\}$/, "");

        //Finds the real arguments and no expressions with the same name
        if(init.args) {
            Object.keys(init.args).forEach((arg) => {
                let str: string = `(?<=(=\\s)|(\\()|(=))(${arg})`;
                func = func.replace(new RegExp(str, 'g'), `$args.${arg}`)
            });
        }

        //Create the new parsed init function
        let newFunc: Function = new Function(
            "{$this = undefined, $data = undefined, $args = undefined}",
            func
        );

        //Return the new init function and executes it
        return newFunc({
            $this: this,
            $data: this.data,
            $args: init.args
        });
    }
}

export class ChevereNode implements ChevereElement {
    name    : string    ;
    data    : DataType  ;
    id      : string;
    methods?: MethodType;
    element : Element   ;
    childs? : Child = {
        "data-click": [],
        "data-text" : [],
        "data-model": [],
    };

    constructor(data: ChevereData, el: Element) {;

        this.name = data.name;
        this.data = this.parseData(data.data);
        
        /**
         *  Parse all $this, $self, $data...
         */
        this.methods    = this.parseMethods(data.methods);

        /**
         * Get the parent `div` and give it an id
         */
        this.element = el;
        this.id = Helper.setId(10);
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
    parseData(data: DataType) {
        let obj: [string, ParsedData][] = [];

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
    parseMethods(methods?: MethodType): MethodType|undefined {
        if(methods == undefined) return;

        Object.keys(methods).forEach((method) => {
            let wasParsed: number = methods[method].toString().search("anonymous");
            
            if(wasParsed == -1) {
                let parsed: string = methods[method].toString().replace(/^.*|[\}]$/g, "");

                Object.keys(this.data).forEach((variable) => {
                    parsed = parsed.replaceAll(`$data.${variable}`, `$data.${variable}.value`)
                });

                let newFunc: Function = new Function("{$this = undefined, $data = undefined}", parsed);

                methods[method] = newFunc;
            }
        });

        return methods;
    }


    /**
     * Find all the childrens that have an action and data
     */
    checkForActionsAndChilds() {
        const parentSelector: string = `div[data-id=${this.id}] > `;

        /**
         * All the elements supported with Cheverex
         * @const
         */
        const selectors: Selectors = {
            buttons : this.element.querySelectorAll(parentSelector + 'button[data-click]'),
            text    : this.element.querySelectorAll(parentSelector + '*[data-text]'),
            inputs  : this.element.querySelectorAll(
                parentSelector + 'input[data-model][type=text],' + parentSelector + 'textarea[data-model]'
                )
        };

        //Buttons
        if(selectors.buttons.length) {
            selectors.buttons.forEach((button) => {

                const click = new ClickAction({ 
                    element: button, 
                    parent: this
                });

                this.childs!["data-click"].push(click);
            });
        }

        //Data-text
        if(selectors.text.length) {
            selectors.text.forEach((text) => {

                const txt = new TextAction({ 
                    element: text, 
                    parent: this, 
                });

                this.childs!["data-text"].push(txt);
            });
        }

        //Text Inputs with model
        if(selectors.inputs.length) {
            selectors.inputs.forEach((input) => {
                
                const inp = new InputAction({ 
                    element: input,  
                    parent: this
                });

                this.childs!["data-model"].push(inp);
            });
        }
    }

    /**
     * The parsed data, with the getter and setter
     * @param {string} name The name of the property of the unparsed data object 
     * @param {any} value the value of that property
     * @returns The parsed data
     */
    parsedObj(name: string, value: any): ParsedData {
        const self = this;

        return {
            nombre: name,
            _value: value,
            set value(value: any) {

                //There's a weird delay when you try to sync all inputs, I don't know why
                window.setTimeout(() => {
                    self.childs!["data-text"]
                        .filter((text) => text._variable.nombre == this.nombre)
                        .forEach((text) => {
                            text.setText(this.value);
                        });
                }, 100);

                //Sync text with all inputs that have this variable as model in their 'data-model' attribute
                self.childs!["data-model"]
                    .filter((input) => input.variable == this.nombre)
                    .forEach((input) => {
                        input.assignText(value);
                    });

                this._value = value;
            },
            get value() {
                return this._value;
            }
        }

    }

    /**
     * Set a custom event in the scope of the data-attached
     * @param event The event type, the element, and the function without executing
     */
    setEvent(event: ChevereEvent) {
        event.elem.addEventListener(event.type, () => {
            event.action({
                $this: this,
                $data: this.data
            });
        });
    };

}

/**
 *  The main Chevere object, it initializes the Chevere framework 
 *  @const
 */
export const Chevere: ChevereWindow = {
    nodes: [],
    /**
     * Find a ChevereData by the value of the 'data-attached' attribute 
     * @param {string} attr 
     * @param {ChevereData[]} data  
     * @returns The data ready for instance a CheverexNode
     */
    findItsData(attr :string, data: ChevereData[]): ChevereData {
        let search: ChevereData|undefined = data.find(d => d.name == attr.replace(/\(.*\)/, ""));

        if(search == undefined) 
            throw new ReferenceError(`'${attr}' couldn't be found in any of your declared components`);
        else 
            return search;
    },
    /**
     * Search for Chevere Nodes at the site
     * @param data All the Chevere components
     */
    start(...data: ChevereData[]): void {
        let [ ...props ] = data;
        const elements: NodeListOf<Element> = document.querySelectorAll("div[data-attached]");

        //Create a ChevereNode for each data-attached
        elements.forEach(el => {
            const dataAttr: string = el.getAttribute("data-attached")!;

            let getData = this.findItsData(dataAttr, props);

            getData.parseArguments(dataAttr);

            let node = new ChevereNode(getData, el);
            
            this.nodes.push(node);
        });
    }
};