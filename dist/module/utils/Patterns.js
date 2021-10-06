export const RegExpFactory = {
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
    isLogicalExpression: new RegExp(String.raw `${commonRegexp.bool}(\s+)?(\||&|=|!=|(>|<)(=)?)`, "s"),
    isVariableAssign: /^this\.data\.\w+(\s)?(\?\?||\+|\-|\*|\/|\%|\*\*|<<?|>>(>)?|\|(\|)?||\&(\&)?|\^)?=/s,
    isString: /^(\`).*\1$/,
    isObject: /^\{.*\}$/,
    isBoolean: new RegExp(`${commonRegexp.bool}$`),
    methodSyntax: /^.*\((.*)?\)$/s,
    bindAndOn: /^(data-(on|bind):|@(on|bind))/,
    bind: /^(data-)/,
    for: /^\w+(\s+)in(\s+)this\.data\.\w+/,
    forParent: /this\..*/g,
};
