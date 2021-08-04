import { ChevereWindow, ParsedArgs, ChevereNodeData } from "@interfaces";
import {ChevereNode, ChevereData} from "@chevere";
import { Helper } from "@helpers";

const Chevere: ChevereWindow = {
   nodes: [],
   /**
    * Find a ChevereData by the value of the 'data-attached' attribute
    * @param {string} attr
    * @param {ChevereData[]} data
    * @returns The data ready for instance a CheverexNode
    */
   findItsData(attr: string, data: ChevereData[]): ChevereData {
       let search: ChevereData | undefined = data.find(
           (d) => d.name == attr.replace(/\(.*\)/, ""),
       );

       if (search == undefined)
           throw new ReferenceError(
               `'${attr}' couldn't be found in any of your declared components`,
           );
       else return search;
   },
   /**
    * Search for Chevere Nodes at the site
    * @param data All the Chevere components
    */
   start(...data: ChevereData[]): void {
       let [...props] = data;
       const elements: NodeListOf<Element> =
           document.querySelectorAll("div[data-attached]");

       //Create a ChevereNode for each data-attached
       elements.forEach((el) => {
           let dataAttachedAttr: string = el.getAttribute("data-attached")!;

           const getData: ChevereData = this.findItsData(dataAttachedAttr, props);

           if((getData.init == undefined) && (Helper.htmlArgsDataAttr(dataAttachedAttr) != undefined))
                throw new Error(`There's no init method defined in your '${getData.name}' component`);
                
           //If the init method isn't undefined
           if(getData.init != undefined) {
               //Check for arguments
               let initArgs: ParsedArgs = Helper.methodArguments(getData.init);
               let HTMLArgs: ParsedArgs = Helper.htmlArgsDataAttr(dataAttachedAttr);

               /**
                * Check the diff between the aruments at the HTML and those ones declared at 
                * the init() method
                */
               let checkForInitArguments: boolean = Helper.compareArguments({
                   component: getData.name,
                   method: "init()",
                   htmlArgs: HTMLArgs,
                   methodArgs: initArgs
               });

               //If there's no errors, parse the arguments, and execute the init() method
               if(checkForInitArguments) getData.parseArguments(HTMLArgs!, initArgs!);
               else getData.parseInit({
                   init: getData.init
               });
           };
       
           let node = new ChevereNode(getData, el);

           this.nodes.push(node);
       });
   },
   data(data: ChevereNodeData): ChevereData {
       return new ChevereData(data);
   },
};

window.Chevere = Chevere;