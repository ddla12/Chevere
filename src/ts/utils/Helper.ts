import { ArgsErrors, CompareArguments, ParsedArgs } from "@interfaces";
/**
 * Helper class, it provide usefull methods to Chevere elements
 * @class
 */
export const Helper = {
    isEmpty(obj: object) {
        return Object.keys(obj).length == 0;
    },
    setDataId(length: number): string {
        let final: string = "";

        const rounded: Function = (num: number): number => ~~(Math.random() * num);

        const chars: { [type: string]: string } = {
            letters : "abcdefghijklmnopqrstuvwxyz",
            mayus   : "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            numbers : "0123456789",
        };

        for (let i = 0; i <= length; i++) final += chars[Object.keys(chars)[rounded(2)]][rounded(length)];

        return final;
    },
    checkForErrorInVariable(str: string): void {
        if (/^[0-9]|\W/g.test(str))
            throw new SyntaxError(
                "Variable name cannot start with a number or have spaces",
            );
    },
    htmlArgsDataAttr(dataAttached: string): ParsedArgs {
        if(!dataAttached.match(/\(.+\)/g)) return;

        let onlyAttrs: string = dataAttached.trim().replace(/.*\(|\).*/g, "");

        return (onlyAttrs) ? onlyAttrs.split(",") : undefined;
    },
    methodArguments(method: Function): ParsedArgs {
        let onlyArgs: string = method.toString()
            .replace(/\{.*/gs, "")
            .replace(/.+\(|\).+/g, "");

        return (onlyArgs) ? onlyArgs.split(",") : undefined;            
    },
    getRealValuesInArguments(data: ArgsErrors): any[] {
        let final: any[] = [];
        
        try {
            final = data.args.map((arg) => new Function(`return ${arg}`)());
        } catch (error) {
            throw new Error(
                `${error}, check the values of your ${data.method}, at one of your '${data.name}' components`,
            );
        }

        return final;
    },
    compareArguments(data: CompareArguments): boolean {
        let errorPre: string = `The ${data.method} function of the ${data.component}() component `;        

        switch(true) {
            case ((!data.htmlArgs) && (!data.methodArgs)): {
                return false;
            };
            case ((data.htmlArgs != undefined) && (!data.methodArgs)): {
                throw new Error(errorPre + `doesn't receive any parameter`);
            };
            case ((!data.htmlArgs) && (data.methodArgs != undefined)): {
                throw new Error(errorPre + `needs to receive ${data.methodArgs} parameters, 0 passed`);
            };
            case ((data.methodArgs?.length) != (data.htmlArgs?.length)): {
                throw new Error(errorPre + `needs to receive  ${data.methodArgs?.length} parameters, 
                    ${data.htmlArgs?.length} passed`)
            };
            default: {
                return true;
            }
        }
    },
    contentOfFunction(func: Function): string {
        return func.toString()
            .replace(/.+\{|\}$/gs, "")
            .trim();
    },
    nameOfFunction(attr: string): string {
        return attr.trim().replace(/\(.+/,"");
    },
};
