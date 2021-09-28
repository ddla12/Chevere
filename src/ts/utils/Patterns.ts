import { Pattern } from "@interfaces";

/**
 *  A factory for common use RegExp in Chevere environment
 */
export const RegExpFactory = {
    /**
     * Search all references of the 'data-for' variable
     * @param variable
     * @returns A RegExp that differentiates between the real 'data-for' variable and others with the same name
     */
    loop: (variable: string) =>
        new RegExp(
            String.raw`^${variable}|(?<=\[)${variable}(?=\])|(?!\,)${variable}(?=\,)|(?<=\:(\s+)?)${variable}|(?<=\,|\()${variable}`,
            "g",
        ),
    /**
     * Create a RegExp to find 'this' references
     * @param prop
     * @returns A RegExp to find a specific property of 'this' (Chevere)
     */
    $this: (prop: string) =>
        new RegExp(String.raw`^this\.${prop}\.[a-zA-Z]`, "g"),
    /**
     * Create a RegExp to find 'data-on' and 'data-bind'
     * @param val Can be 'bind' or 'on'
     * @returns A RegExp to find attributes with 'data-on/bind' or '@on/bind'
     */
    bindOrOn: (val: string) => new RegExp(String.raw`^data-${val}:|@${val}`),
};

/**
 * A const with repeated RegExp
 */
const commonRegexp = {
    bool: String.raw`^(\!)?(true|false|this\.data\.\w+)`,
};

/**
 * All the Patterns used in attributes and expressions in Chevere
 */
export const Patterns: Pattern = {
    $data: RegExpFactory.$this("data"),
    arguments: /(?<=\().*(?=\))/g,
    isLogicalExpression: new RegExp(
        String.raw`${commonRegexp.bool}(\s+)?(\||&|=|!=|(>|<)(=)?)`,
    ),
    isVariableAssign:
        /^this\.data\.\w+(\s)?(\?\?||\+|\-|\*|\/|\%|\*\*|<<?|>>(>)?|\|(\|)?||\&(\&)?|\^)?=/,
    isString: /^(\`).*\1$/,
    isObject: /^\{.*\}$/,
    isBoolean: new RegExp(`${commonRegexp.bool}$`),
    methodSyntax: /(^\w+$)|(^.*?\((.*)?\)$)/,
    bindAndOn: /^(data-(on|bind):|@(on|bind))/,
    bind: /^(data-)/,
    for: /^\w+(\s+)in(\s+)this\.data\.\w+/,
    forParent: /this\..*/g,
};
