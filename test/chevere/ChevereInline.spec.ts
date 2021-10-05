import { ChevereInline } from "@chevere";

jest.spyOn(console, "log");

describe("Basic Inline component", () => {
    test("Without defined data", () => {
        const BasicInline = new ChevereInline(document.createElement("div"));

        expect(BasicInline instanceof ChevereInline).toBeTruthy();
    });
    describe("With defined data", () => {
        test("Have that data", () => {
            const el = document.createElement("div");

            el.dataset.inline = "{ data: { msg: 'Hello world' } }";
    
            const Inline = new ChevereInline(el);
    
            expect(Inline.data!.msg).toBe("Hello world");
        });
        test("init function is executed successfully", () => {
            const el = document.createElement("div");

        el.dataset.inline = "{ init() { console.log('Hello world'); } }";

        const Inline = new ChevereInline(el);

        expect(console.log).toBeCalledWith("Hello world");
        });
        test("Is sealed", () => {
            expect(
                Object.isSealed(new ChevereInline(document.createElement("span"))),
            ).toBeTruthy();
        });
    });
});

test("Refs", () => {
    const el = document.createElement("div");
    el.innerHTML = `<span data-ref="test">Hello world</span>`;

    const Inline = new ChevereInline(el);

    expect(Inline.refs!.test).not.toBeUndefined();
});

describe("Childs", () => {
    const el = document.createElement("div");

    el.dataset.inline = `{
        data: {
            msg: 'Hello world',
            array: [1, 2, 3, 4],
            method() {
                return 1 + 1;
            }
        }
    }`;

    //Data-for element throws an Error, caused by the ":scope" selector, but it works
    el.innerHTML = `
        <span data-text="this.data.msg"></span>
        <span data-show="true == false"></span>
        <span @bindStyle="{ padding: '1rem' }">Hello!</span>
        <button @onClick="this.data.method()">Click</button>
        <input type="text" data-model="this.data.msg"/>
    `;

    const Inline = new ChevereInline(el);

    test("Have those childs", () => {
        expect(
            Object.values(Inline.childs!)
                .filter((arr) => Boolean(arr.length))
                .every((arr) => arr.length >= 1),
        ).toBeTruthy();
    });
    test("span with 'data-show' is hidden", () => {
        expect(
            (
                Inline.element.querySelector(
                    "span[data-show]",
                )! as HTMLSpanElement
            ).style.display,
        ).toBe("none");
    });
    test("style of span with 'data-bind' is 'padding: 1rem'", () => {
        expect(Inline.childs!["data-bind"][0].element.style.padding).toBe(
            "1rem",
        );
    });
    test("Childs react to changes", () => {
        Inline.data!.msg = "Reactive";

        expect(
            (Inline.element.querySelector("span[data-text]") as HTMLSpanElement)
                .textContent,
        ).toBe("Reactive");
        expect(
            (Inline.element.querySelector("input") as HTMLInputElement).value,
        ).toBe("Reactive");
    });
});
