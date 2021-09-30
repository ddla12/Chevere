import { Chevere } from "./Chevere";
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
        this.data = this.parseData(data.data);
        (this.methods) && this.parseMethods();
        this.checkForActionsAndChilds();
        this.findRefs();
        Object.seal(this);
    }
    parseData(data) {
        return new Proxy(data, {
            get: (target, name, receiver) => Reflect.get(target, name, receiver),
            set: (target, name, value, receiver) => {
                (this.updating) && this.updating();
                (this.watch) &&
                    this.watch[name]?.apply(this, [
                        value,
                        target[name],
                    ]);
                Reflect.set(target, name, value, receiver);
                this.updateRelated(name);
                (this.updated) && this.updated();
                return true;
            },
        });
    }
    parseMethods() {
        this.methods = Object.values(this.methods).reduce((rest, func) => ({
            ...rest,
            [func.name]: new Proxy(func, {
                apply: (target, _, args) => {
                    (this.updating) && this.updating();
                    target.apply(this, [...args]);
                    (this.updated) && this.updated();
                },
            }),
        }), {});
    }
}
