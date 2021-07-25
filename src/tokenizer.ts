export interface Patterns {
    sanity  : RegExp,
    boolean : RegExp,
    string  : RegExp,
    number  : RegExp,
}

export const sanitizer = (str: string): [ string[], string ] => {
    if(str === null) {
        throw new Error("Es nulo el valor del atributo");
    }

    const patterns: Patterns = {
        sanity: /[()\s]/g,
        boolean: /true|false/g,
        string: /"[a-zA-z0-9]*"|'[a-zA-z0-9]*'/g,
        number: /[0-9]*/g
    };
      
    let type: string = "";
    let sanitized: string[] = str.replace(patterns.sanity, "").split(",");

    try {
        if(patterns.boolean.test(sanitized[1])) {
           type = "boolean";
        } else if(patterns.string.test(sanitized[1])) {
          type = "string";   
        } else if(patterns.number.test(sanitized[1])) {
           type = "number";
        } else {
           throw new Error("Ningun tipo compatible");
        }
    } catch(e) {
        console.log(e);
    }
      
    return [
        sanitized,
        type
    ];
};