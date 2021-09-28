var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ChevereNode_watch;
import { Chevere } from "./Chevere";
/**
 * Components with the 'data-attached' attribute
 * @extends Chevere
 * @implements {ChevereElement}
 */
export class ChevereNode extends Chevere {
    constructor(data, el) {
        var _a;
        super(el);
        _ChevereNode_watch.set(this, void 0);
        (_a = this, {
            name: this.name,
            methods: this.methods,
            watch: ({ set value(_b) { __classPrivateFieldSet(_a, _ChevereNode_watch, _b, "f"); } }).value,
            updated: this.updated,
            updating: this.updating,
        } = data);
        //ChevereNodes also have reactive methods
        this.data = this.parseData(data.data);
        this.methods && this.parseMethods();
        //Get the refs and actions of the component
        this.checkForActionsAndChilds();
        this.findRefs();
        Object.freeze(this);
    }
    parseData(data) {
        const self = this;
        return new Proxy(data, {
            get(target, name, receiver) {
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                self.updating && self.updating();
                __classPrivateFieldGet(self, _ChevereNode_watch, "f") &&
                    __classPrivateFieldGet(self, _ChevereNode_watch, "f")[name]?.apply(self, [
                        value,
                        target[name],
                    ]);
                Reflect.set(target, name, value, receiver);
                self.updateRelated(name);
                self.updated && self.updated();
                return true;
            },
        });
    }
    /**
     * Make the methods reactive
     */
    parseMethods() {
        const self = this;
        this.methods = Object.values(this.methods).reduce((rest, func) => ({
            ...rest,
            [func.name]: new Proxy(func, {
                apply(target, _, args) {
                    self.updating && self.updating();
                    target.apply(self, [...args]);
                    self.updated && self.updated();
                },
            }),
        }), {});
    }
}
_ChevereNode_watch = new WeakMap();
//# sourceMappingURL=ChevereNode.js.map