import { ChevereAction } from "./ActionNode";
import { Attribute, BindableAttr, ChevereChild } from "@types";
import { Helper, Patterns } from "@helpers";

/**
 * Child nodes with 'data-bind' attribute
 * @extends ChevereAction<Attribute>
 */
export class BindNode extends ChevereAction<Attribute[]> {
    attr: BindableAttr[];

    constructor(data: ChevereChild<Attribute[]>) {
        super(data);

        data.attr!.some((attr) => this.ifAttrIsEmpty(attr));

        //Get all 'data-bind' attributes placed in the element
        this.attr = data.attr!.map((attr) => ({
            attribute: attr.attribute,
            values: {
                original: attr.values.original,
            },
            bindAttr: attr.attribute.replace(Patterns.bindAndOn, ""),
            bindValue:
                this.element.dataset[
                    attr.attribute.replace(Patterns.bindAndOn, "")
                ] || "",
            type: Patterns.isString.test(attr.values.original)
                ? "string"
                : Patterns.isObject.test(attr.values.original)
                ? "object"
                : "variable",
        }));

        this.parseAttribute();
    }

    setAction(): void {
        this.attr.forEach((attr) => attr.predicate!());
    }

    refreshAttribute(): void {
        //#region Style and Class attributes have a special treatment
        //First, get a valid js expression in the attribute
        this.attr
            .filter((attr) => ["style", "class"].includes(attr.bindAttr))
            .forEach((attr) => {
                let i = this.attr.indexOf(attr);

                this.attr[i].values.current = () =>
                    Helper.parser<string | object>({
                        expr: this.attr[i].values.original,
                        node: this.parent,
                    });
            });

        const [Style, Class] = [
            this.attr.findIndex((attr) => attr.bindAttr == "style"),
            this.attr.findIndex((attr) => attr.bindAttr == "class"),
        ];

        if(this.attr[Style])
            (this.attr[Style].predicate = () =>
                ["string", "variable"].includes(this.attr[Style].type)
                    ? //If 'style' bind value is a string or variable, pass it directly to the cssText of the element
                      (this.element.style.cssText =
                          this.attr[Style].values.current!() +
                          this.attr[Style].bindValue!)
                    : //Otherwise, assign the object to the element style
                      Object.assign(
                          this.element.style,
                          this.attr[Style].values.current!(),
                      ));

        if(this.attr[Class])
            (this.attr[Class].predicate = () =>
                (this.element.className = ["string", "variable"].includes(
                    this.attr[Class].type,
                )
                    ? //Same treatment as the style bind value if it is string or variable
                      (this.attr[Class].values.current!() as string) + " "
                    : //Else, filter the object and get properties wich are true, and then pass them to class
                      Object.entries(
                          this.attr[Class].values.current!() as object,
                      )
                          .filter(([, value]) => value)
                          .map(([key]) => key)
                          .join(" ") +
                      " " +
                      this.attr[Class].bindValue));
        //#endregion

        //Procedure with others attributes that are not 'style' and 'class' is simple...
        this.attr
            .filter((attr) => !["style", "class"].includes(attr.bindAttr))
            .forEach((attr) => {
                if (Patterns.isObject.test(attr.values.original))
                    throw new SyntaxError(`Only 'style' and 'class' attribute accepts an object as value /
                    any other atttribute can only receive either a variable or a template string`);

                let i = this.attr.indexOf(attr);

                //...just get a valid js expression
                this.attr[i].values.current = () =>
                    Helper.parser<any>({
                        expr: this.attr[i].values.original,
                        node: this.parent,
                    });

                //And pass it to the attribute
                attr.predicate = () =>
                    this.element.setAttribute(
                        attr.bindAttr,
                        attr.values.current!(),
                    );
            });

        this.setAction();
    }

    parseAttribute(): void {
        try {
            if (
                this.attr!.some(
                    (attr) =>
                        !Patterns.isString.test(attr.values.original) &&
                        !Patterns.isObject.test(attr.values.original),
                )
            )
                throw new SyntaxError(
                    "A 'data-bind' attribute only accepts an object or a template string as value",
                );

            this.refreshAttribute();
        } catch (error) {
            console.error(error);
        }
    }
}
