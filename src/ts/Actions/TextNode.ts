
import { TextRelation, } from "@interfaces";
import {ChevereNode} from "@chevere";
import { Helper, Parser } from "@helpers";

export class TextNode implements TextRelation {
    element: Element;
    parent: ChevereNode;
    _variable?: any;
    _value: any;

    constructor(data: TextRelation) {
        ({ element: this.element, parent: this.parent } = data);
        
        this.element.setAttribute("data-id", Helper.setDataId(10));
        this.variable = this.element.getAttribute("data-text")!;
    }

    set value(value: any) {
        this.element.textContent = this._value = value.toString();
    }

    set variable(attr: string) {
        Helper.checkForErrorInVariable(attr);

        const data = Parser.parseDataTextAttr({
            attr: attr, 
            node: this.parent
        });

        ({variable: this._variable, value: this.value} = data);
    }
}