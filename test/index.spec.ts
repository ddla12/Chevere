import { ChevereData } from "@chevere";
import Chevere from "../src/index";

document.documentElement.innerHTML += `
    <div data-attached="test">
        <small data-text="this.data.msg"></small>
    </div>
    <span data-inline="{ msg: 'Hello world' }">
        <b data-text="this.data.msg"></b>
    </span>
`;

const Data = new ChevereData({ 
    name: "test", 
    data: {
        msg: "Hello world"
    } 
});

describe("Chevere window object", () => {
    test("Create a node data", () => {
        

        expect(Chevere.data({
            name: "test",
            data: {
                msg: "Hello world"
            }
        })).toStrictEqual(Data);
    });
    test("Initialized successfully", () => {
        Chevere.start(Data);

        const helloWorld = [
            document.querySelector("small")?.textContent,
            document.querySelector("b")?.textContent
        ].every((s) => s == "Hello world");

        expect(helloWorld).toBeTruthy();
    });
});