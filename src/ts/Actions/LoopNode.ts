import ChevereNode from "../chevere/ChevereNode";
import { LoopElement, ParsedData, ParsedFor } from "../interfaces";
import { Helper } from "../utils/Helper";
import Parser from "../utils/InlineParser";

export default class LoopNode implements LoopElement {
    element: HTMLTemplateElement;
    parent: ChevereNode;
    count: number;
    variable: ParsedData;

    constructor(data: LoopElement) {
        this.element = data.element;
        this.parent = data.parent;

        let parsed: ParsedFor = Parser.parseDataForAttr(this.element.getAttribute("data-for")!, this.parent);

        this.count = parsed.count!;
        this.variable = parsed.variable!;

        this.loopElements();
    };

    loopElements(): void {
        let pos: number = Array.from(this.parent.element.children).indexOf(this.element);
        const template: DocumentFragment = document.createDocumentFragment();

        for (let i = 0; i <= this.count; i++) {
            const element = this.element.content.querySelector("div:first-of-type");

            if(!element) 
                throw new Error("The first child of your data-for element must be a div element");

            element.querySelectorAll("*[data-text]").forEach(element => {
                element.setAttribute("data-id", Helper.setDataId(10))
                element.textContent = this.variable.value[i];
            });

            template.appendChild(element?.cloneNode(true)!);

            this.element.remove();
        };

        this.parent.element.insertBefore(template, this.parent.element.children[pos]);
    }
}