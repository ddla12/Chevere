import { ChevereInline } from "@chevere";
import Chevere from "../../src/index";

document.documentElement.innerHTML += `
    <span data-inline="{ data: { toggle: false } }">
        <em data-show="this.data.toggle"></em>
        <button @onClick="this.data.toggle = true"></button>
    </span>
`;

Chevere.search();

jest.spyOn(console, "error").mockImplementation(jest.fn());

describe("ShowNode", () => {
    test("The element is hidden at first", () => {
        expect(
            getComputedStyle(document.querySelector("em")!).display,
        ).toStrictEqual("none");
    });
    test("After data change, to 'true', the element is displayed in the DOM", () => {
        document.querySelector("button")?.click();

        expect(
            getComputedStyle(document.querySelector("em")!).display,
        ).not.toStrictEqual("none");
    });
    test("Only booleans in 'data-show' attribute", () => {
        const span = document.createElement("span");
        span.innerHTML += `<b data-show="\`Hello world\`"></b>`;

        new ChevereInline(span);

        expect(console.error).toHaveBeenCalled();
    });
});
