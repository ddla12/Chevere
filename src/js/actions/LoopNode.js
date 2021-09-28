import { ChevereAction } from "./ActionNode";
import { Patterns, RegExpFactory } from "@helpers";
export class LoopNode extends ChevereAction {
    constructor(data) {
        super(data);
        this.variables = {
            loop: this.element.dataset.for.match(/^\w+/)[0],
            parent: this.element.dataset.for.match(Patterns.attr.forParent)[0].replace("this.data.", "")
        };
        this.templates = {
            content: this.element.content,
            fragment: document.createDocumentFragment()
        };
        if (this.templates.content.querySelectorAll(":scope > *").length != 1)
            throw new Error("A template with 'data-for' attribute can only have one direct child");
        this.parseAttribute();
    }
    refreshAttribute() {
        if (!(this.parent.data[this.variables.parent] instanceof Array)) {
            throw new TypeError(`Cannot execute a for loop with the '${this.variables.parent}' variable,` +
                `it must be an array`);
        }
        this.parent.data[this.variables.parent].forEach((_, i) => {
            const childs = [...this.templates.content.querySelectorAll("*")], toReplace = {
                before: `this.data.${this.variables.parent}[${i - 1}]`,
                current: `this.data.${this.variables.parent}[${i}]`
            };
            childs.forEach((child) => {
                [...child.attributes]
                    .filter((a) => a.textContent.includes((i == 0) ? this.variables.loop : toReplace.before))
                    .forEach((a) => {
                    a.textContent = a.textContent.replace(((i == 0)
                        ? RegExpFactory.loop(this.variables.loop)
                        : toReplace.before), toReplace.current);
                });
            });
            this.templates.fragment.append(document.importNode(this.templates.content, true));
        });
        this.parent.element.append(this.templates.fragment);
    }
    parseAttribute() {
        try {
            if ((!Patterns.attr.for.test(this.attr.values.original)))
                throw new SyntaxError("data-for attribute must follow the pattern 'var in vars'");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=LoopNode.js.map