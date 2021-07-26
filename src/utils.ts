import { Types } from "./interfaces";

export function setTextElements(el: Element[], val: Types) {
    el.forEach((element) => {
        element.textContent = val.toString();
    });
}