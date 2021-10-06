import { RegExpFactory } from "@helpers";

describe("Patterns", () => {
    describe("RegExpFactory", () => {
        test("A proper regexp for this", () => {
            expect(
                RegExpFactory.$this("data").test("this.data.test"),
            ).toBeTruthy();
        });
        test("Bind or On regexp has been created succesfully", () => {
            expect(RegExpFactory.bindOrOn("on").test("@onClick")).toBeTruthy();
        });
    });
});
