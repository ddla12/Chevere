import { Types } from "./interfaces";

/**
 * Set the text of a group of elements
 * @param {Element[]} el The elements that will be affected
 * @param {Types} val The string that will be assigned to those elements
 */
export function setTextElements(el: Element[], val: Types): void {
    el.forEach((element) => {
        element.textContent = val.toString();
    });
}