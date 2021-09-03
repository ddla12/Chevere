import { ChevereElement, MethodType, DataType, Child, ChevereEvent, ParsedData, EventElements, ParsedArgs } from "@interfaces";
import {ChevereData} from "./ChevereData";
import {EventNode, TextNode, ModelNode, LoopNode, ShowNode } from "@actions";
import { Helper, ChildsHelper } from "@helpers";

export class ChevereNode implements ChevereElement {
    name: string;
    data: DataType;
    id: string;
    methods?: MethodType;
    element: Element;
    args: { [method: string]: ParsedArgs } = {};
    childs?: Child = {
        "event": [],
        "data-text": [],
        "data-model": [],
        "data-for": [],
        "data-show": []
    };
    canSet: boolean = false;

    constructor(data: ChevereData, el: Element) {
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
        this.id = Helper.setDataId(10);
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

        Object.entries(data).forEach(([key, value]) => {
            obj.push([key, this.parsedObj(key, value)]);
        });

        return Object.fromEntries(obj);
    }

    /**
     * Parsed the methods described in the method property of the data
     * @param {MethodType} methods
     * @returns The methods parsed
     */
    parseMethods(methods?: MethodType): MethodType | undefined {
        if (methods == undefined) return;

        Object.keys(methods).forEach((method) => {
            //If the method was already parsed
            let wasParsed: number = methods[method]
                .toString()
                .search("anonymous");

            if (wasParsed == -1) {
                let args: ParsedArgs = Helper.methodArguments(methods[method]);
            
                if(args) this.args[method] = args;

                let parsed: string = methods[method]
                    .toString()
                    .replace(/^.*|[\}]$/g, "");

                Object.keys(this.data).forEach((variable) => {
                    parsed = parsed.replaceAll(
                        `$this.data.${variable}`,
                        `$this.data.${variable}.value`,
                    );
                });

                if(this.args[method] != undefined) {
                    this.args[method]?.forEach((arg) => {
                        let str: string = `(?<=(=\\s)|(\\()|(=))(${arg})`;
                        parsed = parsed.replace(new RegExp(str, "g"), `$args.${arg}`);
                    });
                };
                
                let newFunc: Function = new Function(
                    "{$this = undefined, $event = undefined, $args = undefined}",
                    parsed,
                );

                methods[method] = newFunc;
            }
        });

        return methods;
    }

    /**
     * Find all the childrens that have an action and data
     */
    checkForActionsAndChilds() {
        /**
         * All the elements supported with Cheverex
         * @const
         */
        const loopNodes   : NodeListOf<HTMLTemplateElement> = ChildsHelper.getElementsByDataFor(this.element);

        //For nodes
        if (loopNodes.length) {
            loopNodes.forEach((loop) => {
                this.childs!["data-for"].push(new LoopNode({
                    element: loop,
                    parent: this
                }));
            });
        } else this.canSet = true;

        if(this.canSet) {
            
            const eventNodes  : EventElements       = ChildsHelper.getElementsByDataOnAttr(this.element), 
                textNodes   : NodeListOf<Element>   = ChildsHelper.getElementsByDataTextAttr(this.element),
                modelNodes  : NodeListOf<Element>   = ChildsHelper.getElementsByDataModelAttr(this.element),
                showNodes   : NodeListOf<Element>   = ChildsHelper.getElementsByDataShow(this.element);
            
            //EventNodes
            if (eventNodes) {
                eventNodes.forEach((node) => {
                    this.childs!["event"].push(new EventNode({
                        element: node[0],
                        parent: this,
                        event: node[1],
                        attrVal: node[2],
                    }));
                });
            };

            //Data-text
            if (textNodes.length) {
                textNodes.forEach((text) => {
                    this.childs!["data-text"].push(new TextNode({
                        element: text,
                        parent: this,
                    }));
                });
            };

            //Data-show
            if (showNodes.length) {
                showNodes.forEach((show) => {
                    this.childs!["data-show"].push(new ShowNode({
                        element: show as HTMLElement,
                        parent: this,
                    }));
                });
            };

            //Text Inputs with model
            if (modelNodes.length) {
                modelNodes.forEach((input) => {
                    this.childs!["data-model"].push(new ModelNode({
                        element: input,
                        parent: this,
                    }));
                });
            };
        };
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
                this._value = value;

                //There's a weird delay when you try to sync all inputs, I don't know why
                self.childs!["data-text"].filter(
                        (text) => text._variable.nombre == this.nombre,
                    ).forEach((text) => {
                        text.value = value
                    });

                //Sync text with all inputs that have this variable as model in their 'data-model' attribute
                self.childs!["data-model"].filter((input) => input.variable == this.nombre)
                    .forEach((input) => input.assignText(value));

                self.childs!["data-show"].filter((node) => node.variable.nombre == this.nombre)
                    .forEach((show) => show.toggleHidden());
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
    setEvent(event: ChevereEvent) {
        event.elem.addEventListener(event.type, () => {
            event.action({
                $this: this,
                $args: event.args
            });
        });
    }
}