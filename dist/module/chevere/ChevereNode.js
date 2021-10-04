import { Chevere } from "./Chevere";
import { Helper } from "../utils/index.js";
export class ChevereNode extends Chevere {
    constructor(data, el) {
        super(el);
        ({
            name: this.name,
            methods: this.methods,
            watch: this.watch,
            updated: this.updated,
            updating: this.updating,
        } = data);
        if (!this.element.dataset.attached)
            throw new Error("'data-attached' cannot be empty");
        this.data = this.parseData(data.data);
        this.methods &&
            (this.methods = this.parseMethods({
                object: this.methods,
                beforeSet: () => {
                    this.updating && this.updating();
                },
                afterSet: () => {
                    this.updated && this.updated();
                },
            }));
        this.checkForActionsAndChilds();
        this.findRefs();
        Object.seal(this);
    }
    parseData(data) {
        return Helper.reactive({
            object: data,
            beforeSet: (target, name, value) => {
                this.updating && this.updating();
                this.watch &&
                    this.watch[name]?.apply(this, [value, target[name]]);
            },
            afterSet: (_, name) => {
                this.updateRelated(name);
                this.updated && this.updated();
            },
        });
    }
}
