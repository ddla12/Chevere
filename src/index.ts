import { Chevere, ChevereData } from "./Chevere";

const toggle: ChevereData = new ChevereData({
    name: 'toggle',
    data: {
        toggle: false
    },
    methods: {
        toggle() {
            this.toggle = !this.toggle;
        }
    }
});

window.addEventListener("load", () => {
    Chevere.start(toggle);
});