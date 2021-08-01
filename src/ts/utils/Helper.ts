import { ArgsErrors, CompareArguments, ParsedArgs } from "../interfaces";

/**
 * Helper class, it provide usefull methods to Chevere elements
 * @class
 */
export const Helper = {
    setDataId(length: number): string {
        let final: string = "";

        const rounded: Function = (num: number): number => Math.floor(Math.random() * num);

        const chars: { [type: string]: string } = {
            letters : "abcdefghijklmnopqrstuvwxyz",
            mayus   : "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            numbers : "0123456789",
        };

        for (let i = 0; i <= length; i++) {
            let rkey: string = Object.keys(chars)[rounded(2)];
            final += chars[rkey][rounded(length)];
        }

        return final;
    },
    checkForErrorInVariable(str: string): void {
        const pattern: RegExp = /^[0-9]|\s/g;

        if (pattern.test(str))
            throw new SyntaxError(
                "Variable name cannot start with a number or have spaces",
            );
    },
    htmlArgsDataAttr(dataAttached: string): ParsedArgs {
        let onlyAttrs: string = dataAttached.replace(/^(\w+\()|\)+$/g, "").replace(" ", "");

        return (onlyAttrs) ? onlyAttrs.split(",") : undefined;
    },
    methodArguments(method: Function): ParsedArgs {
        let onlyArgs: string = method.toString()
            .replace(/\{.*/gs, "")
            .replace(/\s/g, "")
            .replace(/^(\w+\()|\)+$/g, "");

        return (onlyArgs) ? onlyArgs.split(",") : undefined;            
    },
    getRealValuesInArguments(data: ArgsErrors): any[] {
        let final: any[] = data.args.map((arg) => {

            //Try get a valid value
            const func: Function = (): Function => new Function(`return ${arg}`);

            try {
                func()();
            } catch (error) {
                throw new Error(
                    `${error}, check the values of your ${data.method}, at one of your '${data.name}' components`,
                );
            }

            //Return the value
            return func()();
        });

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
            .replace(/(^\w.*\{)/gs, "")
            .replace(/\}$/, "")
            .trim();
    }
};
