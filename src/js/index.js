"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChevereNode_1 = __importDefault(require("./chevere/ChevereNode"));
const ChevereData_1 = __importDefault(require("./chevere/ChevereData"));
const Helper_1 = require("./utils/Helper");
const Chevere = {
    nodes: [],
    /**
     * Find a ChevereData by the value of the 'data-attached' attribute
     * @param {string} attr
     * @param {ChevereData[]} data
     * @returns The data ready for instance a CheverexNode
     */
    findItsData(attr, data) {
        let search = data.find((d) => d.name == attr.replace(/\(.*\)/, ""));
        if (search == undefined)
            throw new ReferenceError(`'${attr}' couldn't be found in any of your declared components`);
        else
            return search;
    },
    /**
     * Search for Chevere Nodes at the site
     * @param data All the Chevere components
     */
    start(...data) {
        let [...props] = data;
        const elements = document.querySelectorAll("div[data-attached]");
        //Create a ChevereNode for each data-attached
        elements.forEach((el) => {
            let dataAttachedAttr = el.getAttribute("data-attached");
            const getData = this.findItsData(dataAttachedAttr, props);
            //If the init method isn't undefined
            if (getData.init != undefined) {
                //Check for arguments
                let initArgs = Helper_1.Helper.methodArguments(getData.init);
                let HTMLArgs = Helper_1.Helper.htmlArgsDataAttr(dataAttachedAttr);
                /**
                 * Check the diff between the aruments at the HTML and those ones declared at
                 * the init() method
                 */
                let checkForInitArguments = Helper_1.Helper.compareArguments({
                    component: getData.name,
                    method: "init()",
                    htmlArgs: HTMLArgs,
                    methodArgs: initArgs
                });
                //If there's no errors, parse the arguments, and execute the init() method
                if (checkForInitArguments)
                    getData.parseArguments(HTMLArgs, initArgs);
                else
                    getData.parseInit({
                        init: getData.init
                    });
            }
            ;
            let node = new ChevereNode_1.default(getData, el);
            this.nodes.push(node);
        });
    },
    data(data) {
        return new ChevereData_1.default(data);
    },
};
window.Chevere = Chevere;
//# sourceMappingURL=index.js.map