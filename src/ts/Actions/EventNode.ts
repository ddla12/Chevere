import { EventChild, Args, ArgumentsObject, MethodData, MethodInfo } from "@interfaces";
import { ChevereNode } from "@chevere";
import { Helper, Magics, Parser, Patterns } from "@helpers";

export class EventNode implements EventChild {
    element: Element;
    parent: ChevereNode;
    method: MethodData;
    event: string;
    attrVal: string;

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
        this.method = this.getMethod();

        if(this.method.typeOfMethod == "magic") {
            this.element.addEventListener(
                this.event, 
                this.method.function.original.bind(this, ...this.method.args!.values())
            );
        }

        /*If everything is ok, then set the Event
        this.parent?.setEvent({
            elem: this.element,
            action: this.method!,
            type: this.event,
            args: this.args
        });*/
    }

    getMethod(): MethodData {
        let name: string = this.searchMethodName(),
            func: MethodInfo = this.searchMethod(name);
        
        return {
            typeOfMethod: func.typeOfMethod,
            name,
            function: {
                original: func.method,
            },
            args: this.searchArguments(func),
        };
    }

    searchMethodName(): string {
        let methodName: string = this.attrVal.match(Patterns.attr.methodName)![0];

        if(!methodName) 
            throw new Error(`Invalid method name at one of your "${this.parent.name}"" components`);

        return methodName;
    };

    searchArguments(func: MethodInfo): Args {
        let originalArgs = func.method.toString().trim().match(Patterns.attr.methodArgs),
            htmlArgs   = this.attrVal.trim().match(Patterns.attr.methodArgs);

        if((!originalArgs) && (!htmlArgs)) return;

        htmlArgs = Parser.parseArgs(htmlArgs![0].split(","), this.parent, func.typeOfMethod);

        return new Map([...originalArgs![0].split(",").map((v, i) => [v, htmlArgs[i]])]);
    }
    
    searchMethod(name: string): MethodInfo {
        let typeOfMethod: string = Patterns.attr.isMethod.test(this.attrVal.trim()) 
            ? "method" 
            : (Patterns.attr.isMagic.test(this.attrVal.trim()) ? "magic" : "");

        if(!typeOfMethod) throw new Error(`The value of the attribute contains invalid expressions`);
            
        let method: Function = ((typeOfMethod == "magic") ? Magics : this.parent.methods!)[name];

        if(!method) 
            throw new ReferenceError(`There's no a method named '${name}' in the ${(typeOfMethod == "magic") ? "Magics" : `${this.parent.name} component`}`);

        return {
            method,
            typeOfMethod
        };
    }
}