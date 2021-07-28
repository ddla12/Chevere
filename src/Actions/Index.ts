import { ChevereNode, Helper } from "../Chevere";
import { Click, TextRelation, InputModel } from "../interfaces";

export class TextAction implements TextRelation {
    element: Element;
    parent: ChevereNode;
    _variable?: any;

    constructor(data: TextRelation) {
        this.element = data.element;
        this.element.setAttribute("data-id", Helper.setId(10));

        this.parent = data.parent;
        
        this.variable = this.element.getAttribute("data-text")!;

        this.setSelfText();
    }

    setSelfText() {
        this.element.textContent = this._variable.value.toString();
    }

    set variable(attr: string) {
        Helper.checkForError(attr);
        
        let parentVar = Object.keys(this.parent.data).find((d) => d == attr);

        if(!parentVar) 
            throw new ReferenceError(`The variable or method named '${parentVar}' wasn't found on the data-attached scope`);
        
        this._variable = this.parent.data[parentVar];
    }
}

export class ClickAction implements Click {
    element : Element;
    parent  : ChevereNode;
    method? : Function;

    constructor(click: Click) {
        this.element = click.element as HTMLButtonElement;
        this.element.setAttribute("data-id", Helper.setId(10));
        
        this.parent  = click.parent;

        this.method = this.searchMethod();

        this.parent?.setEvent({
            elem: this.element,
            action: this.method!,
            type: "click"
        });      
    }

    searchMethod(): Function {
        const attr = this.element.getAttribute("data-click")!;

        let sanitized: string = attr.replace("()", "");

        let method: Function = this.parent.methods![sanitized];

        if(!method) 
            throw new ReferenceError(`There's no method ${attr} in the data-attached scope`);

        return method;
    }
}

export class InputAction implements InputModel {
    element : Element;
    parent  : ChevereNode;
    variable: string;

    constructor(input: InputModel) {
        this.parent = input.parent;
        this.element = input.element as HTMLInputElement;

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
    };

    getVariable(): string {
        let attr = this.element.getAttribute("data-model")!;

        Helper.checkForError(attr);
        
        let variable = Object.keys(this.parent.data).find((data) => data == attr);

        console.log(variable);

        if(!variable)
            throw new ReferenceError(`There's no a '${attr}' variable in the data-attached scope`);
            
        return variable;
    }

}