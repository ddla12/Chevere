import { ClickEvent } from "../interfaces";
import { setTextElements } from "../utils";

export function setClick(click: ClickEvent): void {
    click.el.addEventListener("click", () => {
        switch(click.data.type) {
            case "number": {
                click.data.value = incOrDec(click.action!, click.data.value as number)
            } break;

            case "boolean" : {
                click.data.value = toggleOrAssig(click.action!, click.data.value as boolean);
            } break;
        }

        let textNodes = click.nodes.map((node) => node.element);
        setTextElements(textNodes, click.data.value);
    });
}

function incOrDec(action: string, value: number): number {
    switch(action) {
        case "increment": {
            value++;
        } break;

        case "decrement": {
            value--;
        } break;
    };

    return value;
}

function toggleOrAssig(action: string, value: boolean): boolean {
    switch(action) {
        case "toggle": {
            value = !value;
        } break;

        case "assignToTrue": {
            value = true;
        } break;

        case "assignToFalse": {
            value = false;
        } break;
    };

    return value;
};