import ChevereNode from "../chevere/ChevereNode";
import { InlineParser, ParsedFor } from "../interfaces";

const Parser: InlineParser = {
    patterns: {
        variableExpression: /^\w+|\<\=|\>\=|\=|\<|\>|\![a-zA-z]+|[a-zA-Z]+/,
        forInExpression: /^\w+|(in)|\w+$/g,
    },
    parseDataForAttr(attr: string, node: ChevereNode): ParsedFor {
        let parsedData: ParsedFor = {};

        let expressions: string[] = attr.split(" ");

        if(expressions.length > 3) 
            throw new Error("The value of the 'data-for' attribute has invalid expressions");
        
        let variable = Object.keys(node.data).find((variable) => variable == expressions[2]);

        if(!variable) 
            throw new ReferenceError(`A variable with the name ${expressions[2]} couldn't be found in the data of your ${node.name}() component`);
        else parsedData.variable = node.data[variable];

        parsedData.count = node.data[variable].length || Object.keys(node.data[variable]).length;

        return parsedData;
    },
};

export default Parser;