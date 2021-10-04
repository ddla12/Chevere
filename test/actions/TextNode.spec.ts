import { ChevereInline } from "@chevere";
import Chevere from "../../src/index";

document.documentElement.innerHTML += `
    <span data-inline="{ msg: 'Hello world' }">
        <em data-text="this.data.msg"></em>
        <p data-text="\`\$\{this.data.msg\}, How are you?\`"></p>
    </span>
`;

Chevere.start();

jest.spyOn(console, "error").mockImplementation(jest.fn());

describe("TextNode", () => {
    test("Simple variable reference", () => {
        expect(document.querySelector("em")?.textContent).toStrictEqual(
            "Hello world",
        );
    });
    test("Template literals are accepted as attribute value", () => {
        expect(document.querySelector("p")?.textContent).toStrictEqual(
            "Hello world, How are you?",
        );
    });
    test("'data-text' attribute only accepts strings", () => {
        const span = document.createElement("span");
        span.innerHTML += `<p data-text="console.log('Hello')"></p>`;

        new ChevereInline(span);

        expect(console.error).toHaveBeenCalled();
    });
});
