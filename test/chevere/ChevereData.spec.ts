import { ChevereData } from "@chevere";

describe("Basic ChevereData", () => {
    const Basic = new ChevereData({
        name: "test",
        data: {
            test: false,
            change: ""
        },
        init(val) {
            this.data.test = true;
            this.data.change = val;
        },
        updated() {
            return;
        },
        updating() {
            return;
        }
    });
    
    test("Data name is 'test'", () => {
        expect(Basic.name).toBe("test");
    });
    test("'test' property is equal to 'false' before 'init' is called", () => {
        expect(Basic.data.test).toBeFalsy();
    });
    test("'change' property is equal to '' before 'init' is called", () => {
        expect(Basic.data.change).toBeFalsy();
    });
    test("'init' function changes the value of 'test' to 'true'", () => {
        Basic.init!();
        expect(Basic.data.test).toBeTruthy();
    });
    test("'change' property is equal to 'hello world' when 'init' function is called", () => {
        Basic.init!("Hello world");
        expect(Basic.data.change).toBe("Hello world");
    });
    test("'updated' and 'updating' methods aren't undefined", () => {
        expect(Basic.updated).not.toBeUndefined();
        expect(Basic.updating).not.toBeUndefined();
    });
    test("The object is sealed", () => {
        expect(Object.isSealed(Basic)).toBeTruthy();
    });
});

describe("Trying to watch an undefined property...", () => {
    test("...throws a ReferenceError at constructor", () => {
        expect(() => {
            new ChevereData({
                name: "test",
                data: {
                    test: false
                },
                watch: {
                    tes() {
                        return;
                    }
                }
            })
        }).toThrow(ReferenceError);
    });
});