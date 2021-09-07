import { ParsedData } from "@interfaces";

export const Magics: { [func: string]: Function } = {
    increment(variable: ParsedData): void {
        variable.value++;
    },
    decrement(variable: ParsedData): void {
        variable.value--;
    },
    toggle(variable: ParsedData): void {
        variable.value = !variable.value;
    },
    set(variable: ParsedData, value: any): void {
        variable.value = value;
    },
};