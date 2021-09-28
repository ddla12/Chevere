import { ChevereElement, Data, Watch } from "@interfaces";
import { ChevereData } from "./ChevereData";
import { Chevere } from "./Chevere";

export class ChevereNode extends Chevere implements ChevereElement {
    name        : string;
    data        : Data<any>;
    methods?    : Data<Function>;
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

                self.updateRelated(name as string);
                
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
}