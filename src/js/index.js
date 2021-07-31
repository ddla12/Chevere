"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Chevere_1 = require("./Chevere");
const bind = new Chevere_1.ChevereData({
    name: 'bind',
    data: {
        toggle: false
    },
    init() {
        $this.data.toggle = !$this.data.toggle;
    }
});
window.addEventListener("load", () => {
    Chevere_1.Chevere.start(bind);
});
//# sourceMappingURL=index.js.map