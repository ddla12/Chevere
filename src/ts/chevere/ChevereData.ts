import { ChevereNodeData, DataType, MethodType, ArgumentsObject, Init } from "../interfaces";
import { Helper } from "../utils/Helper";

/**
 *  The class that users create their components
 *  @class
 */
export default class ChevereData implements ChevereNodeData {
    name: string;
    data: DataType;
    init?: Function;
    methods?: MethodType;

    constructor(data: ChevereNodeData) {
        this.name = data.name;
        this.data = data.data;
        this.init = data.init;
        this.methods = data.methods;
    }

    /**
     * Parse the arguments of th init() method
     * @param {string[]} htmlArgs The arguments of de data-attached attribute
     * @param {string[]} initArgs The arguments defined in the init() method
     */
    parseArguments(htmlArgs: string[], methodArgs: string[]): void {

        //Get a valid value for the argument, for example, check for strings with unclosed quotes
        let final = Helper.getRealValuesInArguments({
            args: htmlArgs,
            name: this.name,
            method: "init()"
        });

        //Create the argument object
        let argsObj: ArgumentsObject = {};

        for(let i in methodArgs) argsObj[methodArgs[i]] = final[i];

        //...and pass it to the unparsed init function
        this.parseInit({
            init: this.init!,
            args: argsObj,
        });
    }

    /**
     * Parse the init function and executes it
     * @param {Function} init The unparsed init function
     * @param {object} args The parsed custom arguments
     * @returns the init function
     */
    parseInit(init: Init): Function {

        let initFunc: string = Helper.contentOfFunction(init.init);

        //Finds the real arguments and no expressions with the same name
        if (init.args) {
            Object.keys(init.args).forEach((arg) => {
                let str: string = `(?<=(=\\s)|(\\()|(=))(${arg})`;
                initFunc = initFunc.replace(new RegExp(str, "g"), `$args.${arg}`);
            });
        }

        
        //Create the new parsed init function
        let newFunc: Function = new Function(
            "{$this = undefined, $args = undefined}",
            initFunc,
        );

        //Return the new init function and executes it
        return newFunc({
            $this: this,
            $args: init.args,
        });
    }
}