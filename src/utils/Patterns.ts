import { Pattern } from "@types";

/**
 *  A factory for common use RegExp in Chevere environment
 */
export const RegExpFactory = {
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
    removePar: /.*\(|\)$/g,
    isLogicalExpression: new RegExp(
        String.raw`${commonRegexp.bool}(\s+)?(\||&|=|!=|(>|<)(=)?)`, "s"
    ),
    isVariableAssign:
        /^this\.data\.\w+(\s)?(\?\?||\+|\-|\*|\/|\%|\*\*|<<?|>>(>)?|\|(\|)?||\&(\&)?|\^)?=/s,
    isString: /^(\`).*\1$/,
    isObject: /^\{.*\}$/,
    isBoolean: new RegExp(`${commonRegexp.bool}$`),
    methodSyntax: /^.*\((.*)?\)$/s,
    bindAndOn: /^(data-(on|bind):|@(on|bind))/,
    bind: /^(data-)/,
    for: /^\w+(\s+)in(\s+)this\.data\.\w+/,
    forParent: /this\..*/g,
};
