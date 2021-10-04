import { ChevereInline } from "@chevere";

const el = document.createElement("div");

el.dataset.inline = `{ 
    text: 'Hello world', 
    singleCheck: false, 
    radio: '', 
    select: '',
    multipleCheck: ''
}`;

el.innerHTML += `
    <input type="text" data-model="this.data.text"/>
    <input type="checkbox" data-model="this.data.singleCheck"/>
    <select data-model="this.data.select">
        <option value="USA">USA</option>
    </select>
    <input type="radio" name="chevere" value="Hello" data-model="this.data.radio"/>
    <input type="checkbox" name="multiple" value="Araure"   data-model="this.data.multipleCheck"/>
    <input type="checkbox" name="multiple" value="Acarigua" data-model="this.data.multipleCheck"/>
    <input type="checkbox" name="multiple" value="Guanare"  data-model="this.data.multipleCheck"/>
`;

const Inline = new ChevereInline(el);

const inputs = {
    text: Inline.element.querySelector(
        "input[type='text']",
    ) as HTMLInputElement,
    singleCheck: Inline.element.querySelector(
        "input[type='checkbox']",
    ) as HTMLInputElement,
    select: Inline.element.querySelector("select") as HTMLSelectElement,
    radio: Inline.element.querySelector(
        "input[type='radio']",
    ) as HTMLInputElement,
    multipleCheck: [
        ...Inline.element.querySelectorAll("input[name='multiple']"),
    ] as HTMLInputElement[],
};

const setAllCheckbox = (value: boolean) => {
    inputs.multipleCheck.forEach((input) => {
        input.checked = value;
        input.dispatchEvent(new Event("input"));
    });
};

describe("ModelNode", () => {
    test("Text input has the right value", () => {
        expect(inputs.text.value).toStrictEqual("Hello world");
    });
    test("Data is reactive, so its 'to model' properties changed by the inputs", () => {
        inputs.text.value = "Chevere";
        inputs.select.value = "USA";

        inputs.radio.checked = inputs.singleCheck.checked = true;

        [inputs.text, inputs.singleCheck, inputs.select, inputs.radio].forEach(
            (input) => input.dispatchEvent(new Event("input")),
        );

        expect(Inline.data!.text).toStrictEqual("Chevere");
        expect(Inline.data!.singleCheck).toBeTruthy();
        expect(Inline.data!.radio).toStrictEqual("Hello");
        expect(Inline.data!.select).toStrictEqual("USA");
    });
    test("Multiple checkboxes are treated as an array...", () => {
        setAllCheckbox(true);

        expect(Inline.data!.multipleCheck).toStrictEqual([
            "Araure",
            "Acarigua",
            "Guanare",
        ]);
        expect(Inline.data!.multipleCheck instanceof Array).toBeTruthy();
    });
    test("If none of them are checked, then its 'to model' property is false", () => {
        setAllCheckbox(false);

        expect(Inline.data!.multipleCheck).toBeFalsy();
    });
});
