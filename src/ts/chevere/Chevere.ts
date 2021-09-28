import { Dispatch } from "@interfaces";

export abstract class Chevere {
    id      : string;
    element : HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        this.id = this.setId();
        this.element.dataset.id = this.id;
    }

    setId(): string {
        return Math.random().toString(32).substr(2);
    }
    
    $emit(data: Dispatch): void {
        window.dispatchEvent(
            new CustomEvent(data.name, {
                detail      : data.detail,
                bubbles     : true,
                composed    : true,
                cancelable  : true,
            })
        );
    }
}