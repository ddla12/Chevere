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
        test("Loop recognizes the loop variable among other of the same name", () => {
            const loop = RegExpFactory.loop("test"),
                forRef = {
                    before: "function(test, test.test, test[test], { test: test })",
                    after: "function(this.data.test, this.data.test.test, this.data.test[this.data.test], { test: this.data.test })",
                };

            expect(forRef.before.replace(loop, "this.data.test")).toStrictEqual(
                forRef.after,
            );
        });
    });
});
