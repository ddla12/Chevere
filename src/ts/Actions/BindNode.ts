import { ChevereAction } from "./ActionNode";
import { Attribute, BindableAttr, ChevereChild } from "@interfaces";
import { Helper, Patterns } from "@helpers";

export class BindNode extends ChevereAction<Attribute[]> {
    attr: BindableAttr[];

    constructor(data: ChevereChild<Attribute[]>) {
        super(data);

        data.attr!.some((attr) => this.ifAttrIsEmpty(attr));
    
        this.attr = data.attr!.map((attr) => ({
            attribute: attr.attribute,
            values: {
                original: attr.values.original,
            },
            bindAttr: attr.attribute.replace(Patterns.attr.bindAndOn, ""),
            bindValue: this.element.dataset[attr.attribute.replace(Patterns.attr.bindAndOn, "")] || "",
            type: (Patterns.attr.isString.test(attr.values.original)) ? "string"
                : (Patterns.attr.isObject.test(attr.values.original)) ? "object"
                : "variable"
        }));

        this.parseAttribute();
    }
 
    setAction(): void {
        this.attr.forEach((attr) => attr.predicate!());
    }

    refreshAttribute(): void {
        this.attr.filter((attr) => ["style", "class"].includes(attr.bindAttr))
            .forEach((attr) => {
                let i = this.attr.indexOf(attr);
                
                this.attr[i].values.current = () => Helper.parser<string|object>({
                    expr: this.attr[i].values.original,
                    node: this.parent
                }); 
            });

        const [Style, Class] = [
            this.attr.findIndex((attr) => attr.bindAttr == "style"),
            this.attr.findIndex((attr) => attr.bindAttr == "class"),
        ];

        (this.attr[Style]) && (this.attr[Style].predicate = () => 
            (["string", "variable"].includes(this.attr[Style].type))
                ? (this.element.style.cssText = this.attr[Style].values.current!() + this.attr[Style].bindValue!)
                : Object.assign(this.element.style, this.attr[Style].values.current!()));

        (this.attr[Class]) && (this.attr[Class].predicate = () => 
            this.element.className = (["string", "variable"].includes(this.attr[Class].type))
                ? (this.attr[Class].values.current!() as string) + " "
                : (Object.entries(this.attr[Class].values.current!() as object)
                    .filter(([, value]) => value)
                    .map(([key]) => key)
                    .join(" ") + " ") 
                + this.attr[Class].bindValue);

        this.attr.filter((attr) => !["style", "class"].includes(attr.bindAttr))
            .forEach((attr) => {
                if(Patterns.attr.isObject.test(attr.values.original))
                    throw new SyntaxError(`Only 'style' and 'class' attribute accepts an object as value /
                    any other atttribute can only receive either a variable or a template string`);

                let i = this.attr.indexOf(attr);

                this.attr[i].values.current = () => Helper.parser<any>({
                    expr: this.attr[i].values.original,
                    node: this.parent
                }); 

                attr.predicate = () => this.element.setAttribute(attr.bindAttr, attr.values.current!());
            });

        this.setAction();
    }

    parseAttribute(): void {
        try {
            if(this.attr!.some((attr) => 
            (!Patterns.attr.isString.test(attr.values.original) &&
             !Patterns.attr.isObject.test(attr.values.original))))
                throw new SyntaxError("A 'data-bind' attribute only accepts an object or a template string as value");

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    }
}