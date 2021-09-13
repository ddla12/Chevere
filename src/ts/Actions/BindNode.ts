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

    element     : HTMLElement;
    parent      : ChevereNode;
    variables   : string[];

    constructor(data: BindChild) {
        ({ 
            element     : this.element, 
            attribute   : this.attribute, 
            parent      : this.parent,
            attribute   : this.attribute,
        } = data);

        if(!(["string", "object", "$this"].includes(this.attribute.modifier))) {
            throw new TypeError(
                `The 'data-bind/@bind' attribute can be: 'string' (default) and 'object' if it binds 'style' or 'class'`);
        };

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
            ...[this.attribute.values.original.match(Patterns.bind.$this)!]
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

        if(this.attribute.modifier == "$this") {
            this.attribute.values.current = value.replace(
                `$this.data.${value.match(Patterns.bind.variable)![0]}`,
                this.parent.data[value.match(Patterns.bind.variable)![0]].value);

            console.log(this.attribute.values.current);
            return Parser.parser(this.attribute.values.current);
        };

        if(this.bindAttr.name == "class") {
            const objectClass = value.replace(/\{|\}/g, "").split(",")
                .map((exp) => exp.split(":").map(e => e.trim()))
                .map((data) => {
                    return [
                        Parser.parser(data[0]),
                        Parser.parser((
                            (data[1].match(Patterns.bind.$this))
                                ? data[1].replaceAll(
                                    Patterns.bind.$this, 
                                    Parser.parentEscape(
                                        this.parent.data[data[1].match(Patterns.bind.variable)![0]]
                                        ))
                                : data[1]
                        ))
                ]});

            return objectClass.filter((e) => Boolean(e[1])).map((c) => c.shift()).join(" ");
        };

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
        if(this.attribute.modifier == "$this") {
            this.element.setAttribute(this.bindAttr.name, this.parse(this.attribute.values.original));
            return;
        }

        if(this.attribute.modifier == "object") {
            (this.bindAttr.name == "style") 
                && Object.assign(this.element.style, this.parse(this.attribute.values.original));

            (this.bindAttr.name == "class")
                && (this.element.className = `${this.parse(this.attribute.values.original)} ${(this.bindAttr.value ?? "")}`)
            
            return;
        }
        (this.bindAttr.name == "class")
            && (this.element.className = `${this.parse(this.attribute.values.original)} ${(this.bindAttr.value ?? "")}`);

        (this.bindAttr.name == "style") 
            && (this.element.style.cssText = this.parse(this.attribute.values.original) + (this.bindAttr.value ?? ""));
    };
}