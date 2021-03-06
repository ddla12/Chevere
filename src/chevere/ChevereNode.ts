import {
    BindNode,
    ChevereAction,
    EventNode,
    LoopNode,
    ModelNode,
    ShowNode,
    TextNode,
} from "@actions";
import { Helper, Patterns } from "@helpers";
import {
    ActionDynamic,
    Attribute,
    Attributes,
    ChevereChild,
    ChevereNodeData,
    Data,
    Dispatch,
    initFunc,
    Watch,
} from "@types";

/**
 * The main Chevere class, all Chevere components must implement it
 * @class
 * @abstract
 */
export abstract class ChevereNode {
    readonly name?: string;
    readonly id: string;
    readonly $element: HTMLElement;
    init?   : initFunc;
    updated?: () => void;
    beforeUpdating?: () => void;
    data?: Data<any> = {};
    $refs?: Data<HTMLElement>;
    childs?: Data<ChevereChild<Attributes>[]> = {
        ["data-for"]    : [],
        ["data-text"]   : [],
        ["data-show"]   : [],
        ["data-model"]  : [],
        ["data-on"]     : [],
        ["data-bind"]   : []
    };
    methods?: Data<Function>;
    protected watch?: Data<Watch>;


    /**
     * Create a Chevere instance with an HTMLElement, then set it an id
     * @param element A element with 'data-attached/inline' attribute
     */
    constructor(data: ChevereNodeData, element: HTMLElement) {
        ({
            name: this.name,
            watch: this.watch,
            init: this.init,
            updated: this.updated,
            beforeUpdating: this.beforeUpdating,
        } = data);
        
        this.$element = element;

        if(this.$element.dataset.inline && this.$element.dataset.attached) {
            throw new Error("A component cannot have both 'data-' attributes ('inline', 'attached')");
        }

        this.id = this.$element.dataset.id = Helper.setId();

        (data.data) && (this.data = this.parseData(data.data));
        (data.methods) && (this.methods = this.parseMethods(data.methods));

        (this.watch) &&
            Object.keys(this.watch!).some((func) => {
                if (!this.data![func])
                    throw new ReferenceError(
                        `You're trying to watch an undefined property '${func}'`,
                    );
            });
        
        this.$refs = this.findRefs();

        //If there's not a init function and 'data-init' attribute has parameters
        if (this.init == undefined && Patterns.arguments.test(this.$element.dataset.init!))
            throw new EvalError(
                `The ${this.name || "Some"} components don't have an init() function, therefore they do not accept any parameters`,
            );

        if(this.init) this.executeInit();

        //Get the refs and actions of the component
        this.checkForActionsAndChilds();
        
        Object.seal(this);
    }

    /**
     * Execute the init function
     */
    executeInit(): void|Promise<void> {
        let args: [] = Helper.parser({ expr: "[" + this.$element.dataset.init + "]" });

        return (this.init! instanceof Promise)
            ? (async() => await this.init!(...args))()
            : this.init!(...args);
    }

    /**
     * Find and set the $refs of the component
     */
    findRefs(): Data<HTMLElement> {
        return (
            [...this.$element.querySelectorAll("*[data-ref]")] as HTMLElement[]
        ).reduce((props, el) => {
            //If the attribute is empty
            if (!el.dataset.ref)
                throw new SyntaxError("data-ref attribute cannot be empty");

            //If there are repeated 'data-ref' values
            if (Object.keys({ ...props }).some((p) => p == el.dataset.ref!))
                throw new SyntaxError(
                    "It seems like there are repeated 'data-ref' values, check your 'data-ref' attributes",
                );

            return {
                ...props,
                [el.dataset.ref!]: el,
            };
        }, {});
    }

    /**
     * Update all child nodes by a data reference, and attribute
     * @param attr The name of the group to refresh
     * @param name The name of the data property to filter the childs
     */
    refreshChilds(attr: string, name: string): void {
        this.childs![attr].filter((node) =>
            (node as ChevereChild<Attribute>).attr?.values.original.includes(
                name,
            ),
        ).forEach((node) => {
            (node as ChevereAction<Attribute>).refresh();
        });
    }

    /**
     * Find all Child nodes at the current scope
     */
    checkForActionsAndChilds(): void {
        //For now, nested components is not supported
        if (
            this.$element.querySelectorAll("*[data-inline], *[data-attached]")
                .length
        )
            throw Error(
                `Child components is an unsupported feature, sorry about that`,
            );

        //An array of all child nodes order by attribute
        this.childs = {
            ["data-for"]: Helper.getElementsBy({
                attribute: "data-for",
                $element: this.$element,
                parent: this,
                selector: "template[data-for]",
                Child: LoopNode,
            }),
            ["data-text"]: Helper.getElementsBy({
                attribute: "data-text",
                $element: this.$element,
                parent: this,
                selector: "*[data-text]",
                Child: TextNode,
            }),
            ["data-show"]: Helper.getElementsBy({
                attribute: "data-show",
                $element: this.$element,
                parent: this,
                selector: "*[data-show]",
                Child: ShowNode,
            }),
            ["data-model"]: Helper.getElementsBy({
                attribute: "data-model",
                $element: this.$element,
                parent: this,
                selector:
                    "input[data-model], select[data-model], textarea[data-model]",
                Child: ModelNode,
            }),
            ["data-on"]: Helper.getElementsByDataOn({
                attribute: "on",
                Child: EventNode,
                parent: this,
                rescan: false
            }),
            ["data-bind"]: Helper.getElementsByDataOn({
                attribute: "bind",
                Child: BindNode,
                parent: this,
                rescan: false
            }),
        };
    }

    /**
     * Emit an event in the component scope
     * @param data A valid event data
     */
    $emitSelf(data: Dispatch): void {
        this.childs!["data-on"].filter((node) =>
            (node as EventNode).attr!.some((attrs) =>
                attrs.attribute.includes(data.name) && 
                !(attrs.attribute.includes("window")),
            ),
        ).forEach((node) =>
            node.$element.dispatchEvent(
                new CustomEvent(data.name, {
                    detail: data.detail,
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                }),
            ),
        );
    }

    /**
     * Emit a event in the window scope
     * @param data A valid event data
     */
    $emit(data: Dispatch): void {
        window.dispatchEvent(
            new CustomEvent(data.name, {
                detail: data.detail,
                bubbles: true,
                composed: true,
                cancelable: true,
            }),
        );
    }

    reScan(): void {
        this.$refs = this.findRefs();

        const newSimpleChilds = (attr: string, Child: ActionDynamic<Attribute>) => [
            ...this.childs![`data-${attr}`],
            ...Helper.getElementsBy({
                attribute: `data-${attr}`,
                $element: this.$element,
                parent: this,
                selector: `*[data-${attr}][data-key]`,
                Child: Child,
            }),
        ];

        const newComplexChilds = (attr: string, Child: ActionDynamic<Attribute[]>) => [
            ...this.childs![`data-${attr}`],
            ...Helper.getElementsByDataOn({
                attribute: attr,
                Child: Child,
                parent: this,
                rescan: true,
            })
        ];

        [ 
            this.childs!["data-text"],
            this.childs!["data-show"],
            this.childs!["data-on"],
            this.childs!["data-model"],
            this.childs!["data-bind"],
        ] = [ 
            newSimpleChilds("text", TextNode),
            newSimpleChilds("show", ShowNode),
            newSimpleChilds("model", ModelNode),
            newComplexChilds("on", EventNode),
            newComplexChilds("bind", BindNode)
        ];
    };

    /**
     * Update all child nodes data
     * @param name A data property name
     */
    updateRelated(name: string): void {
        this.childs!["data-for"]
            .filter((child) => (child as LoopNode).variables.parent.includes(name))
            .forEach((child) => (child as LoopNode).refresh());

        ["data-show", "data-text"].forEach((attr) =>
            this.refreshChilds(attr, name as string),
        );

        this.childs!["data-model"].filter(
            (node) => (node as ModelNode).variable == name,
        ).forEach((node) => (node as ModelNode).bindData());

        this.childs!["data-bind"]
            .filter((child) => (child as BindNode).attr.some((attr) => attr.values.original.includes(name)))
            .forEach((child) =>
                (child as BindNode).refresh(),
            );
    }

    /**
     * Make the methods reactive
     */
    parseMethods(data: Data<Function>): Data<Function> {
        return Object.values(data).reduce(
            (rest, func) => ({
                ...rest,
                [func.name]: new Proxy(func, {
                    apply: (target, _, args) => {
                        (this.beforeUpdating) && this.beforeUpdating();

                        const result = target.apply(this, [...args]);

                        (this.updated) && this.updated();

                        return result;
                    },
                }),
            }),
            {},
        );
    }

    /**
     * Make the data reactive
     * @param data 
     * @returns A reactive data
     */
    parseData(data: Data<any>): Data<any> {
        return Helper.reactive({
            object: data,
            beforeSet: (target, name, value) => {
                this.beforeUpdating && this.beforeUpdating();

                this.watch! &&
                    this.watch![name as string]?.apply(this, [
                        value,
                        target![name as string],
                    ]);
            },
            afterSet: (_, name) => {
                this.updateRelated(name as string);

                this.updated && this.updated();
            },
        });
    }
}
