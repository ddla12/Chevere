import { Chevere, ChevereData } from "./Chevere";

const toggle: ChevereData = new ChevereData({
    name: 'toggle',
    data: {
        counter: 0
    },
    methods: {
        toggle() {
            this.counter++;
        }
    }
});

window.addEventListener("load", () => {
    Chevere.start(toggle);
});