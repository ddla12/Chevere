import ChevereNode from "../chevere/ChevereNode";
import { InlineParser, ParsedFor, ParsedText } from "../interfaces";

const Parser: InlineParser = {
    patterns: {
        global: {
            variableExpression: /^\w+|\<\=|\>\=|\=|\<|\>|\![a-zA-z]+|[a-zA-Z]+/,
            variableName: /(\..*)|(\[.*)/,
            indexValue: /(\[{0}([0-9]+)\]{0})|(\.{0}\w+$)/g,
        },
        text: {
            justVariable: /^[a-zA-Z]+$/,
            singleObject : /^[a-zA-Z]+((\.[a-zA-z]*$)|(\[[0-9]{1,}\]$))/,
            nestedObject: /^[a-zA-Z]+((\.[a-zA-Z].+){1}|(\[.+\].+))/
        }
    },
    parseDataTextAttr(attr: string, node: ChevereNode): ParsedText {
        let type = Object.keys(this.patterns.text)
            .find((pattern) => this.patterns.text[pattern].test(attr));

        if(!type) 
            throw new SyntaxError("The value of the 'data-text' attribute contains invalid expressions");
        
        const varName: string = attr.replace(this.patterns.global.variableName, "");
        
        let data: ParsedText = { variable: node.data[varName] };

        switch(type) {
            case "justVariable" : {
                data.value = data.variable.value;
            } break;

            case "singleObject" : {
                data.value = data.variable.value[attr.match(this.patterns.global.indexValue)![0]];
            } break;

            case "nestedObject" : {
                let separed: string[] = attr.split(/\[|\]|\./g).filter(w => w !== "").slice(1),
                    length: number = separed.length;

                function findNestedProp(variable: { [prop: string]: any }, pos: number = 0): any {
                    let obj = variable[separed[pos]];
                    return (pos == length-1) ? obj : findNestedProp(obj, pos + 1);
                };

                data.value = findNestedProp(data.variable.value);
            } break;
        }

        return data;
    },
    parseDataForAttr(attr: string, node: ChevereNode): ParsedFor {
        let parsedData: ParsedFor = {};

        let expressions: string[] = attr.split(" ");

        if(expressions.length > 3) 
            throw new SyntaxError("The value of the 'data-for' attribute contains invalid expressions");
        
        parsedData.expressions = expressions;
        
        let variable = Object.keys(node.data).find((variable) => variable == expressions[2]);

        if(!variable) 
            throw new ReferenceError(`A variable with the name ${expressions[2]} couldn't be found in the data of your ${node.name}() component`);
        else parsedData.variable = node.data[variable];

        return parsedData;
    },
};

export default Parser;