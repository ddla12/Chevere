import { Pattern } from "@types";
export declare const RegExpFactory: {
    loop: (variable: string) => RegExp;
    $this: (prop: string) => RegExp;
    bindOrOn: (val: string) => RegExp;
};
export declare const Patterns: Pattern;
