import { EventChild, ParsedArgs, ArgumentsObject, Arguments } from "@interfaces";
import { ChevereNode } from "@chevere";
import { Helper } from "@helpers";

export class EventNode implements EventChild {
    element: Element;
    parent: ChevereNode;
    method?: Function;
    event: string;
    attrVal: string;
    args?: {};

    constructor(data: EventChild) {
        ({
            element : this.element, 
            event   : this.event, 
            attrVal : this.attrVal, 
            parent  : this.parent
        } = data);
        
        //Give it an ID for the element
        this.element.setAttribute("data-id", Helper.setDataId(10));

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
        let methodName: string = this.attrVal.trim().replace(/\(.+/, "");

        if((!this.parent.args[methodName]) || (Helper.isEmpty(this.parent.args[methodName]!))) return;

        //The args
        const args: Arguments = {
            htmlArgs: Helper.htmlArgsDataAttr(this.attrVal),
            parentArgs: this.parent.args[methodName]
        };

        //Check for errors in the argments
        Helper.compareArguments({
            method: methodName,
            component: this.parent.name,
            htmlArgs: args.htmlArgs,
            methodArgs: args.parentArgs,
        });

        let final: any[] = Helper.getRealValuesInArguments({
            args: args.htmlArgs as string[],
            name: this.parent.name,
            method: methodName
        });

        //Create the argument object
        let argsObj: ArgumentsObject = {};

        for(let i in args.parentArgs) argsObj[args.parentArgs[+(i)]] = final[+(i)];

        return argsObj;
    }
    
    searchMethod(): Function {
        let val     : string = this.attrVal.trim().replace(/\(.+/, ""),
            method  : Function = this.parent.methods![val];

        if(!method) 
            throw new ReferenceError(`There's no a method named '${val}' in the data-attached scope`);

        return method;
    }
}