import { ChevereNode, ChevereData } from "@chevere";

const element = document.createElement("div");

element.dataset.attached = "data";

describe("Create a basic ChevereNode", () => {
    test("With data", () => {
        const Data = new ChevereData({
            name: "data",
            data: {
                msg: "Hello world"
            },
        });
    
        const Node = new ChevereNode(Data, element);

        expect(Node.data.msg).toBe("Hello world");
    });

    test("With data and methods", () => {
        const Data = new ChevereData({
            name: "data",
            data: {
                msg: "Hello world"
            },
            methods: {
                say() {
                    return this.data.msg;
                }
            }
        });
        
        const spy = jest.spyOn(ChevereNode.prototype, 'parseMethods')
        const Node = new ChevereNode(Data, element);

        expect(spy).toHaveBeenCalled();
        expect(Node.methods.say()).not.toBeUndefined();
    });
});
