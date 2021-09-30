import { Data, Watch } from "@types";
import { ChevereData } from "./ChevereData";
import { Chevere } from "./Chevere";

/**
 * Components with the 'data-attached' attribute
 * @extends Chevere
 */
export class ChevereNode extends Chevere {
    readonly name: string;
    data: Data<any>;
    methods?: Data<Function>;
    protected watch?: Data<Watch>;
    readonly updated?: () => void;
    readonly updating?: () => void;

    constructor(data: ChevereData, el: HTMLElement) {
        super(el);
        ({
            name: this.name,
            methods: this.methods,
            watch: this.watch,
            updated: this.updated,
            updating: this.updating,
        } = data);

        //ChevereNodes also have reactive methods
        this.data = this.parseData(data.data);
        (this.methods) && this.parseMethods();

        //Get the refs and actions of the component
        this.checkForActionsAndChilds();
        this.findRefs();

        Object.seal(this);
    }

    parseData(data: Data<any>): Data<any> {
        return new Proxy(data, {
            get: (target, name, receiver) => Reflect.get(target, name, receiver),
            set: (target, name, value, receiver) => {
                (this.updating) && this.updating();

                (this.watch!) &&
                this.watch![name as string]?.apply(this, [
                        value,
                        target[name as string],
                    ]);

                Reflect.set(target, name, value, receiver);

                this.updateRelated(name as string);

                (this.updated) && this.updated();
                return true;
            },
        });
    }

    /**
     * Make the methods reactive
     */
    parseMethods(): void {
        this.methods! = Object.values(this.methods!).reduce(
            (rest, func) => ({
                ...rest,
                [func.name]: new Proxy(func, {
                    apply: (target, _, args) => {
                        (this.updating) && this.updating();
                        target.apply(this, [...args]);
                        (this.updated) && this.updated();
                    },
                }),
            }),
            {},
        );
    }
}