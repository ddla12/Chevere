import { ChevereAction } from "./ActionNode";
import { Attribute, ChevereChild, LoopFragment, Data } from "@types";
import { Helper, Patterns } from "@helpers";

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
    /**
     * A proper id to make changes easy
     */
    readonly id: string;
    /**
     * Key to assign to childs
     */
    readonly key: string;

    constructor(data: ChevereChild<Attribute>) {
        super(data);

        this.id = Helper.setId();

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

        this.key = `${Object.values(this.variables).join("-")}-${this.id}`;

        //Template must have one direct child
        if (this.templates.content.querySelectorAll(":scope > *").length != 1)
            throw new Error(
                "A template with 'data-for' attribute can only have one direct child",
            );

        this.readAttribute(() => {
            if (!Patterns.for.test(this.attr!.values.original))
                throw new SyntaxError(
                    "data-for attribute must follow the pattern 'var in vars'",
                );
        });
    }

    refresh(): void { 
        Object.entries(this.parent.childs!).forEach(([attr, list]) => {
            this.parent.childs![attr] = list.filter((child) => !child.element.dataset.key)
        });

        [...this.parent.element.querySelectorAll(`*[data-key=${this.key}]`)].forEach((n) => n.remove());

        this.refresh();

        this.parent.reScan();
    }

    setAction(): void {
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

            //Pass the arguments to all the Helper.parser calls placed at others ActionNodes
            [childs[0].dataset.key, childs[0].id] = [ this.key, Helper.setId() ];

            //In the first iteration, all loop variable references in childs were replaced
            const toReplace =`this.data.${this.variables.parent}[${i}]`;

            childs
                .filter((child) => Object.keys(child.dataset).length || [...[...child.attributes].map((a) => a.name)].includes("@"))
                .forEach((child) => child.dataset.forRef = `{ ${this.variables.loop}: ${toReplace} }`);

            this.templates.fragment.append(
                document.importNode(this.templates.content, true),
            );
        });

        this.parent.element.insertBefore(
            this.templates.fragment,
            this.parent.element.children[this.pos],
        );
    }
}