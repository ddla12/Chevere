import { InlineParser, ParsedFor, ParsedText, Attribute, ParsedShow } from "@interfaces";
import { Patterns } from "./Patterns";

export const Parser: InlineParser = {
    escape(str: string): string {
        return str.replaceAll("$", "\\$").replaceAll(".", "\\.");
    },
    parser(expr: any): any {
        return new Function(`return ${expr}`)();
    },
    parsedDataShowAttr(data: Attribute): ParsedShow {
        let val = (Patterns.vars.variableExpression.test(data.attr)) 
            ? data.attr.replace(Patterns.vars.value, "").trim()
            : Object.entries(Patterns.show).find(([, regexp]) => regexp.test(data.attr))![0];

        let parse = `${((Patterns.vars.equality.exec(data.attr)) || ["=="])[0]} ${val}`;

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
        let type = Object.keys(Patterns.text)
            .find((pattern) => Patterns.text[pattern].test(data.attr));

        if(!type) 
            throw new SyntaxError("The value of the 'data-text' attribute contains invalid expressions");
        
        const varName: string = Patterns.text.justVariable.exec(data.attr)![0];
        
        let parsed: ParsedText = { variable: data.node.data[varName] };

        switch(type) {
            case "justVariable" : {
                parsed.value = parsed.variable.value;
            } break;

            case "singleObject" : {
                parsed.value = parsed.variable.value[data.attr.match(Patterns.text.indexValue)![0]];
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