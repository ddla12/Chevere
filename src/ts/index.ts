import { ChevereWindow, ChevereNodeData, CheverexNodeList, CheverexDataNode, Arguments } from "@interfaces";
import {ChevereNode, ChevereData} from "@chevere";
import { Helper } from "@helpers";

const Chevere: ChevereWindow = {
   nodes: [],
   /**
    * Find a ChevereData by the value of the 'data-attached' attribute
    * @param {string} attr
    * @param {ChevereData[]} data
    * @returns The data ready for instance a NodeListOf<Element>
    */
   findItsData(attr: string, data: ChevereData[]): ChevereData {
       let search: ChevereData | undefined = data.find((d) => d.name == attr.trim().replace(/\(.*\)/, ""));

        if(!search) 
            throw new ReferenceError(`'${attr}' couldn't be found in any of your declared components`);

       return search;
   },
   /**
    * Search for Chevere Nodes at the site
    * @param data All the Chevere components
    */
    start(...data: ChevereData[]): void {
        const elements: CheverexNodeList = [...document.querySelectorAll("div[data-attached]")]
            .map((element) => ({ elem: element, dataAttr: element.getAttribute("data-attached")}));

       //Create a ChevereNode for each data-attached
       elements.forEach((el: CheverexDataNode) => {
           const node: ChevereData = this.findItsData(el.dataAttr!, data);

           if((node.init == undefined) && (Helper.htmlArgsDataAttr(el.dataAttr!) != undefined))
                throw new Error(`There's no init method defined in your '${node.name}' component`);
                
           //If the init method isn't undefined
           if(node.init != undefined) {
                //Check for arguments
                let args: Arguments = {
                    initArgs: Helper.methodArguments(node.init),
                    HTMLArgs: Helper.htmlArgsDataAttr(el.dataAttr!)
                };

                /**
                * Check the diff between the aruments at the HTML and those ones declared at 
                * the init() method
                */
                let checkForInitArguments: boolean = Helper.compareArguments({
                    component: node.name,
                    method: "init()",
                    htmlArgs: args.HTMLArgs,
                    methodArgs: args.initArgs
                });

                (async() => {
                    //If there's no errors, parse the arguments, and execute the init() method
                    return (checkForInitArguments) 
                        ? await node.parseArguments(args.HTMLArgs!, args.initArgs!) 
                        : await node.parseInit({ init: node.init! });
                })();
            };

            this.nodes.push(new ChevereNode(node, el.elem));
       });
   },
   data(data: ChevereNodeData): ChevereData {
       return new ChevereData(data);
   },
};

window.Chevere = Chevere;