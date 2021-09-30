import { ChevereAction } from "./ActionNode";
import { Helper, Patterns } from "@helpers";
export class BindNode extends ChevereAction {
    constructor(data) {
        super(data);
        data.attr.some((attr) => this.ifAttrIsEmpty(attr));
        this.attr = data.attr.map((attr) => ({
            attribute: attr.attribute,
            values: {
                original: attr.values.original,
            },
            bindAttr: attr.attribute.replace(Patterns.bindAndOn, ""),
            bindValue: this.element.dataset[attr.attribute.replace(Patterns.bindAndOn, "")] || "",
            type: Patterns.isString.test(attr.values.original)
                ? "string"
                : Patterns.isObject.test(attr.values.original)
                    ? "object"
                    : "variable",
        }));
        this.parseAttribute();
    }
    setAction() {
        this.attr.forEach((attr) => attr.predicate());
    }
    refreshAttribute() {
        this.attr
            .filter((attr) => ["style", "class"].includes(attr.bindAttr))
            .forEach((attr) => {
            let i = this.attr.indexOf(attr);
            this.attr[i].values.current = () => Helper.parser({
                expr: this.attr[i].values.original,
                node: this.parent,
            });
        });
        const [Style, Class] = [
            this.attr.findIndex((attr) => attr.bindAttr == "style"),
            this.attr.findIndex((attr) => attr.bindAttr == "class"),
        ];
        if (this.attr[Style])
            (this.attr[Style].predicate = () => ["string", "variable"].includes(this.attr[Style].type)
                ?
                    (this.element.style.cssText =
                        this.attr[Style].values.current() +
                            this.attr[Style].bindValue)
                :
                    Object.assign(this.element.style, this.attr[Style].values.current()));
        if (this.attr[Class])
            (this.attr[Class].predicate = () => (this.element.className = ["string", "variable"].includes(this.attr[Class].type)
                ?
                    this.attr[Class].values.current() + " "
                :
                    Object.entries(this.attr[Class].values.current())
                        .filter(([, value]) => value)
                        .map(([key]) => key)
                        .join(" ") +
                        " " +
                        this.attr[Class].bindValue));
        this.attr
            .filter((attr) => !["style", "class"].includes(attr.bindAttr))
            .forEach((attr) => {
            if (Patterns.isObject.test(attr.values.original))
                throw new SyntaxError(`Only 'style' and 'class' attribute accepts an object as value /
                    any other atttribute can only receive either a variable or a template string`);
            let i = this.attr.indexOf(attr);
            this.attr[i].values.current = () => Helper.parser({
                expr: this.attr[i].values.original,
                node: this.parent,
            });
            attr.predicate = () => this.element.setAttribute(attr.bindAttr, attr.values.current());
        });
        this.setAction();
    }
    parseAttribute() {
        try {
            if (this.attr.some((attr) => !Patterns.isString.test(attr.values.original) &&
                !Patterns.isObject.test(attr.values.original)))
                throw new SyntaxError("A 'data-bind' attribute only accepts an object or a template string as value");
            this.refreshAttribute();
        }
        catch (error) {
            console.error(error);
        }
    }
}
