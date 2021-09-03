import { InlineParser, ParsedFor, ParsedText, Attribute, ParsedShow } from "@interfaces";

export const Parser: InlineParser = {
    patterns: {
        vars: {
            variableExpression: /^[a-zA-Z]+(\s|<|>|!)?=(\s)?/g,
            variableName: /^[a-zA-Z]+/,
            equality: /(<|>|!)?={1,3}/g,
            string: /^(\"|\')\w.+\1$/g,
            number: /^(\-)?[0-9]+(\.)?[0-9]+$/g,
            boolean: /true|false$/g,
            value: /^.*=/g,
        },
        text: {
            justVariable: /^[a-zA-Z]+$/,
            singleObject : /^[a-zA-Z]+((\.[a-zA-z]*)|(\[[0-9]{1,}\]))$/,
            nestedObject: /^[a-zA-Z]+((\.|\[)[a-zA-Z0-9]+(\.|\])?){1,}[a-zA-z]$/
        },
        show: {
            true: /^[a-zA-Z]+$/,
            false: /^\![a-zA-Z]+$/,
        }
    },
    parser(expr: any): any {
        return new Function(`return ${expr}`)();
    },
    parsedDataShowAttr(data: Attribute): ParsedShow {

        let val = (this.patterns.vars.variableExpression.test(data.attr)) 
            ? data.attr.replace(this.patterns.vars.value, "").trim()
            : Object.entries(this.patterns.show).find(([, regexp]) => regexp.test(data.attr))![0];

        let parse = `${((this.patterns.vars.equality.exec(data.attr)) || ["=="])[0]} ${val}`;

        if(!parse) 
            throw new SyntaxError("The value of the 'data-show' attribute contains invalid expressions");

        const varName: string = data.attr.match(/\w+/)![0],
            parentVar = data.node.data[varName];

        if(!parentVar)
            throw new ReferenceError(`A data with the '${varName}' couldn't be found in the '${data.node.name}'`);

        return {
            variable: parentVar, 
            value: parse,
        };
    },
    parseDataTextAttr(data: Attribute): ParsedText {
        let type = Object.keys(this.patterns.text)
            .find((pattern) => this.patterns.text[pattern].test(data.attr));

        if(!type) 
            throw new SyntaxError("The value of the 'data-text' attribute contains invalid expressions");
        
        const varName: string = this.patterns.text.justVariable.exec(data.attr)![0];
        
        let parsed: ParsedText = { variable: data.node.data[varName] };

        switch(type) {
            case "justVariable" : {
                parsed.value = parsed.variable.value;
            } break;

            case "singleObject" : {
                parsed.value = parsed.variable.value[data.attr.match(this.patterns.text.indexValue)![0]];
            } break;

            case "nestedObject" : {

                let separed: string[] = data.attr.split(/\[|\]|\.|\'/g).filter(w => w !== "").slice(1),
                    length: number = separed.length;

                function findNestedProp(variable: { [prop: string]: any }, pos: number = 0): any {
                    let obj = variable[separed[pos]];
                    return (pos == length-1) ? obj : findNestedProp(obj, pos + 1);
                };

                parsed.value = findNestedProp(parsed.variable.value);
            } break;
        }

        return parsed;
    },
    parseDataForAttr(data: Attribute): ParsedFor {
        let parsedData: ParsedFor = {};

        let expressions: string[] = data.attr.split(" ");

        if(expressions.length > 3) 
            throw new SyntaxError("The value of the 'data-for' attribute contains invalid expressions");
        
        parsedData.expressions = expressions;
        
        let variable = Object.keys(data.node.data).find((variable) => variable == expressions[2]);

        if(!variable) 
            throw new ReferenceError(`A variable with the name ${expressions[2]} couldn't be found in the data of your ${data.node.name}() component`);
        else parsedData.variable = data.node.data[variable];

        return parsedData;
    },
};