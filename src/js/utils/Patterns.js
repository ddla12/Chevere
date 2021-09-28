export const RegExpFactory = {
    loop: (variable) => new RegExp(String.raw `^${variable}|(?<=\[)${variable}(?=\])|(?!\,)${variable}(?=\,)|(?<=\:(\s+)?)${variable}|(?<=\,|\()${variable}`, "g"),
    $this: (prop) => new RegExp(String.raw `^this\.${prop}\.[a-zA-Z]`, "g"),
    bindOrOn: (val) => new RegExp(String.raw `^data-${val}:|@${val}`)
};
const commonRegexp = {
    $this: RegExpFactory.$this("data"),
    words: "[a-zA-Z]+",
    methods: String.raw `^this\.(methods|\$emit|\$emitSelf)\.[a-zA-Z]+`,
    bool: String.raw `^(\!)?(true|false|this\.data\.\w+)`,
};
export const Patterns = {
    global: {
        getName: new RegExp(commonRegexp.words),
        $data: commonRegexp.$this,
        arguments: /(?<=\().*(?=\))/g,
    },
    variables: {
        equality: /(<|>|!)?={1,3}/g,
        value: /(?<=\=).*(?=\;)/g,
    },
    attr: {
        isMagic: /^(\$magics)/,
        methodName: new RegExp(commonRegexp.methods),
        isMethod: /^.+\(.*\)(\;)?$/,
        isLogicalExpression: new RegExp(String.raw `${commonRegexp.bool}(\s+)?(\||&|=|!=|(>|<)(=)?)`),
        isVariableAssign: /^this\.data\.\w+(\s)?(\?\?||\+|\-|\*|\/|\%|\*\*|<<?|>>(>)?|\|(\|)?||\&(\&)?|\^)?=/,
        isString: /^(\`).*\1$/,
        isObject: /^\{.*\}$/,
        isBoolean: new RegExp(`${commonRegexp.bool}$`),
        methodSyntax: /(^\w+$)|(^\w+\((.*)?\)$)/,
        bindAndOn: /^(data-(on|bind):|@(on|bind))/,
        bind: /^(data-)/,
        for: /^\w+(\s+)in(\s+)this\.data\.\w+/,
        forParent: /this\..*/g,
    },
};
//# sourceMappingURL=Patterns.js.map