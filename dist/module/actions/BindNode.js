import { ChevereAction } from "./ActionNode";
import { Helper, Patterns } from "../utils/index.js";
var BooleanAttributes;
(function (BooleanAttributes) {
    BooleanAttributes[BooleanAttributes["async"] = 0] = "async";
    BooleanAttributes[BooleanAttributes["autocomplete"] = 1] = "autocomplete";
    BooleanAttributes[BooleanAttributes["autofocus"] = 2] = "autofocus";
    BooleanAttributes[BooleanAttributes["autoplay"] = 3] = "autoplay";
    BooleanAttributes[BooleanAttributes["border"] = 4] = "border";
    BooleanAttributes[BooleanAttributes["challenge"] = 5] = "challenge";
    BooleanAttributes[BooleanAttributes["checked"] = 6] = "checked";
    BooleanAttributes[BooleanAttributes["compact"] = 7] = "compact";
    BooleanAttributes[BooleanAttributes["contenteditable"] = 8] = "contenteditable";
    BooleanAttributes[BooleanAttributes["controls"] = 9] = "controls";
    BooleanAttributes[BooleanAttributes["default"] = 10] = "default";
    BooleanAttributes[BooleanAttributes["defer"] = 11] = "defer";
    BooleanAttributes[BooleanAttributes["disabled"] = 12] = "disabled";
    BooleanAttributes[BooleanAttributes["formNoValidate"] = 13] = "formNoValidate";
    BooleanAttributes[BooleanAttributes["frameborder"] = 14] = "frameborder";
    BooleanAttributes[BooleanAttributes["hidden"] = 15] = "hidden";
    BooleanAttributes[BooleanAttributes["indeterminate"] = 16] = "indeterminate";
    BooleanAttributes[BooleanAttributes["ismap"] = 17] = "ismap";
    BooleanAttributes[BooleanAttributes["loop"] = 18] = "loop";
    BooleanAttributes[BooleanAttributes["multiple"] = 19] = "multiple";
    BooleanAttributes[BooleanAttributes["muted"] = 20] = "muted";
    BooleanAttributes[BooleanAttributes["nohref"] = 21] = "nohref";
    BooleanAttributes[BooleanAttributes["noresize"] = 22] = "noresize";
    BooleanAttributes[BooleanAttributes["noshade"] = 23] = "noshade";
    BooleanAttributes[BooleanAttributes["novalidate"] = 24] = "novalidate";
    BooleanAttributes[BooleanAttributes["nowrap"] = 25] = "nowrap";
    BooleanAttributes[BooleanAttributes["open"] = 26] = "open";
    BooleanAttributes[BooleanAttributes["readonly"] = 27] = "readonly";
    BooleanAttributes[BooleanAttributes["required"] = 28] = "required";
    BooleanAttributes[BooleanAttributes["reversed"] = 29] = "reversed";
    BooleanAttributes[BooleanAttributes["scoped"] = 30] = "scoped";
    BooleanAttributes[BooleanAttributes["scrolling"] = 31] = "scrolling";
    BooleanAttributes[BooleanAttributes["seamless"] = 32] = "seamless";
    BooleanAttributes[BooleanAttributes["selected"] = 33] = "selected";
    BooleanAttributes[BooleanAttributes["sortable"] = 34] = "sortable";
    BooleanAttributes[BooleanAttributes["spellcheck"] = 35] = "spellcheck";
    BooleanAttributes[BooleanAttributes["translate"] = 36] = "translate";
})(BooleanAttributes || (BooleanAttributes = {}));
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
            bindValue: this.$element.getAttribute(attr.attribute.replace(Patterns.bindAndOn, "")) || "",
            type: Patterns.isString.test(attr.values.original)
                ? "string"
                : Patterns.isObject.test(attr.values.original)
                    ? "object"
                    : "variable",
        }));
        this.readAttribute(() => {
            if (this.attr.some((attr) => !Patterns.isString.test(attr.values.original) &&
                !Patterns.isObject.test(attr.values.original) &&
                !Patterns.isLogicalExpression.test(attr.values.original) &&
                !Patterns.isBoolean.test(attr.values.original)))
                throw new SyntaxError("A 'data-bind' attribute only accepts an object or a template string as value");
        });
    }
    refresh() {
        this.attr.forEach((attr) => attr.predicate());
    }
    attributeForEach(data) {
        this.attr
            .filter(data.filter)
            .forEach((attr) => {
            let i = this.attr.indexOf(attr);
            this.attr[i].values.current = () => Helper.parser({
                expr: this.attr[i].values.original,
                node: this.parent,
                args: this.forVars
            });
            data.callback(attr);
        });
    }
    setBooleanAttributes() {
        this.attributeForEach({
            filter: (attr) => Object.values(BooleanAttributes).includes(attr.bindAttr),
            callback: (attr) => {
                attr.predicate = () => this.$element[attr.bindAttr] = attr.values.current();
            }
        });
    }
    setAttributes() {
        this.attributeForEach({
            filter: (attr) => (!["style", "class"].includes(attr.bindAttr)) &&
                !(Object.values(BooleanAttributes).includes(attr.bindAttr)),
            callback: (attr) => {
                attr.predicate = () => this.$element.setAttribute(attr.bindAttr, attr.values.current());
            }
        });
    }
    setAction() {
        if (this.attr
            .filter((attr) => !["style", "class"].includes(attr.bindAttr))
            .some((attr) => Patterns.isObject.test(attr.values.original)))
            throw new SyntaxError(`Only 'style' and 'class' attribute accepts an object as value any other /
                atttribute can only receive either a variable or a template string`);
        this.attr
            .filter((attr) => ["style", "class"].includes(attr.bindAttr))
            .forEach((attr) => {
            let i = this.attr.indexOf(attr);
            this.attr[i].values.current = () => Helper.parser({
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
            this.attr[Style].predicate = () => ["string", "variable"].includes(this.attr[Style].type)
                ?
                    (this.$element.style.cssText =
                        this.attr[Style].values.current() +
                            this.attr[Style].bindValue)
                :
                    Object.assign(this.$element.style, this.attr[Style].values.current());
        if (this.attr[Class])
            this.attr[Class].predicate = () => (this.$element.className = ["string", "variable"].includes(this.attr[Class].type)
                ?
                    this.attr[Class].values.current() + " "
                :
                    Object.entries(this.attr[Class].values.current())
                        .filter(([, value]) => value)
                        .map(([key]) => key)
                        .join(" ") +
                        " " +
                        this.attr[Class].bindValue);
        this.setAttributes();
        this.setBooleanAttributes();
        this.refresh();
    }
}
