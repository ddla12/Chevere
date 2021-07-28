import * as Interfaces from "../interfaces";

//#region parserData 
/**
 * Transform the value of the data-attached attribute into a JSON
 * @param {string} str - The text content of the data-attached attribute
 * @return An array of parsed objects, with the data
 */
export function parserData(str: string): ChevereObject[] {

    /**
     * Main pattern of the parser
     * @type {RegExp}
     */ 
    const pattern: RegExp = /(\w+:)|(\w+\s+:)/g;

    // If is empty the data-attached value
    if(str === "") {
        throw new SyntaxError("data-attached attribute cannot be null");
    }

    /**
     * The first parser, it returns a JSON format object, 
     * and transform any single quote into double quote
     * @type {string}
     */
    const parsedStr: string = str.replace(pattern, (matched) => {
        return `"${matched.substr(0, matched.length-1)}":`;
    }).replaceAll("'", "\"");
    
    /**
     * The last parser, it convert the value of `parsedStr` into a JSON
     * @type {object}
     */
    let sanitized: { [key: string]: any } = JSON.parse(parsedStr);
    
    /**
     * The array that will be mapped to obtain the variable name, it value, and it type
     *  @type {Data}
     */
    const data: Data = {
        values: Object.values(sanitized),
        variables: Object.keys(sanitized)
    };

    /**
     * The array with all the data of an ChevereElement
     * @type {ChevereObject[]}
     */
    const final: ChevereObject[] = data.variables.map((variable) => {

        //Check if the variable is of any of the allowed types
        if(!(typeof sanitized[variable] in ChevereTypes)) {
            throw new TypeError("Type not allowed, only values of type number, string or boolean");
        }

        //Return the object with the data
        return {
            name: variable,
            value: sanitized[variable],
            type: typeof sanitized[variable]
        };
    });

    return final;
};
//#endregion

/**
 * Parse the expression that is in the data-click attribute
 * @param {Element} el The button itself
 * @param {ChevereObject[]} data The data that are in the data-attached attribute
 * @param {string} id The id of the parent element, the one have the data-attached attribute
 * @returns An Action
 */
export function parseClick(el: Element, data: Interfaces.ChevereObject[], id: string): Interfaces.Action {

    /**
     * The regex patterns for the parser
     *  @type {Pattern}
     */
    const patterns: Pattern = {
        numeric: {
            base:/^[a-zA-Z]*(\+{2,2}|\-{2,2})$/,
            increment: /(\+{2,2})$/,
            decrement: /(\-{2,2})$/,
        },
        boolean: {
            base: /^!\w*$|^[a-zA-Z].*=(\s{1})(false|true)(?!\w)/,
            toggle: /^!/,
            assignToTrue: /\s=(\s{1})(true)(?!\w)$/,
            assignToFalse: /\s=(\s{1})(false)(?!\w)$/,
        }
    };

    //Get the value of the data-click attribute
    let attr: string = el.getAttribute("data-click")!; 

    //Set the Action var that will be returned
    let action: Action = {
        elem: el,
        type: "click",
    };

    //Check if is bool or num
    let parseBool:  boolean = (patterns.boolean.base.test(attr));
    let parseNum:   boolean = (patterns.numeric.base.test(attr));

    //If the expression is not allowed...
    if((!parseBool) && (!parseNum)) {
        throw new SyntaxError("Expression not allowed, check your data-click attribute");
    }

    //The data that will be parsed
    let parsed: ParsedData = {};

    //If is num, parse it to num expression
    if(parseNum) {
        parsed = tryToParse({
            patterns: patterns.numeric, 
            str: attr,
            type: "number"
        });
    }

    //If is num, parse it to bool expression
    if(parseBool) {
        parsed = tryToParse({
            patterns: patterns.boolean, 
            str: attr,
            type: "boolean"
        });
    }

    //Assign the parsed data to the Action object
    ({ action: action.action, name: action.variable } = parsed);

    //Check if the variable is at the data-attached attribute of the scope, and its of the same type...
    let check: ChevereObject|undefined = data.find((d) => {
        return ((d.name == action.variable) && (typeof d.value == parsed.type));
    });

    //If there aren't
    if(!check) throw new ReferenceError(`There are not ${action.variable} in the data-attached attribute of the scope`);

    //Get the elements that are relationed with the action that will be execute here
    let related: ListOfRelation = {
        text: setRelationsArray(document.querySelectorAll(
            `#${id} > [data-text=${action.variable}]`), 
            "text"),
        show: setRelationsArray(document.querySelectorAll(
            `#${id} > [data-show=${action.variable}]`), 
            "show")
    };

    //Set the relations
    action.relation = Array.prototype.concat(related.text, related.show);

    //Set the default value for the text-related elements
    if(related.text != undefined) setTextElements(related.text.map(el => el.element), check.value);

    //Set the click event
    setClick({
        el: el,
        action: action.action,
        data: check,
        nodes: action.relation
    });

    return action;
}

//#region Local Functions
/**
 * Parse the attribute value
 * @param {TryParse} parse The string, and the regex patterns
 * @returns Parsed Data
 */
 function tryToParse(parse: TryParse): ParsedData {

    /**
     * The array with the regex patterns taht will be use
     * @type {Patterns}
     */
    let patternsArr: Patterns = Object.entries(parse.patterns);

    //The first element is the base pattern, it isn't neccessary
    patternsArr.shift();

    let parsedData: ParsedData = {};

    //Try to parse the data with all of the options
    patternsArr.some((pattern) => {
        if(pattern[1].test(parse.str)) {
            parsedData.action   = pattern[0],
            parsedData.name     = parse.str.replace(pattern[1], ""),
            parsedData.type     = parse.type;
        }
    });

    //If the expression couldn't be parsed
    if(parsedData == {}) throw new SyntaxError("The expression couldn't be parsed, check the value of the data-click attribute");

    return parsedData;
}

/**
 * Set the array of relations that exists between an Action and many Elements
 * @param {NodeListOf<Element>} list Elements that will be mapped
 * @param {string} type The type of relation, "show" for example
 * @returns An array of related elements
 */
function setRelationsArray(list: NodeListOf<Element>, type: string): Relation[]|undefined {
    if(list) {
        return Array.from(list).map(el => {
            return {
                element: el,
                type: type
            }
        });
    } 
}
//#endregion