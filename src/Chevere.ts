import { Action, ChevereComponent, ChevereWindow, DataType, MethodType, Selectors } from "./interfaces";
import { ChevereElement } from "./interfaces";
import { ClickAction, InputAction, TextAction } from "./Actions/Index";

export class ChevereData implements ChevereComponent {
    name: string;
    data: DataType;
    methods?: MethodType;

    constructor(data: ChevereData) {
        this.name       = data.name;
        this.data       = data.data;
        this.methods    = data.methods;
    }
}

export class ChevereNode implements ChevereElement {
    data: ChevereComponent;
    id: string;
    _actions?: Action[] = [];
    element: Element;

    constructor(data: ChevereComponent, el: Element) {
        this.id = this.setId(10);

        this.element = el;
        this.element.id = this.id;

        this.data = data;

        this._actions = this.checkForActions();
    }

    checkForActions(): Action[]|undefined {
        let action: Action[] = [];

        const selectors: Selectors = {
            buttons: this.element.querySelectorAll(`#${this.id} > button[data-click]`),
            text: this.element.querySelectorAll(`#${this.id} > *[data-text]`),
            //inputs: this.element.querySelectorAll(`#${this.id} > input[data-model]`)
        };

        if(selectors.buttons.length) {
            selectors.buttons.forEach((button) => {

                const click = new ClickAction({ 
                    element: button, 
                    data: this.data, 
                    parent: this});

                action.push(click.getActions()); 
            });
        }

        if(selectors.text.length) {
            selectors.text.forEach((text) => {

                const txt = new TextAction({ 
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
        const textChilds: Action[] = this._actions!.filter((action) => {
            return action.type == "text"
        });

        textChilds.forEach((text) => {
            this.setDefaultText(text.action as string, text.elem);
        });
    }

    setDefaultText(variable: string, element: Element) {
        element.textContent = this.data.data[variable].toString();
    }

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
    }
}

/**
 *  The main Chevere object, it initializes the Chevere framework 
 *  @const
 */
export const Chevere: ChevereWindow = {
    findItsData(attr :string, data: ChevereData[]): ChevereData {
        let search: ChevereData|undefined = data.find(d => d.name == attr);

        if(search == undefined) throw new ReferenceError(`'${attr}' couldn't be found in any of your declared components`);
        else return search;
    },
    start(...data: ChevereData[]): void {
        let [ ...props ] = data;
        const elements: NodeListOf<Element> = document.querySelectorAll("div[data-attached]");

        elements.forEach(el => {
            const dataAttr: string = el.getAttribute("data-attached")!;

            let getData = this.findItsData(dataAttr, props);
            new ChevereNode(getData, el);
        });
    }
};