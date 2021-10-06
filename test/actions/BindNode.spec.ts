import { ChevereInline } from "@chevere";
import Chevere from "../../src/index";

document.documentElement.innerHTML += `
    <div data-inline="{ data: { bool: true, pd: '2rem' } }">
        <span @bindStyle="\`padding: \$\{this.data.pd\};\`"
            @bindClass="\`\$\{this.data.bool ? 'success' : 'danger'  \}\`">
            Hello
        </span>
        <span @bindStyle="{ padding: '2rem' }" 
            @bindClass="{ 'success': this.data.bool, 'danger': !this.data.bool }">
            Hello
        </span>
        <video @bindControls="false"></video>
        <strong @bindStyle="\`color: blue;\`" style="font-size: 2rem;"></strong>
    </div>
`;

Chevere.search();

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
    test("Throw an error if the 'data-bind' attribute doesn't have neither an object nor template" + 
        "literals nor boolean", () => {
        const el = document.createElement("div");
        el.dataset.inline = "{ data: { bg: 'red' } }";
        el.innerHTML += `
            <span @bindStyle="padding: this.data.bg"></span>
        `;

        new ChevereInline(el);

        expect(console.error).toHaveBeenCalled();
    });
    test("Boolean attributes are specials", () => {
        expect((document.documentElement.querySelector("video") as HTMLVideoElement).controls).toBeFalsy();
    });
    test("Default values are passed", () => {
        const style = getComputedStyle(document.documentElement.querySelector("strong")!);

        expect([ style.color, style.fontSize ]).toStrictEqual([ "blue", "2rem" ]);
    });
});
