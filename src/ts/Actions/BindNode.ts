import { ChevereNode } from "@chevere";
import { Parser } from "@helpers";
import { BindAttr, BindChild, ExpAttribute } from "@interfaces";
import { Patterns } from "@helpers";

/**
 *  Class for the elements that have either the "data-bind" or "@bind" attribute
 */
export class BindNode implements BindChild {
    /**
     * The "data-bind"/"@bind" attribute data
     * @property {ExpAttr}
     */
    attribute   : ExpAttribute; 

    /**
     * Bindable attribute data
     * @property {BindAttr}
     */
    bindAttr    : BindAttr;

    element     : HTMLElement|HTMLInputElement;
    parent      : ChevereNode;
    variables   : string[];

    constructor(data: BindChild) {
        ({ 
            element     : this.element, 
            attribute   : this.attribute, 
            parent      : this.parent,
            attribute   : this.attribute,
        } = data);

        /**
         *  Remove the '@bind' or the 'data-bind:' from the attribute 
         * and get the 'bindable' attribute so to speak
         */
        const bindable: string = (this.attribute.attribute.match(Patterns.bind.bindable) ?? [""])[0];

        if(!bindable)
            throw new EvalError("A 'data-bind/@bind' must be followed by a valid html attribute");

        //Set the 'bindAttr' property
        this.bindAttr = {
            name: bindable,
            exists: this.element.hasAttribute(bindable),
            value: this.element.getAttribute(bindable)!,
        };

        /**
         * Find all the '$this.data' placed in the attribute, 
         * and return the real variable name
         */
        this.variables = [...new Set([
            ...[...this.attribute.values.original.matchAll(Patterns.bind.$this)]
                .map((m) => m[0])
                .map((variable) => variable.replace("$this.data.", ""))
        ])];

        this.setData();
    };

    hasError(type: string, regexp: RegExp) {
        if((this.attribute.modifier == type) && (!regexp.test(this.attribute.values.original))) {
            throw new EvalError(`The value of the 'data-bind/@bind' attribute must be a ${type}`);
        };
    }

    parse(value: string): string {
        this.hasError(this.attribute.modifier, Patterns.bind[this.attribute.modifier]);

        this.variables.forEach((variable) => {
            let v = this.parent.data[variable].value;

            this.attribute.values.current = value.replaceAll(
                `$this.data.${variable}`, 
                ((typeof v == "string") ? `'${v}'` : v)
            );
        });

        return Parser.parser(this.attribute.values.current);
    }

    /**
     * Bind the attribute
     */
    setData(): void {
        switch(this.bindAttr.name) {
            case "style":
                (this.attribute.modifier == "object") 
                    ? Object.assign(this.element.style, this.parse(this.attribute.values.original))
                    : (this.element.style.cssText = 
                        this.parse(this.attribute.values.original) + (this.bindAttr.value ?? ""));
            break;

            case "class": {
                this.element.className = `${this.parse(this.attribute.values.original)} ${(this.bindAttr.value ?? "")}`;
            } break;
        }
    };
}