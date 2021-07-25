import { sanitizer } from "./tokenizer";

window.addEventListener("load", () => {
    const elements: NodeListOf<Element> = document.querySelectorAll("[data-attached]");

    elements.forEach(el => {
        const data: string = el.getAttribute("data-attached")!;
        console.log(sanitizer(data));
    });

});