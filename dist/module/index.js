import { ChevereInline, ChevereNode } from "./chevere/index.js";
const Chevere = {
    start(...data) {
        const elements = [...document.querySelectorAll("*[data-attached]")].map((element) => ({ el: element, attr: element.dataset.attached }));
        elements.forEach((el) => {
            const Data = (() => {
                let search = data.find((d) => d.name == el.attr.trim());
                if (!search)
                    throw new ReferenceError(`'${search}' couldn't be found in any of your declared components`);
                return search;
            })();
            new ChevereNode(Data, el.el);
        });
        [...document.querySelectorAll("*[data-inline]")].map((e) => new ChevereInline(e));
    },
    makeNodes(data, ...element) {
        element.forEach((e) => new ChevereNode(data, e));
    }
};
Object.defineProperty(window, "Chevere", { value: Chevere });
export default Chevere;
