import { Data, Reactive, Watch } from "@types";
import { ChevereData } from "./ChevereData";
import { Chevere } from "./Chevere";
import { Helper } from "@helpers";

/**
 * Components with the 'data-attached' attribute
 * @extends Chevere
 */
export class ChevereNode extends Chevere {
    readonly name: string;
    data: Data<any>;
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

        //Nodes cannot be created without a 'data-attached' attribute
        if(!this.element.dataset.attached) throw new Error("'data-attached' cannot be empty");

        //ChevereNodes also have reactive methods
        this.data = this.parseData(data.data);
        (this.methods) && (this.methods = this.parseMethods({
            object: this.methods,
            beforeSet: () => {
                (this.updating) && this.updating();
            },
            afterSet: () => {
                (this.updated) && this.updated();
            }
        }));

        //Get the refs and actions of the component
        this.checkForActionsAndChilds();
        this.findRefs();

        Object.seal(this);
    }

    parseData(data: Data<any>): Data<any> {
        return Helper.reactive({
            object: data,
            beforeSet: (target, name, value) => {
                (this.updating) && this.updating();

                (this.watch!) &&
                this.watch![name as string]?.apply(this, [
                        value,
                        target![name as string],
                ]);
            },
            afterSet: (_, name) => {
                this.updateRelated(name as string);

                (this.updated) && this.updated();
            }
        });
    }
}