import Parser from "../utils/InlineParser";
import { TextRelation, findProp } from "../interfaces";
import ChevereNode from "../chevere/ChevereNode";
import { Helper } from "../utils/Helper";

export default class TextNode implements TextRelation {
    element: Element;
    parent: ChevereNode;
    _variable?: any;
    _value: any;

    constructor(data: TextRelation) {
        this.element = data.element;
        this.element.setAttribute("data-id", Helper.setDataId(10));

        this.parent = data.parent;

        this.variable = this.element.getAttribute("data-text")!;
    }

    set value(value: any) {
        this._value = value.toString();
        this.element.textContent = this._value;
    }

    set variable(attr: string) {
        Helper.checkForErrorInVariable(attr);

        let data = Parser.parseDataTextAttr(attr, this.parent);

        this._variable = data.variable;
        this.value = data.value;
    }
}