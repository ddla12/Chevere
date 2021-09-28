import { Pattern } from "@interfaces";
/**
 *  A factory for common use RegExp in Chevere environment
 */
export declare const RegExpFactory: {
    /**
     * Search all references of the 'data-for' variable
     * @param variable
     * @returns A RegExp that differentiates between the real 'data-for' variable and others with the same name
     */
    loop: (variable: string) => RegExp;
    /**
     * Create a RegExp to find 'this' references
     * @param prop
     * @returns A RegExp to find a specific property of 'this' (Chevere)
     */
    $this: (prop: string) => RegExp;
    /**
     * Create a RegExp to find 'data-on' and 'data-bind'
     * @param val Can be 'bind' or 'on'
     * @returns A RegExp to find attributes with 'data-on/bind' or '@on/bind'
     */
    bindOrOn: (val: string) => RegExp;
};
/**
 * All the Patterns used in attributes and expressions in Chevere
 */
export declare const Patterns: Pattern;
