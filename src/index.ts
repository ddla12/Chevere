import {
    ChevereWindow,
    ChevereNodeData,
    ChevereDataNode,
    ChevereNodeList,
} from "@types";
import { ChevereInline, ChevereAttached } from "@chevere";

/**
 *  The main Chevere object, it allows to create and start components
 */
const Chevere: ChevereWindow = {
    /**
     * Search for ChevereNodes at the DOM and execute their init functions
     * @param data All the ChevereData previously declared
     */
    search(...data: ChevereNodeData[]): void {
        const elements: ChevereNodeList = (
            [...document.querySelectorAll("*[data-attached]")] as HTMLElement[]
        ).map((element) => ({ el: element, attr: element.dataset.attached! }));

        //Create a ChevereAttached for each data-attached
        elements.forEach((el: ChevereDataNode) => {
            const Data: ChevereNodeData = (() => {
                let search = data.find((d) => d.name == el.attr.trim());

                if(!search)
                    throw new ReferenceError(
                        `'${search}' couldn't be found in any of your declared components`,
                    );

                return search;
            })();

            //Finally, instance a new ChevereAttached
            new ChevereAttached(Data, el.el);
        });

        this.searchInlines();
    },
    /**
     * Manually make ChevereNodes
     * @param data 
     * @param element 
     */
    make(data, ...element: HTMLElement[]): void {
        element.forEach((e) => new ChevereAttached(data, e));
    },
    /**
     * Search all 'data-inline' component
     */
    searchInlines(): void {
        //Inline components don't have an attached ChevereData, so, they can set their own data
        [...document.querySelectorAll("*[data-inline]")].forEach(
            (e) => new ChevereInline(e as HTMLElement),
        );
    }
};

//Set the property 'Chevere' to window
Object.defineProperty(window, "Chevere", { value: Chevere });

//Module
export default Chevere;