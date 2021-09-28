import { Chevere } from "@chevere";
import { Helper, Patterns, RegExpFactory } from "@helpers";
import { Data } from "@interfaces";

export class ChevereInline extends Chevere {
    _attributes: Data<boolean> = {};

    constructor(el: HTMLElement) {
        super(el);
        this.attributes = ["data-text", "data-show"];
        this.actions();

        Object.freeze(this);
    }

    set attributes(attributes: string[]) {
        this._attributes = Object.fromEntries(
            attributes.map((attr) => [
                attr, 
                Boolean(this.element.dataset[attr.replace("data-", "")])
            ]).filter((v) => Boolean(v[1]))
        );

        ["data-on", "data-bind"].forEach((data) => {
            this._attributes[data] = [...this.element.attributes]
                .map((a) => a.name)
                .some((a) => RegExpFactory.bindOrOn(data.replace("data-", "")).test(a));
        });
    }

    actions(): void {
        this.element.textContent! += (this.element.dataset.text) && (Helper.parser<string>({
            expr: this.element.dataset.text!
        })) || "";

        this.element.style.display = (this.element.dataset.show) && (
            Helper.parser<boolean>({ expr: this.element.dataset.show! })
                ? getComputedStyle(this.element).display
                : "none"
            ) || getComputedStyle(this.element).display;

        const findDynamicAttrs = (attr: string) => Object.fromEntries(
            new Set([...this.element.attributes]
                .map((a) => a.name)
                .filter((a) => RegExpFactory.bindOrOn(attr).test(a))
                .map((a) => [
                    a.replace(RegExpFactory.bindOrOn(attr), ""),
                    this.element.getAttribute(a)
                ])
            )
        );

        if(this._attributes["data-on"]) {
            const events = findDynamicAttrs("on");

            Object.entries(events).forEach(([ev, ex]) => {
                if(!Patterns.attr.isMethod.test(ex!)) {
                    throw new SyntaxError(
                        "On inline components, 'data-on' attributes only accepts" + 
                        " methods as value"
                    );
                }

                this.element.addEventListener(ev, (e) => {
                    Helper.eventCallback({
                        expr: ex!,
                        node: this,
                        $event: e
                    })
                });
            });
        }

        if(this._attributes["data-bind"]) {
            const binds = findDynamicAttrs("bind");
            
            if("style" in binds) Object.assign(this.element.style, (() => {
                const value = Helper.parser<string|object>({ expr: binds.style! });

                return (typeof value == "string") 
                    ? Object.fromEntries(value.split(";").map((r) => r.split(":").filter((v) => v))) 
                    : value;

            })());
        
            if("class" in binds) this.element.className = (() => {
                const value = Helper.parser<string|object>({ expr: binds.class! });

                return ((typeof value != "string") 
                    ? Object.entries(value)
                        .filter(([_, c]) => Helper.parser<boolean>({ expr: c }))
                        .map(([c]) => c)
                        .join(" ")
                    : value) + (this.element.className || "");
            })();

            Object.keys(binds)
                .filter((a) => ["style", "class"].includes(a))
                .forEach((attr) => this.element.setAttribute(attr, Helper.parser<string>({ expr: binds[attr]! })));
        }
    }

}