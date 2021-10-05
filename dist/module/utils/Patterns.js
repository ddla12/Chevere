export const RegExpFactory = {
    loop: (v) => new RegExp(String.raw `^${v}|(?<=\[)${v}(?=\])?|((?<=(\,|\())|(?<=\s+))${v}(?!\:)|(?<=\$\{)${v}`, "g"),
    $this: (prop) => new RegExp(String.raw `^this\.${prop}\.[a-zA-Z]`, "g"),
    bindOrOn: (val) => new RegExp(String.raw `^data-${val}:|@${val}`),
};
const commonRegexp = {
    bool: String.raw `^(\!)?(true|false|this\.data\.\w+)`,
};
export const Patterns = {
    $data: RegExpFactory.$this("data"),
    arguments: /(?<=\().*(?=\))/g,
    removePar: /.*\(|\)$/g,
    isLogicalExpression: new RegExp(String.raw `${commonRegexp.bool}(\s+)?(\||&|=|!=|(>|<)(=)?)`),
    isVariableAssign: /^this\.data\.\w+(\s)?(\?\?||\+|\-|\*|\/|\%|\*\*|<<?|>>(>)?|\|(\|)?||\&(\&)?|\^)?=/,
    isString: /^(\`).*\1$/,
    isObject: /^\{.*\}$/,
    isBoolean: new RegExp(`${commonRegexp.bool}$`),
    methodSyntax: /(^\w+$)|(^.*?\((.*)?\)$)/,
    bindAndOn: /^(data-(on|bind):|@(on|bind))/,
    bind: /^(data-)/,
    for: /^\w+(\s+)in(\s+)this\.data\.\w+/,
    forParent: /this\..*/g,
};
