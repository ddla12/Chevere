import { Pattern } from "@interfaces";

const commonRegexp = {
    $this: "^this\.data\.[a-zA-Z]+$",
    words: "[a-zA-Z]+",
};

export const Patterns: Pattern = {
    global: {
        getName: new RegExp(`^${commonRegexp.words}`),
        $data: new RegExp(commonRegexp.$this, "g"),
        arguments: /(?<=\().*(?=\))/,
    },
    variables: {
        equality: /(<|>|!)?={1,3}/g,
        value: /(?<=\=).*(?=\;)/g,
    },
    attr: {
        isMagic: /^(\$magics)/,
        isMethod: /^this\.methods\.[a-zA-Z]+\(/,
        isLogicalExpression: /^this\.data\.[a-zA-Z]+(\s)?(<|>|!|=)?=/,
        isVariableAssign: /^this\.data\.[a-zA-Z]+(\s)?(\?\?||\+|\-|\*|\/|\%|\*\*|<<?|>>(>)?|\|(\|)?||\&(\&)?|\^)?=/,
        isString: /^(\`).*\1$/,
        isObject: /^\{.*\}$/,
        isBoolean: /^(\!)?this\.data\.[a-zA-Z]+$/,
        methodSyntax: /(^\w+$)|(^\w+\((.*)?\)$)/,
        bindAndOn: /^(data-(on|bind):|@(on|bind))/,
        bind: /^(data-)/
    },
    bind: {
        string: /^(\`).*\1$/,
        object: /^\{.*\}$/,
        $this: /\$this\.data\.[a-zA-Z]+/g,
        attr: /^(@|data-)bind(:)?/,
        bindable: /(?<=^(@|data-)bind(:)?)\w+/,
        modifier: /(?<=\.).*/,
        variable: /(?<=\$this\.data\.)\w+/,
    }
};