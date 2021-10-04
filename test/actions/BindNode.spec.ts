import { ChevereInline } from "@chevere";
import Chevere from "../../src/index";

document.documentElement.innerHTML += `
    <div data-inline="{ bool: true, pd: '2rem' }">
        <span @bindStyle="\`padding: \$\{this.data.pd\};\`"
            @bindClass="\`\$\{this.data.bool ? 'success' : 'danger'  \}\`">
            Hello
        </span>
        <span @bindStyle="{ padding: '2rem' }" 
            @bindClass="{ 'success': this.data.bool, 'danger': !this.data.bool }">
            Hello
        </span>
    </div>
`;

Chevere.start();

jest.spyOn(console, "error").mockImplementation(jest.fn());

describe("BindNode", () => {
    test("Attribute initialized succesfully", () => {
        expect(
            [...document.documentElement.querySelectorAll("span")].every(
                (span) =>
                    getComputedStyle(span).padding == "2rem" &&
                    span.classList.contains("success"),
            ),
        ).toBeTruthy();
    });
    test("Throw an error if the 'data-bind' attribute doesn't have an object or a template literal", () => {
        const el = document.createElement("div");
        el.dataset.inline = "{ bg: 'red' }";
        el.innerHTML += `
            <span @bindStyle="padding: this.data.bg"></span>
        `;

        new ChevereInline(el);

        expect(console.error).toHaveBeenCalled();
    });
});
