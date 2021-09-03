import {ChevereNode} from "@chevere";
import { LoopElement, ParsedData, ParsedFor } from "@interfaces";
import { TextNode } from "./TextNode";
import { Parser } from "@helpers";

export class LoopNode implements LoopElement {
    element: HTMLTemplateElement;
    parent: ChevereNode;
    variable: ParsedData;
    expressions?: string[];

    constructor(data: LoopElement) {
        ({ element: this.element, parent: this.parent } = data);

        const parsed: ParsedFor = Parser.parseDataForAttr({
            attr: this.element.getAttribute("data-for")!, 
            node: this.parent
        });

        ({ expressions: this.expressions, variable: this.variable } = parsed);

        if(typeof this.variable.value == "string") 
            throw new EvalError(`Cannot set a 'for..in' loop in type ${typeof this.variable.value}`);        

        this.loopElements();
    };

    loopElements(): void {
        let pos: number = Array.from(this.parent.element.children).indexOf(this.element);

        const template: DocumentFragment = document.createDocumentFragment(),
            element = this.element.content.querySelector("div:first-child");

        if(!element) throw new Error("The first child of your data-for element must be a div element");

        const thisChilds = [...element!.querySelectorAll("*[data-text]")];
            
        const LoopText = thisChilds
            .filter((child) => child.getAttribute("data-text")?.startsWith(this.expressions![0]));

        LoopText.forEach(el => {
            el.setAttribute("data-text", 
            `${this.variable.nombre}[]` + el.getAttribute("data-text")?.replace(this.expressions![0], "")!)
        });

        for (let i in this.variable.value) {
            LoopText
                .forEach(element => {
                    let attrVal: string = (+(i) == 0) 
                        ? element.getAttribute("data-text")?.replace("[]" , `[${i}]`)! 
                        : element.getAttribute("data-text")?.replace(/\[[0-9]+\]/, `[${i}]`)!
                    
                    element.setAttribute("data-text", attrVal);

                    this.parent.childs!["data-text"].push(new TextNode({
                        element: element,
                        parent: this.parent
                    }));
                });

            template.appendChild(document.importNode(element, true));
        };
        
        this.parent.element.prepend(template);

        this.parent.canSet = true;
    }
}