import Chevere from "../src/index";

document.documentElement.innerHTML += `
    <div data-attached="test">
        <small data-text="this.data.msg"></small>
    </div>
    <span data-inline="{ data: { msg: 'Hello world' } }">
        <small data-text="this.data.msg"></small>
    </span>
`;

const helloWorld = () => [...document.querySelectorAll("small")].every((s) => s.textContent == "Hello world");

describe("Chevere window object", () => {
    test("Initialized successfully", () => {
        Chevere.search({
            name: "test",
            data: {
                msg: "Hello world"
            }
        });

        expect(helloWorld()).toBeTruthy();
    });
    test("makeNodes works", () => {
        document.documentElement.innerHTML = `
            <div name="chevere">
                <small data-text="this.data.msg"></small>
            </div>
            <div name="chevere">
                <small data-text="this.data.msg"></small>
            </div>
        `;

        Chevere.make({
            data: {
                msg: "Hello world"
            }
        }, ...[...document.querySelectorAll("div[name='chevere']")] as HTMLElement[]);

        expect(helloWorld()).toBeTruthy();
    })
});
