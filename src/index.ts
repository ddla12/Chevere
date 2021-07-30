import { Chevere, ChevereData } from "./Chevere";

const bind: ChevereData = new ChevereData({
    name: 'bind',
    data: {
        toggle: false
    },
    init() {
        $data.toggle = !$data.toggle
    }
});

window.addEventListener("load", () => {
    Chevere.start(bind);
});