import { ChevereInline, ChevereAttached } from "./chevere/index.js";
const Chevere = {
    search(...data) {
        const elements = [...document.querySelectorAll("*[data-attached]")].map((element) => ({ el: element, attr: element.dataset.attached }));
        elements.forEach((el) => {
            const Data = (() => {
                let search = data.find((d) => d.name == el.attr.trim());
                if (!search)
                    throw new ReferenceError(`'${search}' couldn't be found in any of your declared components`);
                return search;
            })();
            new ChevereAttached(Data, el.el);
        });
        this.searchInlines();
    },
    make(data, ...element) {
        element.forEach((e) => new ChevereAttached(data, e));
    },
    searchInlines() {
        [...document.querySelectorAll("*[data-inline]")].forEach((e) => new ChevereInline(e));
    }
};
Object.defineProperty(window, "Chevere", { value: Chevere });
export default Chevere;
