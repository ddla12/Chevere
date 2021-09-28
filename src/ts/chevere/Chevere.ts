import { BindNode, ChevereAction, EventNode, LoopNode, ModelNode, ShowNode, TextNode } from "@actions";
import { Helper } from "@helpers";
import { Attribute, Attributes, ChevereChild, Data, Dispatch, Relation } from "@interfaces";

export abstract class Chevere {
    id      : string;
    element : HTMLElement;
    refs?   : Data<HTMLElement>;
    childs? : Data<ChevereChild<Attributes>[]> = {
        "data-on"   : [],
        "data-text" : [],
        "data-model": [],
        "data-for"  : [],
        "data-show" : [],
        "data-ref"  : [],
        "data-bind" : [],
    };
    abstract data?: Data<any>;

    constructor(element: HTMLElement) {
        this.element = element;
        this.id = this.setId();
        this.element.dataset.id = this.id;
    }

    abstract parseData(data: Data<any>): Data<any>;

    setId(): string {
        return Math.random().toString(32).substr(2);
    }
    
    findRefs(): void {
        this.refs = ([...this.element.querySelectorAll("*[data-ref]")] as HTMLElement[])
            .reduce((props, el) => {
                if(!el.dataset.ref)
                    throw new SyntaxError("data-ref attribute cannot be empty");

                if(Object.keys({...props}).some((p) => p == el.dataset.ref!))
                    throw new SyntaxError("It seems like there are repeated 'data-ref' values, check your 'data-ref' attributes")

                return {
                    ...props,
                    [el.dataset.ref!]: el,
                }
            }, {});
    }

    refreshChilds(attr: string, name: string): void {
        this.childs![attr].filter(
            (node) => ((node as ChevereChild<Attribute>).attr?.values.original.includes(name))
        ).forEach((node) => {
            (node as ChevereAction<Attribute>).setAction();
        });
    }

    $emit(data: Dispatch): void {
        window.dispatchEvent(
            new CustomEvent(data.name, {
                detail      : data.detail,
                bubbles     : true,
                composed    : true,
                cancelable  : true,
            })
        );
    }

    setChilds(data: Relation) {
        data.nodes.forEach((node) => {
            this.childs![data.type].push(node);
        });
    }

    checkForActionsAndChilds(): void {
        if(this.element.querySelectorAll("*[data-inline], *[data-attached]").length)
            throw Error(`Child components is an unsupported feature, sorry about that`);

        const childs  = [
            Helper.getElementsBy({
                attribute: "data-for",
                element: this.element,
                parent: this,
                selector: "template[data-for]",
                Child: LoopNode
            }),
            Helper.getElementsBy({
                attribute: "data-text",
                element: this.element,
                parent: this,
                selector: "*[data-text]",
                Child: TextNode
            }),
            Helper.getElementsBy({
                attribute: "data-show",
                element: this.element,
                parent: this,
                selector: "*[data-show]",
                Child: ShowNode
            }),
            Helper.getElementsBy({
                 attribute: "data-model",
                element: this.element,
                parent: this,
                selector: "input[data-model], select[data-model], textarea[data-model]",
                Child: ModelNode
            }),
            Helper.getElementsByDataOn({
                attribute: "on",
                Child: EventNode,
                parent: this
            }),
            Helper.getElementsByDataOn({
                attribute: "bind",
                Child: BindNode,
                parent: this
            })
        ];

        childs.forEach((child) => (child.nodes.length) && this.setChilds(child));
    }
    
    $emitSelf(data: Dispatch): void {
        this.childs!["data-on"]
            .filter((node) => (node as EventNode).attr!
                .some((attrs) => attrs.attribute.includes(data.name))
            ).forEach((node) => node.element.dispatchEvent(
                new CustomEvent(data.name, {
                    detail      : data.detail,
                    bubbles     : true,
                    composed    : true,
                    cancelable  : true,
            }))
        );
    }

    updateRelated(name: string): void {
        ["data-show", "data-text"].forEach((attr) => this.refreshChilds(attr, (name as string)));

        this.childs!["data-model"].filter((node)=> (node as ModelNode).variable == name)
            .forEach((node) => (node as ModelNode).bindData());

        this.childs!["data-bind"].forEach((child) => (child as BindNode).setAction());
    }
}