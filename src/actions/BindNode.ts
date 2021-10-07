import { ChevereAction } from "./ActionNode";
import { Attribute, BindableAttr, BindForEach, ChevereChild } from "@types";
import { Helper, Patterns } from "@helpers";

/**
 * Boolean html attributes
 */
enum BooleanAttributes {
    "async",
    "autocomplete",
    "autofocus",
    "autoplay",
    "border",
    "challenge",
    "checked",
    "compact",
    "contenteditable",
    "controls",
    "default",
    "defer",
    "disabled",
    "formNoValidate",
    "frameborder",
    "hidden",
    "indeterminate",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nohref",
    "noresize",
    "noshade",
    "novalidate",
    "nowrap",
    "open",
    "readonly",
    "required",
    "reversed",
    "scoped",
    "scrolling",
    "seamless",
    "selected",
    "sortable",
    "spellcheck",
    "translate",
}

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
                this.$element.getAttribute(
                    attr.attribute.replace(Patterns.bindAndOn, "")
                ) || "",
            type: Patterns.isString.test(attr.values.original)
                ? "string"
                : Patterns.isObject.test(attr.values.original)
                ? "object"
                : "variable",
        }));

        this.readAttribute(() => {
            if (this.attr!.some(
                    (attr) =>
                        !Patterns.isString.test(attr.values.original) &&
                        !Patterns.isObject.test(attr.values.original) &&
                        !Patterns.isLogicalExpression.test(attr.values.original) &&
                        !Patterns.isBoolean.test(attr.values.original),
            ))
                throw new SyntaxError(
                    "A 'data-bind' attribute only accepts an object or a template string as value",
                );
        });
    }

    refresh(): void {
        this.attr.forEach((attr) => attr.predicate!());
    }

    //A quick way to implement 'setAttributes' and 'setBooleanAttributes'
    attributeForEach(data: BindForEach): void {
        this.attr
            .filter(data.filter)
            .forEach((attr) => {
                let i = this.attr.indexOf(attr);

                //Get the value
                this.attr[i].values.current = () =>
                    Helper.parser<any>({
                        expr: this.attr[i].values.original,
                        node: this.parent,
                        args: this.forVars
                    });
                
                data.callback(attr);
            });
    }
    
    /**
     * Boolean attributes just need to toggle themselves
     */
    setBooleanAttributes(): void {
        this.attributeForEach({
            filter: (attr) => Object.values(BooleanAttributes).includes(attr.bindAttr),
            callback: (attr) => {
                //@ts-ignore
                attr.predicate = () => this.$element[attr.bindAttr] = attr.values.current!();
            }
        });
    }

    /**
     * Set normal attributes, those that aren't neither 'class' nor 'style' nor type boolean 
     */
    setAttributes(): void {
        this.attributeForEach({
            filter: (attr) => (!["style", "class"].includes(attr.bindAttr)) &&
                !(Object.values(BooleanAttributes).includes(attr.bindAttr)),
            callback: (attr) => {
                attr.predicate = () =>
                    this.$element.setAttribute(
                        attr.bindAttr,
                        attr.values.current!(),
                    );
            }
        });
    }

    setAction(): void {
        if(this.attr
            .filter((attr) => !["style", "class"].includes(attr.bindAttr))
            .some((attr) => Patterns.isObject.test(attr.values.original))
        )
            throw new SyntaxError(
                `Only 'style' and 'class' attribute accepts an object as value any other /
                atttribute can only receive either a variable or a template string`
            );
            

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
                        args: this.forVars
                    });
            });

        const [Style, Class] = [
            this.attr.findIndex((attr) => attr.bindAttr == "style"),
            this.attr.findIndex((attr) => attr.bindAttr == "class"),
        ];

        if (this.attr[Style])
            this.attr[Style].predicate = () =>
                ["string", "variable"].includes(this.attr[Style].type)
                    ? //If 'style' bind value is a string or variable, pass it directly to the cssText of the element
                      (this.$element.style.cssText =
                          this.attr[Style].values.current!() +
                          this.attr[Style].bindValue!)
                    : //Otherwise, assign the object to the element style
                      Object.assign(
                          this.$element.style,
                          this.attr[Style].values.current!(),
                      );

        if (this.attr[Class])
            this.attr[Class].predicate = () =>
                (this.$element.className = ["string", "variable"].includes(
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
                      this.attr[Class].bindValue);
        //#endregion

        //Procedure with others attributes that are not 'style' and 'class' is simple...
        this.setAttributes();
        this.setBooleanAttributes();

        this.refresh();
    }
}