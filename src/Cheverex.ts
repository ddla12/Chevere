import { Action } from "./interfaces";
import * as Parsers from "./Parser";
import { CheverexElement, CheverexObject } from "./interfaces";

export class CheverexNode implements CheverexElement {
    data: CheverexObject[];
    id: string;
    actions?: Action[];
    element: Element;

    constructor(data: string, el: Element) {
        this.id = this.setId(10);

        this.element = el;
        this.element.id = this.id;

        this.data = Parsers.parserData(data);
        this.actions = this.checkActions(this.element);
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

    checkActions(el: Element): Action[] {
        const selectors: NodeListOf<Element>[] = [
            el.querySelectorAll(`#${this.id} > *[data-click]`),
        ];

        let clickedData: Action[] = [];

        selectors[0].forEach((click) => {
            clickedData.push(
                Parsers.parseClick(click, this.data, this.id)
            );
        });

        return clickedData;
    }
}

class CheverexData {
    elements: CheverexElement[] = [];
}

const Cheverex: { start(): void } = {
    start(): void {
        const elements: NodeListOf<Element> = document.querySelectorAll("div[data-attached]");

        const cheverex = new CheverexData();

        elements.forEach(el => {
            const data: string = el.getAttribute("data-attached")!;
            cheverex.elements.push(new CheverexNode(data, el));
        });
    
        console.log(cheverex.elements);
    }
};

export default Cheverex;