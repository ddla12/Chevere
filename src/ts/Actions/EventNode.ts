import { EventChild, ParsedArgs, ArgumentsObject } from "../interfaces";
import ChevereNode from "../chevere/ChevereNode";
import { Helper } from "../utils/Helper";

export default class EventNode implements EventChild {
    element: Element;
    parent: ChevereNode;
    method?: Function;
    event: string;
    attrVal: string;
    args?: {};

    constructor(data: EventChild) {
        //Give it an ID for the element
        this.element = data.element;
        this.element.setAttribute("data-id", Helper.setDataId(10));

        //Get the type of event
        this.event = data.event;

        //The value of the attribure
        this.attrVal = data.attrVal;


        this.parent = data.parent;

        //Search method and check if it has arguments
        this.method = this.searchMethod();
        this.args = this.findArguments();

        //If everything is ok, then set the Event
        this.parent?.setEvent({
            elem: this.element,
            action: this.method!,
            type: this.event,
            args: this.args
        });
    }

    findArguments(): ArgumentsObject|undefined {
        let methodName: string = this.attrVal.replace(/\(.+/, "");

        if((!this.parent.args[methodName]) || (Helper.isEmpty(this.parent.args[methodName]!))) return;

        //The args
        let htmlArgs: ParsedArgs = Helper.htmlArgsDataAttr(this.attrVal),
            parentArgs: ParsedArgs = this.parent.args[methodName];

        //Check for errors in the argments
        Helper.compareArguments({
            method: methodName,
            component: this.parent.name,
            htmlArgs: htmlArgs,
            methodArgs: parentArgs,
        });

        let final = Helper.getRealValuesInArguments({
            args: htmlArgs as string[],
            name: this.parent.name,
            method: methodName
        });

        //Create the argument object
        let argsObj: ArgumentsObject = {};

        for(let i in parentArgs) argsObj[parentArgs[i]] = final[i];

        return argsObj;
    }
    
    searchMethod(): Function {
        let val: string = this.attrVal.replace(/\(.+/, "");

        let method: Function = this.parent.methods![val];

        if (!method) throw new ReferenceError(`There's no method ${val} in the data-attached scope`);

        return method;
    }
}