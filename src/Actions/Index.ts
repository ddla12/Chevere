import { ChevereNode } from "../Chevere";
import { ChevereComponent, Click, Action, TextRelation, ChevereEvent, InputModel, DataType, MethodType, ChildMethodType, RelatedElements, Selectors } from "../interfaces";

abstract class Actions {
    abstract getActions(action: Action): Action;
}

export class TextAction implements TextRelation, Actions {
    element: Element;
    data: ChildMethodType;
    _variable?: any;
    parent: ChevereNode;

    constructor(data: TextRelation) {
        this.element = data.element;
        this.data = data.data as DataType;
        
        this.variable = this.element.getAttribute("data-text")!;

        this.parent = data.parent;

        this.parent.setDefaultText(this._variable, this.element);
    }

    set variable(attr: string) {
        const pattern: RegExp = /^[0-9]|\s/g;

        if(pattern.test(attr)) 
            throw new SyntaxError("Variable name cannot start with a number or have spaces");

        this._variable = attr;        
    }

    getActions(): Action {
        return {
            elem: this.element,
            type: "text",
            action: this._variable,
        }
    }
}

export class ClickAction implements Click {
    data: ChildMethodType;
    element: Element;
    _action: Function;
    _arguments?: any[];
    parent: ChevereNode;

    constructor(click: Click) {
        this.data = click.data as MethodType;
        this.element = click.element;

        this.parent = click.parent;

        this._action = this.action();
    }

    registerListener(): void {
        setListener({
            type: "click",
            el: this.element,
            actions: [
                this._action(),
                this.parent.resetText(),
            ],
        });
    }

    action(): Function {
        const attr = this.element.getAttribute("data-click")!;

        let sanitized: string = attr.replace("()", "");

        let method: Function = this.data[sanitized];

        if(!method) 
            throw new ReferenceError(`There's no method ${attr} in the data-attached scope`);

        let strFun: string = this.data[sanitized].toString()
            .replace(/^\w.*\(.*\)\{{0}/g, "")
            .replaceAll("this.", "this.data.")
            .replace(/^.*|[\}]$/g, "");

        let func: Function = new Function(strFun);

        return func;
    }

    getActions(): Action {
        this.registerListener();
        return {
            elem: this.element,
            type: "click",
            action: this._action.toString(),
        }
    }
}

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
}

function setListener(event: ChevereEvent): void {
    console.log(event.actions)
    event.el.addEventListener(event.type, () =>{
        event.actions.forEach((action) => action.call());
    });
}