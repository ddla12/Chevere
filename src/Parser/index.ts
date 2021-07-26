import { setClick } from "../Actions/Index";
import { CheverexObject, CheverexTypes, Pattern, TryParse, Action } from "../interfaces";
import { setTextElements } from "../utils";
/**
 * Convierte el valor del atributo "data-attached" en una array de objetos
 * @param str string
 * @returns CheverexObject[]
 */
 export function parserData(str: string): CheverexObject[] {
    const pattern: RegExp = /(\w+:)|(\w+\s+:)/g;

    if(str === "") {
        throw new Error("Es nulo el valor del atributo");
    }

    const parsedStr: string = str.replace(pattern, (matched) => {
        return `"${matched.substr(0, matched.length-1)}":`;
    }).replaceAll("'", "\"");
    
    let sanitized: { [key: string]: any } = JSON.parse(parsedStr);
      
    const obj: string[][] = [
        Object.values(sanitized),
        Object.keys(sanitized)
    ];

    const final: CheverexObject[] = obj[1].map((key) => {

        if(!(typeof sanitized[key] in CheverexTypes)) {
            throw new Error("Tipo no permitido");
        }

        return {
            name: key,
            value: sanitized[key],
            type: typeof sanitized[key]
        };
    });

    return final;
};

export function parseClick(el: Element, data: CheverexObject[], id: string): Action {

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

    let attr: string = el.getAttribute("data-click")!; 

    let action: Action = {
        elem: el,
        type: "click",
    };

    let parseBool: boolean = (patterns.boolean.base.test(attr)), 
    parseNum: boolean = (patterns.numeric.base.test(attr))

    let parsed: string[] = [];

    if((!parseBool) && (!parseNum)) {
        throw new Error("Tipo de asignacion invalida para el tipo de variable");
    }

    if(parseNum) {
        parsed = tryToParse({
            patterns: patterns.numeric, 
            str: attr,
            type: "number"
        });
    }

    if(parseBool) {
        parsed = tryToParse({
            patterns: patterns.boolean, 
            str: attr,
            type: "boolean"
        });
    }

    [action.action, action.variable ] = parsed;

    let check: CheverexObject|undefined = data.find((d) => {
        return ((d.name == action.variable) && (typeof d.value == parsed[2]));
    });

    let related: NodeListOf<Element> = document.querySelectorAll(`#${id} > [data-text=${action.variable}]`);

    if(!check) throw new Error("No se encontro la propiedad o hay un operador invalido");

    action.relation = Array.from(related).map(el => {
        return {
            element: el,
            type: "text"
        }
    });

    let toText: Element[] = action.relation.map((rel) => rel.element);

    setTextElements(toText, check.value);
    setClick({
        el: el,
        action: action.action,
        data: check,
        nodes: action.relation
    });

    return action;
}

function tryToParse(parse: TryParse): string[] {
    let patternsArr: [string, RegExp][] = Object.entries(parse.patterns);
    patternsArr.shift();

    let arr: string[] = [];

    patternsArr.some((pattern) => {
        if(pattern[1].test(parse.str)) {
            arr[0] = pattern[0],
            arr[1] = parse.str.replace(pattern[1], ""),
            arr[2] = parse.type;
        }
    });

    if(arr == []) throw new Error("Verifica la expresion, ningun tipo compatible");

    return arr;
}