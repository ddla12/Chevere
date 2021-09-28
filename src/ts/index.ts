import { ChevereWindow, ChevereNodeData, ChevereDataNode, ChevereNodeList } from "@interfaces";
import { ChevereData, ChevereInline, ChevereNode } from "@chevere";
import { Patterns } from "@helpers";

const Chevere: ChevereWindow = {
   nodes: [],
   /**
    * Find a ChevereData by the value of the 'data-attached' attribute
    * @param {string} attr
    * @param {ChevereData[]} data
    * @returns The data ready for instance a NodeListOf<Element>
    */
   findItsData(attr: string, ...data: ChevereData[]): ChevereData {
       let search: ChevereData | undefined = data.find((d) => d.name == attr.trim().replace(/\(.*/, ""));

        if(!search) 
            throw new ReferenceError(`'${attr}' couldn't be found in any of your declared components`);

       return search;
   },
   /**
    * Search for Chevere Nodes at the site
    * @param data All the Chevere components
    */
    start(...data: ChevereData[]): void {
        const elements: ChevereNodeList = ([...document.querySelectorAll("div[data-attached]")] as HTMLElement[])
            .map((element) => ({ el: element, attr: element.dataset.attached! }));

       //Create a ChevereNode for each data-attached
       elements.forEach(async(el: ChevereDataNode) => {
           const node: ChevereData = this.findItsData(el.attr, ...data);

            if(!Patterns.attr.methodSyntax.test(el.attr))
                throw new SyntaxError(`There are syntax error in the 'data-attached' attribute, unrecognized expression "${el.attr}"`);

            if((node.init == undefined) && (Patterns.global.arguments.test(el.attr)))
                throw new EvalError(`The ${node.name} components don't have an init() function, therefore they do not accept any parameters`)

            if(node.init != undefined) {
                await (async() => {
                    return (Patterns.global.arguments.test(el.attr))
                        ? node.initFunc(el.attr.match(Patterns.global.arguments)!.join(","))
                        : node.initFunc();
                })();
            }

            this.nodes.push(new ChevereNode(node, el.el));
       });

       this.nodes.push(...[...document.querySelectorAll("*[data-inline]")].map((e) => new ChevereInline(e as HTMLElement)));
   },
   data(data: ChevereNodeData): ChevereData {
       return new ChevereData(data);
   },
};

window.Chevere = Chevere;