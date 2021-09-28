import { Attribute, Attributes, ChevereChild, ChevereElement, Data, Dispatch, Relation, Watch } from "@interfaces";
import { ChevereData } from "./ChevereData";
import { Helper } from "@helpers";
import { BindNode, ChevereAction, EventNode, LoopNode, ModelNode, ShowNode, TextNode } from "@actions";
import { Chevere } from "./Chevere";

export class ChevereNode extends Chevere implements ChevereElement {
    name        : string;
    data        : Data<any>;
    methods?    : Data<Function>;
    refs?       : Data<HTMLElement>;
    #childs?    : Data<ChevereChild<Attributes>[]> = {
        "data-on"   : [],
        "data-text" : [],
        "data-model": [],
        "data-for"  : [],
        "data-show" : [],
        "data-ref"  : [],
        "data-bind" : [],
    };
    #watch?     : Data<Watch>;
    updated?    : () => void;
    updating?   : () => void;

    constructor(data: ChevereData, el: HTMLElement) {
        super(el);
        ({ 
            name: this.name, 
            methods: this.methods, 
            watch: this.#watch, 
            updated: this.updated,
            updating: this.updating,
        } = data);

        this.data = this.parseData(data.data);

        (this.methods) && this.parseMethods();
        /**
         *  Get the events and actions of the component
         */
        this.checkForActionsAndChilds();

        this.findRefs();

        Object.freeze(this);
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
        this.#childs![attr].filter(
            (node) => ((node as ChevereChild<Attribute>).attr?.values.original.includes(name))
        ).forEach((node) => {
            (node as ChevereAction<Attribute>).setAction();
        });
    }
    /**
     * Parse all the data, they need getter and a setter
     * @param data The primitive data
     */
    parseData(data: Data<any>): Data<any> {
        const self = this;

        return new Proxy(data, {
            get(target, name, receiver) {
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                (self.updating) && self.updating();

                (self.#watch!) 
                    && self.#watch![name as string]?.apply(self, [value, target[name as string]]);

                Reflect.set(target, name, value, receiver);

                ["data-show", "data-text"].forEach((attr) => self.refreshChilds(attr, (name as string)));

                self.#childs!["data-model"].filter((node)=> (node as ModelNode).variable == name)
                    .forEach((node) => (node as ModelNode).bindData());

                self.#childs!["data-bind"].forEach((child) => (child as BindNode).setAction());
                
                (self.updated) && self.updated();
                return true;
            }
        });
    }

    parseMethods(): void {
        const self = this;

        this.methods! = Object.values(this.methods!)
            .reduce((rest, func) => ({ 
                ...rest, 
                [func.name]: new Proxy(func, {
                    apply(target, _, args) {
                        (self.updating) && self.updating();
                        target.apply(self, [...args]);
                        (self.updated) && self.updated();
                    }
                })
            }), {});
    }

    setChilds(data: Relation) {
        data.nodes.forEach((node) => {
            this.#childs![data.type].push(node);
        });
    }
    /**
     * Find all the childrens that have an action and data
     */
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
        this.#childs!["data-on"]
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
}