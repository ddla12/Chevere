import { ChevereNode } from "@chevere";
import { Helper } from "@helpers";

jest.spyOn(Helper, "eventCallback");
jest.spyOn(Helper, "getElementsBy");
jest.spyOn(Helper, "getElementsByDataOn");

describe("Helper", () => {
    const element = document.createElement("div");
    element.dataset.attached = "test";
    element.innerHTML += `
        <button @onClick="console.log(this.data.msg)"></button>
    `;

    const Node = new ChevereNode(
        {
            data: {
                msg: "Hello world",
            },
        },
        element,
    );

    describe("Parser can parse anything", () => {
        test("Primitive types and arrays", () => {
            const values = {
                before: {
                    string: Helper.parser<string>({ expr: "'Hello world'" }),
                    number: Helper.parser<number>({ expr: "17" }),
                    boolean: Helper.parser<boolean>({ expr: "true || false" }),
                    array: Helper.parser<number[]>({ expr: "[1, 2, 3 ,4]" }),
                },
                after: {
                    string: "Hello world",
                    number: 17,
                    boolean: true,
                    array: [1, 2, 3, 4],
                },
            };

            expect(Object.values(values.before)).toStrictEqual(
                Object.values(values.after),
            );
        });
        test("With a ChevereNode", () => {
            expect(
                Helper.parser<string>({ expr: "this.data.msg", node: Node }),
            ).toStrictEqual("Hello world");
        });
    });
    test("Event callback is called", () => {
        Node.childs!["data-on"][0].element.click();
        expect(Helper.eventCallback).toBeCalled();
    });
    describe("Selector functions", () => {
        test("'getElementsBy' is called", () => {
            expect(Helper.getElementsBy).toHaveBeenCalled();
        });
        test("'getElementsByDataOn' is called", () => {
            expect(Helper.getElementsByDataOn).toHaveBeenCalled();
        });
    });
    describe("Reactive", () => {
        test("Make any object reactive", () => {
            jest.spyOn(console, "log");

            const reactive = Helper.reactive({
                object: {
                    msg: "Message",
                },
                afterSet: (_, __, value) => {
                    console.log(value);
                },
            });

            reactive.msg = "Hello world";

            expect(console.log).toBeCalled();
        });
    });
});
