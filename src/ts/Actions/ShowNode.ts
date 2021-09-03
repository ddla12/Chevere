import { ChevereNode } from "@chevere";
import { Parser } from "@helpers";
import { ParsedData, ParsedShow, ShowChild } from "@interfaces";

export class ShowNode implements ShowChild {
    element : HTMLElement;
    parent  : ChevereNode;
    variable: ParsedData;
    value: any;

    constructor(data: ShowChild) {
        ({ element : this.element,  parent  : this.parent } = data);

        let parsedAttr: ParsedShow = Parser.parsedDataShowAttr({
            attr: this.element.getAttribute("data-show")!,
            node: this.parent
        });

        ({ value: this.value, variable: this.variable } = parsedAttr);

        this.toggleHidden();
    };

    toggleHidden(): void {
        this.element.hidden = !(Parser.parser(`${(typeof this.variable.value == "string") ? (this.variable.value + "") : this.variable.value} ${this.value}`));
    }
};