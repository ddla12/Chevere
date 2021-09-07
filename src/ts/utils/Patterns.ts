import { Pattern } from "@interfaces";

export const Patterns: Pattern = {
    magics: {
        el: /\$el/,
        checkMagic: /^\$magics./,
    },
    vars: {
        variableExpression: /^[a-zA-Z]+(\s)?(<|>|!|=)?=/g,
        variableName: /^[a-zA-Z]+/,
        equality: /(<|>|!)?={1,3}/g,
        value: /^.*(<|>|=)/g,
    },
    text: {
        justVariable: /^[a-zA-Z]+$/,
        singleObject : /^[a-zA-Z]+((\.[a-zA-z]*)|(\[[0-9]{1,}\]))$/,
        nestedObject: /^[a-zA-Z]+((\.|\[)[a-zA-Z0-9]+(\.|\])?){1,}[a-zA-z]$/
    },
    show: {
        true: /^[a-zA-Z]+$/,
        false: /^\![a-zA-Z]+$/,
    },
    bind: {
        string: /^(\`).*\1$/,
        object: /^\{.*\}$/,
        $this: /\$this\.data\.[a-zA-Z]+/g,
        attr: /^(@|data-)bind(:)?/,
        bindable: /(?<=^(@|data-)bind(:)?)\w+/,
        modifier: /(?<=\.).*/,
    }
};