import { ChevereAction } from "./ActionNode";
import { Attribute, ChevereChild, LoopFragment, Data } from "@types";
import { Patterns, RegExpFactory } from "@helpers";

export class LoopNode extends ChevereAction<Attribute> {
    /**
     * Component variable and loop variable
     */
    readonly variables: Data<string>;
    /**
     * Template content and fragment
     */
    readonly templates: LoopFragment;
    /**
     * Position of the template element
     */
    readonly pos: number;

    constructor(data: ChevereChild<Attribute>) {
        super(data);

        this.pos = [...this.parent.element.children].indexOf(this.element);

        this.variables = {
            loop: this.element.dataset.for!.match(/^\w+/)![0],
            parent: this.element.dataset
                .for!.match(Patterns.forParent)![0]
                .replace("this.data.", ""),
        };

        this.templates = {
            content: (this.element as HTMLTemplateElement).content,
            fragment: document.createDocumentFragment(),
        };

        //Template must have one direct child
        if (this.templates.content.querySelectorAll(":scope > *").length != 1)
            throw new Error(
                "A template with 'data-for' attribute can only have one direct child",
            );

        this.parseAttribute();
    }

    refreshAttribute(): void {
        //'data-for' only with arrays, other build-in methods like Object.keys aren't supported
        if (!(this.parent.data![this.variables.parent] instanceof Array)) {
            throw new TypeError(
                `Cannot execute a for loop with the '${this.variables.parent}' variable,` +
                    `it must be an array`,
            );
        }

        (this.parent.data![this.variables.parent] as any[]).forEach((_, i) => {
            //Childs of the template
            const childs = [
                ...this.templates.content.querySelectorAll("*"),
            ] as HTMLElement[];

            //In the first iteration, all loop variable references in childs were replaced
            const toReplace = {
                before: `this.data.${this.variables.parent}[${i - 1}]`,
                current: `this.data.${this.variables.parent}[${i}]`,
            };

            childs.forEach((child) => {
                [...child.attributes]
                    //Get only childs with the loop variable
                    .filter((a) =>
                        a.textContent!.includes(
                            i == 0 ? this.variables.loop : toReplace.before,
                        ),
                    )
                    .forEach((a) => {
                        a.textContent! = a.textContent!.replace(
                            i == 0
                                ? RegExpFactory.loop(this.variables.loop)
                                : toReplace.before,
                            toReplace.current,
                        );
                    });
            });

            this.templates.fragment.append(
                document.importNode(this.templates.content, true),
            );
        });

        this.parent.element.insertBefore(
            this.templates.fragment,
            this.parent.element.children[this.pos],
        );
    }

    parseAttribute(): void {
        try {
            if (!Patterns.for.test(this.attr!.values.original))
                throw new SyntaxError(
                    "data-for attribute must follow the pattern 'var in vars'",
                );

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    }
}
