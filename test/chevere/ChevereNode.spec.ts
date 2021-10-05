import { ChevereNode } from "@chevere";

jest.spyOn(console, "log");

const element = document.createElement("div");

element.dataset.attached = "data";

describe("Create a basic ChevereNode", () => {
    describe("Basic functions", () => {
        const BasicNode = new ChevereNode({
            name: "data",
            data: {
                msg: "Hello world",
            },
            init() {
                console.log(1);
            }
        }, element);

        test("data property 'msg' is equal to 'Hello world'", () => {
            expect(BasicNode.data!.msg).toBe("Hello world");
        });
        test("init function is called", () => {
            expect(console.log).toHaveBeenCalledWith(1);
        });
        test("The node is sealed", () => {
            expect(Object.isSealed(BasicNode)).toBeTruthy();
        });
        test("The id is set", () => {
            expect(BasicNode.id).not.toBeUndefined();
        });
        test("Has a proper element", () => {
            expect(BasicNode.element).toBe(element);
        });
    });
    describe("Reactivity", () => {
        const Data = {
            name: "data",
            data: {
                msg: "Hello world",
            },
            methods: {
                say() {
                    (this as unknown as ChevereNode).data!.msg = "Bye world";
                },
            },
            updated() {
                return;
            },
            updating() {
                return "Hello world";
            },
            watch: {
                msg() {
                    return;
                },
            },
        };

        test("'parseMethods' and 'parseDate' have been called", () => {
            const [methods, data] = [
                jest.spyOn(ChevereNode.prototype, "parseMethods"),
                jest.spyOn(ChevereNode.prototype, "parseData"),
            ];

            new ChevereNode(Data, element);

            expect(methods).toHaveBeenCalled();
            expect(data).toHaveBeenCalled();
        });

        describe("'updated', 'updating' and 'watch'", () => {
            const Node = new ChevereNode(Data, element);

            test("'updated', 'updating' and 'watch' aren't undefined", () => {
                expect(Node.updating).not.toBeUndefined();
                expect(Node.updated).not.toBeUndefined();
                expect((Node as any).watch!.msg).not.toBeUndefined();
            });
            test("'updated', 'updating' and 'watch' are called after a method call", () => {
                jest.spyOn((Node as any).watch!, "msg");
                jest.spyOn(Node, "updated");
                jest.spyOn(Node, "updating");

                Node.methods?.say();

                expect(Node.updated).toHaveBeenCalled();
                expect(Node.updating).toHaveBeenCalled();
                expect((Node as any).watch.msg).toHaveBeenCalled();
            });
        });
    });
});
