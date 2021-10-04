import Chevere from "../../src/index";

var btns: HTMLButtonElement[] = [];

document.documentElement.innerHTML += `
    <div data-inline="{ 
        msg: 'Hello world from an EventNode', 
        func($event, $el) { btns = [$event.target, $el]; } 
    }">
        <button id="one" @onClick="console.log(this.data.msg)">Click</button>
        <button id="two" @onClick="this.methods.func($event, $el)">Click</button>
    </div>
`;

jest.spyOn(console, "log");

Chevere.start();

const [one, two] = [
    document.querySelector("#one") as HTMLButtonElement,
    document.querySelector("#two") as HTMLButtonElement,
];

describe("EventNode", () => {
    test("Listener was successfully added", () => {
        one.click();

        expect(console.log).toBeCalled();
    });
    test("$event and $el are successfully passed", () => {
        two.click();

        expect(btns.every((btn) => btn === btns[0])).toBeTruthy();
    });
});
