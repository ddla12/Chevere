import { Helper } from "@interfaces";

export const Magics: Helper = {
    increment(variable: any): void {
        variable++;
    },
    decrement(variable: any): void {
        variable--;
    },
    toggle(variable: any): void {
        variable = !variable;
    },
    set(variable: any, value: any): void {
        variable = value;
    },
};