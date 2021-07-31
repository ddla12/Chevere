const { ChevereData } = require("../src/js/Chevere");

//Withput the init function
const toggleWithoutInitFunc = new ChevereData({
    name: "toggle",
    data: {
        toggle: false,
    },
});

//Init function without arguments, a boolean and toggle it at the init func
const toggleWithoutArgs = new ChevereData({
    name: "toggle",
    data: {
        toggle: false,
    },
    init() {
        $this.data.toggle = !$this.data.toggle;
    },
});

//Init function with a single argument, a boolean
const toggleWithArgs = new ChevereData({
    name: "toggle",
    data: {
        toggle: false,
    },
    init(value) {
        $this.data.toggle = value;
    },
});

//The parse of the init function at the creation of an instance
describe("Test the parse of the init() function", () => {
    //Test with arguments
    describe("With arguments", () => {
        test("Basic test, with an argument indeed", () => {
            toggleWithArgs.parseArguments("toggle(true)");
            expect(toggleWithArgs.data.toggle).toBe(true);
        });

        test("with an argument that causes the parser to throw an error, an string with unclosed quotes for example", () => {
            expect(() => { toggleWithArgs.parseArguments("toggle(tru)"); }).toThrow(Error);
        });

        test("without passing an argument, throw an error", () => {
            expect(() => { toggleWithArgs.parseArguments("toggle()"); }).toThrowError(Error);
        });

        test("passing more arguments than accepted, throw an error", () => {
            expect(() => { toggleWithArgs.parseArguments("toggle('Sdfsdf', false)"); }).toThrowError(Error);
        });
    });

    //Test without arguments
    describe("Without arguments", () => {
        test("Basic test, without arguments indeed", () => {
            toggleWithoutArgs.parseInit({
                init: toggleWithoutArgs.init,
            });
            expect(toggleWithoutArgs.data.toggle).toBe(true);
        });

        test("try to passing arguments, throw an error", () => {
            expect(() => { toggleWithoutArgs.parseArguments("toggle('sdfs', 'awrf')"); }).toThrowError(Error);
        });
    });
});

describe("Without init() function", () => {
    test("Passing arguments", () => {
        expect(() => { toggleWithoutInitFunc.parseArguments("toggle('test')"); }).toThrowError(Error);
    });
});