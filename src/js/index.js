import { ChevereData, ChevereInline, ChevereNode } from "@chevere";
import { Patterns } from "@helpers";
/**
 *  The main Chevere object, it allows to create and start components
 */
export const Chevere = {
    /**
     * Find a ChevereData name by the value of the 'data-attached' attribute
     * @param attr
     * @param data
     * @returns The data ready for instance a NodeListOf<Element>
     */
    findItsData(attr, ...data) {
        let search = data.find((d) => d.name == attr.trim().replace(/\(.*/, ""));
        if (!search)
            throw new ReferenceError(`'${attr}' couldn't be found in any of your declared components`);
        return search;
    },
    /**
     * Search for ChevereNodes at the DOM and execute their init functions
     * @param data All the ChevereData previously declared
     */
    start(...data) {
        const elements = [...document.querySelectorAll("*[data-attached]")].map((element) => ({ el: element, attr: element.dataset.attached }));
        //Create a ChevereNode for each data-attached
        elements.forEach(async (el) => {
            const node = this.findItsData(el.attr, ...data);
            //Check for syntax error in the 'data-attached' attribute
            if (!Patterns.methodSyntax.test(el.attr))
                throw new SyntaxError(`There are syntax error in the 'data-attached' attribute, unrecognized expression "${el.attr}"`);
            //If there's not a init function and 'data-attached' attribute has parameters
            if (node.init == undefined && Patterns.arguments.test(el.attr))
                throw new EvalError(`The ${node.name} components don't have an init() function, therefore they do not accept any parameters`);
            //Execute the init function
            if (node.init != undefined) {
                await (async () => {
                    return Patterns.arguments.test(el.attr)
                        ? node.initFunc(el.attr.match(Patterns.arguments).join(","))
                        : node.initFunc();
                })();
            }
            //Finally, instance a new ChevereNode
            new ChevereNode(node, el.el);
        });
        //Inline components don't have an attached ChevereData, so, they can set their own data
        [...document.querySelectorAll("*[data-inline]")].map((e) => new ChevereInline(e));
    },
    /**
     * Create an instance of ChevereData
     * @param data
     * @returns A new global ChevereData
     */
    data(data) {
        return new ChevereData(data);
    },
};
//Set the property 'Chevere' to window
Object.defineProperty(window, "Chevere", { value: Chevere });
//# sourceMappingURL=index.js.map