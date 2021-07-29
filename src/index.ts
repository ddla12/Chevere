import { Chevere, ChevereData } from "./Chevere";

const bind: ChevereData = new ChevereData({
    name: 'bind',
    data: {
        toggle: false
        text: "test"
    },
    methods: {
        toggle() {
            $data.toggle = !$data.toggle;
        }
    }
});

window.addEventListener("load", () => {
    Chevere.start(bind);
});