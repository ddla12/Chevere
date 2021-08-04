import {ChevereNode} from "@chevere";
import { LoopElement, ParsedData, ParsedFor } from "@interfaces";
import {TextNode} from "./TextNode";
import {Parser} from "@helpers";

export class LoopNode implements LoopElement {
    element: HTMLTemplateElement;
    parent: ChevereNode;
    variable: ParsedData;
    expressions?: string[];

    constructor(data: LoopElement) {
        this.element = data.element;
        this.parent = data.parent;

        let parsed: ParsedFor = Parser.parseDataForAttr(this.element.getAttribute("data-for")!, this.parent);

        this.variable       = parsed.variable!;
        this.expressions    = parsed.expressions!;

        if(typeof this.variable.value == "string") 
            throw new EvalError(`Cannot set a 'for..in' loop in type ${typeof this.variable.value}`);        

        this.loopElements();
        this.element.remove();
    };

    loopElements(): void {
        let pos: number = Array.from(this.parent.element.children).indexOf(this.element);

        const template: DocumentFragment = document.createDocumentFragment(),
            element = this.element.content.querySelector("div:first-child");

        if(!element) throw new Error("The first child of your data-for element must be a div element");

        const thisChilds = [...element!.querySelectorAll(`*`)];
            
        const LoopText = thisChilds
            .filter((child) => child.getAttribute("data-text")?.startsWith(this.expressions![0]));

        const parentText = thisChilds
            .filter((child) => !child.getAttribute("data-text")?.startsWith(this.expressions![0]));

        LoopText.forEach(el => {
            el.setAttribute("data-text", 
            `${this.variable.nombre}[]` + el.getAttribute("data-text")?.replace(this.expressions![0], "")!)
            console.log(el.getAttribute("data-text"))
        });

        for (let i in this.variable.value) {
            LoopText
                .forEach(element => {
                    let attrVal: string = (+(i) == 0) 
                        ? element.getAttribute("data-text")?.replace("[]" , `[${i}]`)! 
                        : element.getAttribute("data-text")?.replace(/\[[0-9]+\]/, `[${i}]`)!
                    
                    element.setAttribute("data-text", attrVal)
                    this.parent.childs!["data-text"].push(new TextNode({
                        element: element,
                        parent: this.parent
                    }));
                });

            parentText
                .forEach(element => {
                    this.parent.childs!["data-text"].push(new TextNode({
                        element: element,
                        parent: this.parent
                    }));
                });

            template.appendChild(document.importNode(element, true));
        };
        this.parent.element.insertBefore(template, this.parent.element.children[pos]);
    }
}