/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Actions/Index.ts":
/*!******************************!*\
  !*** ./src/Actions/Index.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setClick = void 0;
const utils_1 = __webpack_require__(/*! ../utils */ "./src/utils.ts");
function setClick(click) {
    click.el.addEventListener("click", () => {
        switch (click.data.type) {
            case "number":
                {
                    click.data.value = incOrDec(click.action, click.data.value);
                }
                break;
            case "boolean":
                {
                    click.data.value = toggleOrAssig(click.action, click.data.value);
                }
                break;
        }
        let textNodes = click.nodes.map((node) => node.element);
        utils_1.setTextElements(textNodes, click.data.value);
    });
}
exports.setClick = setClick;
function incOrDec(action, value) {
    switch (action) {
        case "increment":
            {
                value++;
            }
            break;
        case "decrement":
            {
                value--;
            }
            break;
    }
    ;
    return value;
}
function toggleOrAssig(action, value) {
    switch (action) {
        case "toggle":
            {
                value = !value;
            }
            break;
        case "assignToTrue":
            {
                value = true;
            }
            break;
        case "assignToFalse":
            {
                value = false;
            }
            break;
    }
    ;
    return value;
}
;


/***/ }),

/***/ "./src/Cheverex.ts":
/*!*************************!*\
  !*** ./src/Cheverex.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CheverexNode = void 0;
const Parsers = __importStar(__webpack_require__(/*! ./Parser */ "./src/Parser/index.ts"));
class CheverexNode {
    constructor(data, el) {
        this.id = this.setId(10);
        this.element = el;
        this.element.id = this.id;
        this.data = Parsers.parserData(data);
        this.actions = this.checkActions(this.element);
    }
    setId(length) {
        let final = "";
        const chars = {
            "letters": "abcdefghijklmnopqrstuvwxyz",
            "mayus": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "numbers": "0123456789"
        };
        for (let i = 0; i <= length; i++) {
            let rkey = Object.keys(chars)[Math.floor(Math.random() * 2)];
            final += chars[rkey][Math.floor(Math.random() * length)];
        }
        return final;
    }
    checkActions(el) {
        const selectors = [
            el.querySelectorAll(`#${this.id} > *[data-click]`),
        ];
        let clickedData = [];
        selectors[0].forEach((click) => {
            clickedData.push(Parsers.parseClick(click, this.data, this.id));
        });
        return clickedData;
    }
}
exports.CheverexNode = CheverexNode;
class CheverexData {
    constructor() {
        this.elements = [];
    }
}
const Cheverex = {
    start() {
        const elements = document.querySelectorAll("div[data-attached]");
        const cheverex = new CheverexData();
        elements.forEach(el => {
            const data = el.getAttribute("data-attached");
            cheverex.elements.push(new CheverexNode(data, el));
        });
        console.log(cheverex.elements);
    }
};
exports.default = Cheverex;


/***/ }),

/***/ "./src/Parser/index.ts":
/*!*****************************!*\
  !*** ./src/Parser/index.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseClick = exports.parserData = void 0;
const Index_1 = __webpack_require__(/*! ../Actions/Index */ "./src/Actions/Index.ts");
const interfaces_1 = __webpack_require__(/*! ../interfaces */ "./src/interfaces.ts");
const utils_1 = __webpack_require__(/*! ../utils */ "./src/utils.ts");
//#region parserData 
/**
 * Transform the value of the data-attached attribute into a JSON
 * @param {string} str - The text content of the data-attached attribute
 * @return An array of parsed objects, with the data
 */
function parserData(str) {
    /**
     * Main pattern of the parser
     * @type {RegExp}
     */
    const pattern = /(\w+:)|(\w+\s+:)/g;
    // If is empty the data-attached value
    if (str === "") {
        throw new SyntaxError("data-attached attribute cannot be null");
    }
    /**
     * The first parser, it returns a JSON format object,
     * and transform any single quote into double quote
     * @type {string}
     */
    const parsedStr = str.replace(pattern, (matched) => {
        return `"${matched.substr(0, matched.length - 1)}":`;
    }).replaceAll("'", "\"");
    /**
     * The last parser, it convert the value of `parsedStr` into a JSON
     * @type {object}
     */
    let sanitized = JSON.parse(parsedStr);
    /**
     * The array that will be mapped to obtain the variable name, it value, and it type
     *  @type {Data}
     */
    const data = {
        values: Object.values(sanitized),
        variables: Object.keys(sanitized)
    };
    /**
     * The array with all the data of an CheverexElement
     * @type {CheverexObject[]}
     */
    const final = data.variables.map((variable) => {
        //Check if the variable is of any of the allowed types
        if (!(typeof sanitized[variable] in interfaces_1.CheverexTypes)) {
            throw new TypeError("Type not allowed, only values of type number, string or boolean");
        }
        //Return the object with the data
        return {
            name: variable,
            value: sanitized[variable],
            type: typeof sanitized[variable]
        };
    });
    return final;
}
exports.parserData = parserData;
;
//#endregion
/**
 * Parse the expression that is in the data-click attribute
 * @param {Element} el The button itself
 * @param {CheverexObject[]} data The data that are in the data-attached attribute
 * @param {string} id The id of the parent element, the one have the data-attached attribute
 * @returns An Action
 */
function parseClick(el, data, id) {
    /**
     * The regex patterns for the parser
     *  @type {Pattern}
     */
    const patterns = {
        numeric: {
            base: /^[a-zA-Z]*(\+{2,2}|\-{2,2})$/,
            increment: /(\+{2,2})$/,
            decrement: /(\-{2,2})$/,
        },
        boolean: {
            base: /^!\w*$|^[a-zA-Z].*=(\s{1})(false|true)(?!\w)/,
            toggle: /^!/,
            assignToTrue: /\s=(\s{1})(true)(?!\w)$/,
            assignToFalse: /\s=(\s{1})(false)(?!\w)$/,
        }
    };
    //Get the value of the data-click attribute
    let attr = el.getAttribute("data-click");
    //Set the Action var that will be returned
    let action = {
        elem: el,
        type: "click",
    };
    //Check if is bool or num
    let parseBool = (patterns.boolean.base.test(attr));
    let parseNum = (patterns.numeric.base.test(attr));
    //If the expression is not allowed...
    if ((!parseBool) && (!parseNum)) {
        throw new SyntaxError("Expression not allowed, check your data-click attribute");
    }
    //The data that will be parsed
    let parsed = {};
    //If is num, parse it to num expression
    if (parseNum) {
        parsed = tryToParse({
            patterns: patterns.numeric,
            str: attr,
            type: "number"
        });
    }
    //If is num, parse it to bool expression
    if (parseBool) {
        parsed = tryToParse({
            patterns: patterns.boolean,
            str: attr,
            type: "boolean"
        });
    }
    //Assign the parsed data to the Action object
    ({ action: action.action, name: action.variable } = parsed);
    //Check if the variable is at the data-attached attribute of the scope, and its of the same type...
    let check = data.find((d) => {
        return ((d.name == action.variable) && (typeof d.value == parsed.type));
    });
    //If there aren't
    if (!check)
        throw new ReferenceError(`There are not ${action.variable} in the data-attached attribute of the scope`);
    //Get the elements that are relationed with the action that will be execute here
    let related = {
        text: setRelationsArray(document.querySelectorAll(`#${id} > [data-text=${action.variable}]`), "text"),
        show: setRelationsArray(document.querySelectorAll(`#${id} > [data-show=${action.variable}]`), "show")
    };
    //Set the relations
    action.relation = Array.prototype.concat(related.text, related.show);
    //Set the default value for the text-related elements
    if (related.text != undefined)
        utils_1.setTextElements(related.text.map(el => el.element), check.value);
    //Set the click event
    Index_1.setClick({
        el: el,
        action: action.action,
        data: check,
        nodes: action.relation
    });
    return action;
}
exports.parseClick = parseClick;
//#region Local Functions
/**
 * Parse the attribute value
 * @param {TryParse} parse The string, and the regex patterns
 * @returns Parsed Data
 */
function tryToParse(parse) {
    /**
     * The array with the regex patterns taht will be use
     * @type {Patterns}
     */
    let patternsArr = Object.entries(parse.patterns);
    //The first element is the base pattern, it isn't neccessary
    patternsArr.shift();
    let parsedData = {};
    //Try to parse the data with all of the options
    patternsArr.some((pattern) => {
        if (pattern[1].test(parse.str)) {
            parsedData.action = pattern[0],
                parsedData.name = parse.str.replace(pattern[1], ""),
                parsedData.type = parse.type;
        }
    });
    //If the expression couldn't be parsed
    if (parsedData == {})
        throw new SyntaxError("The expression couldn't be parsed, check the value of the data-click attribute");
    return parsedData;
}
/**
 * Set the array of relations that exists between an Action and many Elements
 * @param {NodeListOf<Element>} list Elements that will be mapped
 * @param {string} type The type of relation, "show" for example
 * @returns An array of related elements
 */
function setRelationsArray(list, type) {
    if (list) {
        return Array.from(list).map(el => {
            return {
                element: el,
                type: type
            };
        });
    }
}
//#endregion


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Cheverex_1 = __importDefault(__webpack_require__(/*! ./Cheverex */ "./src/Cheverex.ts"));
window.addEventListener("load", () => {
    Cheverex_1.default.start();
});


/***/ }),

/***/ "./src/interfaces.ts":
/*!***************************!*\
  !*** ./src/interfaces.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CheverexTypes = void 0;
//#endregion
//#region Enums
var CheverexTypes;
(function (CheverexTypes) {
    CheverexTypes[CheverexTypes["boolean"] = 0] = "boolean";
    CheverexTypes[CheverexTypes["number"] = 1] = "number";
    CheverexTypes[CheverexTypes["string"] = 2] = "string";
})(CheverexTypes = exports.CheverexTypes || (exports.CheverexTypes = {}));
;
;
;
;
;
;
;
;
;
;
;
;
//#endregion


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setTextElements = void 0;
/**
 * Set the text of a group of elements
 * @param {Element[]} el The elements that will be affected
 * @param {Types} val The string that will be assigned to those elements
 */
function setTextElements(el, val) {
    el.forEach((element) => {
        element.textContent = val.toString();
    });
}
exports.setTextElements = setTextElements;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGV2ZXJleC8uL3NyYy9BY3Rpb25zL0luZGV4LnRzIiwid2VicGFjazovL2NoZXZlcmV4Ly4vc3JjL0NoZXZlcmV4LnRzIiwid2VicGFjazovL2NoZXZlcmV4Ly4vc3JjL1BhcnNlci9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJleC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJleC8uL3NyYy9pbnRlcmZhY2VzLnRzIiwid2VicGFjazovL2NoZXZlcmV4Ly4vc3JjL3V0aWxzLnRzIiwid2VicGFjazovL2NoZXZlcmV4L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NoZXZlcmV4L3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQ0Esc0VBQTJDO0FBRTNDLFNBQWdCLFFBQVEsQ0FBQyxLQUFpQjtJQUN0QyxLQUFLLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDcEMsUUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNwQixLQUFLLFFBQVE7Z0JBQUU7b0JBQ1gsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFlLENBQUM7aUJBQ3pFO2dCQUFDLE1BQU07WUFFUixLQUFLLFNBQVM7Z0JBQUc7b0JBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFnQixDQUFDLENBQUM7aUJBQ2hGO2dCQUFDLE1BQU07U0FDWDtRQUVELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFD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O0FBQ1AsQ0FBQztBQUpELDBDQUlDOzs7Ozs7O1VDWEQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVQ3RCQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbGlja0V2ZW50IH0gZnJvbSBcIi4uL2ludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgc2V0VGV4dEVsZW1lbnRzIH0gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2xpY2soY2xpY2s6IENsaWNrRXZlbnQpOiB2b2lkIHtcclxuICAgIGNsaWNrLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgc3dpdGNoKGNsaWNrLmRhdGEudHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6IHtcclxuICAgICAgICAgICAgICAgIGNsaWNrLmRhdGEudmFsdWUgPSBpbmNPckRlYyhjbGljay5hY3Rpb24hLCBjbGljay5kYXRhLnZhbHVlIGFzIG51bWJlcilcclxuICAgICAgICAgICAgfSBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJib29sZWFuXCIgOiB7XHJcbiAgICAgICAgICAgICAgICBjbGljay5kYXRhLnZhbHVlID0gdG9nZ2xlT3JBc3NpZyhjbGljay5hY3Rpb24hLCBjbGljay5kYXRhLnZhbHVlIGFzIGJvb2xlYW4pO1xyXG4gICAgICAgICAgICB9IGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRleHROb2RlcyA9IGNsaWNrLm5vZGVzLm1hcCgobm9kZSkgPT4gbm9kZS5lbGVtZW50KTtcclxuICAgICAgICBzZXRUZXh0RWxlbWVudHModGV4dE5vZGVzLCBjbGljay5kYXRhLnZhbHVlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbmNPckRlYyhhY3Rpb246IHN0cmluZywgdmFsdWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSBcImluY3JlbWVudFwiOiB7XHJcbiAgICAgICAgICAgIHZhbHVlKys7XHJcbiAgICAgICAgfSBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImRlY3JlbWVudFwiOiB7XHJcbiAgICAgICAgICAgIHZhbHVlLS07XHJcbiAgICAgICAgfSBicmVhaztcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0b2dnbGVPckFzc2lnKGFjdGlvbjogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbik6IGJvb2xlYW4ge1xyXG4gICAgc3dpdGNoKGFjdGlvbikge1xyXG4gICAgICAgIGNhc2UgXCJ0b2dnbGVcIjoge1xyXG4gICAgICAgICAgICB2YWx1ZSA9ICF2YWx1ZTtcclxuICAgICAgICB9IGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiYXNzaWduVG9UcnVlXCI6IHtcclxuICAgICAgICAgICAgdmFsdWUgPSB0cnVlO1xyXG4gICAgICAgIH0gYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJhc3NpZ25Ub0ZhbHNlXCI6IHtcclxuICAgICAgICAgICAgdmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB9IGJyZWFrO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn07IiwiaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgKiBhcyBQYXJzZXJzIGZyb20gXCIuL1BhcnNlclwiO1xyXG5pbXBvcnQgeyBDaGV2ZXJleEVsZW1lbnQsIENoZXZlcmV4T2JqZWN0IH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENoZXZlcmV4Tm9kZSBpbXBsZW1lbnRzIENoZXZlcmV4RWxlbWVudCB7XHJcbiAgICBkYXRhOiBDaGV2ZXJleE9iamVjdFtdO1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGFjdGlvbnM/OiBBY3Rpb25bXTtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogc3RyaW5nLCBlbDogRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLnNldElkKDEwKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWw7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmlkID0gdGhpcy5pZDtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhID0gUGFyc2Vycy5wYXJzZXJEYXRhKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IHRoaXMuY2hlY2tBY3Rpb25zKHRoaXMuZWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBmaW5hbDogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgY29uc3QgY2hhcnM6IHsgW3R5cGU6IHN0cmluZ106IHN0cmluZyAgfSA9IHtcclxuICAgICAgICAgICAgXCJsZXR0ZXJzXCI6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcclxuICAgICAgICAgICAgXCJtYXl1c1wiOiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXHJcbiAgICAgICAgICAgIFwibnVtYmVyc1wiOiBcIjAxMjM0NTY3ODlcIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHJrZXk6IHN0cmluZyA9IE9iamVjdC5rZXlzKGNoYXJzKVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XHJcbiAgICAgICAgICAgIGZpbmFsICs9IGNoYXJzW3JrZXldW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbmd0aCldXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tBY3Rpb25zKGVsOiBFbGVtZW50KTogQWN0aW9uW10ge1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yczogTm9kZUxpc3RPZjxFbGVtZW50PltdID0gW1xyXG4gICAgICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKGAjJHt0aGlzLmlkfSA+ICpbZGF0YS1jbGlja11gKSxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBsZXQgY2xpY2tlZERhdGE6IEFjdGlvbltdID0gW107XHJcblxyXG4gICAgICAgIHNlbGVjdG9yc1swXS5mb3JFYWNoKChjbGljaykgPT4ge1xyXG4gICAgICAgICAgICBjbGlja2VkRGF0YS5wdXNoKFxyXG4gICAgICAgICAgICAgICAgUGFyc2Vycy5wYXJzZUNsaWNrKGNsaWNrLCB0aGlzLmRhdGEsIHRoaXMuaWQpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjbGlja2VkRGF0YTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgQ2hldmVyZXhEYXRhIHtcclxuICAgIGVsZW1lbnRzOiBDaGV2ZXJleEVsZW1lbnRbXSA9IFtdO1xyXG59XHJcblxyXG5jb25zdCBDaGV2ZXJleDogeyBzdGFydCgpOiB2b2lkIH0gPSB7XHJcbiAgICBzdGFydCgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZbZGF0YS1hdHRhY2hlZF1cIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGNoZXZlcmV4ID0gbmV3IENoZXZlcmV4RGF0YSgpO1xyXG5cclxuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZGF0YTogc3RyaW5nID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1hdHRhY2hlZFwiKSE7XHJcbiAgICAgICAgICAgIGNoZXZlcmV4LmVsZW1lbnRzLnB1c2gobmV3IENoZXZlcmV4Tm9kZShkYXRhLCBlbCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coY2hldmVyZXguZWxlbWVudHMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2hldmVyZXg7IiwiaW1wb3J0IHsgc2V0Q2xpY2sgfSBmcm9tIFwiLi4vQWN0aW9ucy9JbmRleFwiO1xyXG5pbXBvcnQgeyBDaGV2ZXJleE9iamVjdCwgQ2hldmVyZXhUeXBlcywgUGF0dGVybiwgVHJ5UGFyc2UsIEFjdGlvbiwgRGF0YSwgUGFyc2VkRGF0YSwgUGF0dGVybnMsIExpc3RPZlJlbGF0aW9uLCBSZWxhdGlvbiB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IHNldFRleHRFbGVtZW50cyB9IGZyb20gXCIuLi91dGlsc1wiO1xyXG5cclxuLy8jcmVnaW9uIHBhcnNlckRhdGEgXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm0gdGhlIHZhbHVlIG9mIHRoZSBkYXRhLWF0dGFjaGVkIGF0dHJpYnV0ZSBpbnRvIGEgSlNPTlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIC0gVGhlIHRleHQgY29udGVudCBvZiB0aGUgZGF0YS1hdHRhY2hlZCBhdHRyaWJ1dGVcclxuICogQHJldHVybiBBbiBhcnJheSBvZiBwYXJzZWQgb2JqZWN0cywgd2l0aCB0aGUgZGF0YVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlckRhdGEoc3RyOiBzdHJpbmcpOiBDaGV2ZXJleE9iamVjdFtdIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE1haW4gcGF0dGVybiBvZiB0aGUgcGFyc2VyXHJcbiAgICAgKiBAdHlwZSB7UmVnRXhwfVxyXG4gICAgICovIFxyXG4gICAgY29uc3QgcGF0dGVybjogUmVnRXhwID0gLyhcXHcrOil8KFxcdytcXHMrOikvZztcclxuXHJcbiAgICAvLyBJZiBpcyBlbXB0eSB0aGUgZGF0YS1hdHRhY2hlZCB2YWx1ZVxyXG4gICAgaWYoc3RyID09PSBcIlwiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiZGF0YS1hdHRhY2hlZCBhdHRyaWJ1dGUgY2Fubm90IGJlIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZmlyc3QgcGFyc2VyLCBpdCByZXR1cm5zIGEgSlNPTiBmb3JtYXQgb2JqZWN0LCBcclxuICAgICAqIGFuZCB0cmFuc2Zvcm0gYW55IHNpbmdsZSBxdW90ZSBpbnRvIGRvdWJsZSBxdW90ZVxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgY29uc3QgcGFyc2VkU3RyOiBzdHJpbmcgPSBzdHIucmVwbGFjZShwYXR0ZXJuLCAobWF0Y2hlZCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBgXCIke21hdGNoZWQuc3Vic3RyKDAsIG1hdGNoZWQubGVuZ3RoLTEpfVwiOmA7XHJcbiAgICB9KS5yZXBsYWNlQWxsKFwiJ1wiLCBcIlxcXCJcIik7XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxhc3QgcGFyc2VyLCBpdCBjb252ZXJ0IHRoZSB2YWx1ZSBvZiBgcGFyc2VkU3RyYCBpbnRvIGEgSlNPTlxyXG4gICAgICogQHR5cGUge29iamVjdH1cclxuICAgICAqL1xyXG4gICAgbGV0IHNhbml0aXplZDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IEpTT04ucGFyc2UocGFyc2VkU3RyKTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYXJyYXkgdGhhdCB3aWxsIGJlIG1hcHBlZCB0byBvYnRhaW4gdGhlIHZhcmlhYmxlIG5hbWUsIGl0IHZhbHVlLCBhbmQgaXQgdHlwZVxyXG4gICAgICogIEB0eXBlIHtEYXRhfVxyXG4gICAgICovXHJcbiAgICBjb25zdCBkYXRhOiBEYXRhID0ge1xyXG4gICAgICAgIHZhbHVlczogT2JqZWN0LnZhbHVlcyhzYW5pdGl6ZWQpLFxyXG4gICAgICAgIHZhcmlhYmxlczogT2JqZWN0LmtleXMoc2FuaXRpemVkKVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBhcnJheSB3aXRoIGFsbCB0aGUgZGF0YSBvZiBhbiBDaGV2ZXJleEVsZW1lbnRcclxuICAgICAqIEB0eXBlIHtDaGV2ZXJleE9iamVjdFtdfVxyXG4gICAgICovXHJcbiAgICBjb25zdCBmaW5hbDogQ2hldmVyZXhPYmplY3RbXSA9IGRhdGEudmFyaWFibGVzLm1hcCgodmFyaWFibGUpID0+IHtcclxuXHJcbiAgICAgICAgLy9DaGVjayBpZiB0aGUgdmFyaWFibGUgaXMgb2YgYW55IG9mIHRoZSBhbGxvd2VkIHR5cGVzXHJcbiAgICAgICAgaWYoISh0eXBlb2Ygc2FuaXRpemVkW3ZhcmlhYmxlXSBpbiBDaGV2ZXJleFR5cGVzKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVHlwZSBub3QgYWxsb3dlZCwgb25seSB2YWx1ZXMgb2YgdHlwZSBudW1iZXIsIHN0cmluZyBvciBib29sZWFuXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9SZXR1cm4gdGhlIG9iamVjdCB3aXRoIHRoZSBkYXRhXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmFtZTogdmFyaWFibGUsXHJcbiAgICAgICAgICAgIHZhbHVlOiBzYW5pdGl6ZWRbdmFyaWFibGVdLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlb2Ygc2FuaXRpemVkW3ZhcmlhYmxlXVxyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZmluYWw7XHJcbn07XHJcbi8vI2VuZHJlZ2lvblxyXG5cclxuLyoqXHJcbiAqIFBhcnNlIHRoZSBleHByZXNzaW9uIHRoYXQgaXMgaW4gdGhlIGRhdGEtY2xpY2sgYXR0cmlidXRlXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWwgVGhlIGJ1dHRvbiBpdHNlbGZcclxuICogQHBhcmFtIHtDaGV2ZXJleE9iamVjdFtdfSBkYXRhIFRoZSBkYXRhIHRoYXQgYXJlIGluIHRoZSBkYXRhLWF0dGFjaGVkIGF0dHJpYnV0ZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgVGhlIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudCwgdGhlIG9uZSBoYXZlIHRoZSBkYXRhLWF0dGFjaGVkIGF0dHJpYnV0ZVxyXG4gKiBAcmV0dXJucyBBbiBBY3Rpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNsaWNrKGVsOiBFbGVtZW50LCBkYXRhOiBDaGV2ZXJleE9iamVjdFtdLCBpZDogc3RyaW5nKTogQWN0aW9uIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSByZWdleCBwYXR0ZXJucyBmb3IgdGhlIHBhcnNlclxyXG4gICAgICogIEB0eXBlIHtQYXR0ZXJufVxyXG4gICAgICovXHJcbiAgICBjb25zdCBwYXR0ZXJuczogUGF0dGVybiA9IHtcclxuICAgICAgICBudW1lcmljOiB7XHJcbiAgICAgICAgICAgIGJhc2U6L15bYS16QS1aXSooXFwrezIsMn18XFwtezIsMn0pJC8sXHJcbiAgICAgICAgICAgIGluY3JlbWVudDogLyhcXCt7MiwyfSkkLyxcclxuICAgICAgICAgICAgZGVjcmVtZW50OiAvKFxcLXsyLDJ9KSQvLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9vbGVhbjoge1xyXG4gICAgICAgICAgICBiYXNlOiAvXiFcXHcqJHxeW2EtekEtWl0uKj0oXFxzezF9KShmYWxzZXx0cnVlKSg/IVxcdykvLFxyXG4gICAgICAgICAgICB0b2dnbGU6IC9eIS8sXHJcbiAgICAgICAgICAgIGFzc2lnblRvVHJ1ZTogL1xccz0oXFxzezF9KSh0cnVlKSg/IVxcdykkLyxcclxuICAgICAgICAgICAgYXNzaWduVG9GYWxzZTogL1xccz0oXFxzezF9KShmYWxzZSkoPyFcXHcpJC8sXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL0dldCB0aGUgdmFsdWUgb2YgdGhlIGRhdGEtY2xpY2sgYXR0cmlidXRlXHJcbiAgICBsZXQgYXR0cjogc3RyaW5nID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1jbGlja1wiKSE7IFxyXG5cclxuICAgIC8vU2V0IHRoZSBBY3Rpb24gdmFyIHRoYXQgd2lsbCBiZSByZXR1cm5lZFxyXG4gICAgbGV0IGFjdGlvbjogQWN0aW9uID0ge1xyXG4gICAgICAgIGVsZW06IGVsLFxyXG4gICAgICAgIHR5cGU6IFwiY2xpY2tcIixcclxuICAgIH07XHJcblxyXG4gICAgLy9DaGVjayBpZiBpcyBib29sIG9yIG51bVxyXG4gICAgbGV0IHBhcnNlQm9vbDogIGJvb2xlYW4gPSAocGF0dGVybnMuYm9vbGVhbi5iYXNlLnRlc3QoYXR0cikpO1xyXG4gICAgbGV0IHBhcnNlTnVtOiAgIGJvb2xlYW4gPSAocGF0dGVybnMubnVtZXJpYy5iYXNlLnRlc3QoYXR0cikpO1xyXG5cclxuICAgIC8vSWYgdGhlIGV4cHJlc3Npb24gaXMgbm90IGFsbG93ZWQuLi5cclxuICAgIGlmKCghcGFyc2VCb29sKSAmJiAoIXBhcnNlTnVtKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIkV4cHJlc3Npb24gbm90IGFsbG93ZWQsIGNoZWNrIHlvdXIgZGF0YS1jbGljayBhdHRyaWJ1dGVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy9UaGUgZGF0YSB0aGF0IHdpbGwgYmUgcGFyc2VkXHJcbiAgICBsZXQgcGFyc2VkOiBQYXJzZWREYXRhID0ge307XHJcblxyXG4gICAgLy9JZiBpcyBudW0sIHBhcnNlIGl0IHRvIG51bSBleHByZXNzaW9uXHJcbiAgICBpZihwYXJzZU51bSkge1xyXG4gICAgICAgIHBhcnNlZCA9IHRyeVRvUGFyc2Uoe1xyXG4gICAgICAgICAgICBwYXR0ZXJuczogcGF0dGVybnMubnVtZXJpYywgXHJcbiAgICAgICAgICAgIHN0cjogYXR0cixcclxuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vSWYgaXMgbnVtLCBwYXJzZSBpdCB0byBib29sIGV4cHJlc3Npb25cclxuICAgIGlmKHBhcnNlQm9vbCkge1xyXG4gICAgICAgIHBhcnNlZCA9IHRyeVRvUGFyc2Uoe1xyXG4gICAgICAgICAgICBwYXR0ZXJuczogcGF0dGVybnMuYm9vbGVhbiwgXHJcbiAgICAgICAgICAgIHN0cjogYXR0cixcclxuICAgICAgICAgICAgdHlwZTogXCJib29sZWFuXCJcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvL0Fzc2lnbiB0aGUgcGFyc2VkIGRhdGEgdG8gdGhlIEFjdGlvbiBvYmplY3RcclxuICAgICh7IGFjdGlvbjogYWN0aW9uLmFjdGlvbiwgbmFtZTogYWN0aW9uLnZhcmlhYmxlIH0gPSBwYXJzZWQpO1xyXG5cclxuICAgIC8vQ2hlY2sgaWYgdGhlIHZhcmlhYmxlIGlzIGF0IHRoZSBkYXRhLWF0dGFjaGVkIGF0dHJpYnV0ZSBvZiB0aGUgc2NvcGUsIGFuZCBpdHMgb2YgdGhlIHNhbWUgdHlwZS4uLlxyXG4gICAgbGV0IGNoZWNrOiBDaGV2ZXJleE9iamVjdHx1bmRlZmluZWQgPSBkYXRhLmZpbmQoKGQpID0+IHtcclxuICAgICAgICByZXR1cm4gKChkLm5hbWUgPT0gYWN0aW9uLnZhcmlhYmxlKSAmJiAodHlwZW9mIGQudmFsdWUgPT0gcGFyc2VkLnR5cGUpKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vSWYgdGhlcmUgYXJlbid0XHJcbiAgICBpZighY2hlY2spIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgVGhlcmUgYXJlIG5vdCAke2FjdGlvbi52YXJpYWJsZX0gaW4gdGhlIGRhdGEtYXR0YWNoZWQgYXR0cmlidXRlIG9mIHRoZSBzY29wZWApO1xyXG5cclxuICAgIC8vR2V0IHRoZSBlbGVtZW50cyB0aGF0IGFyZSByZWxhdGlvbmVkIHdpdGggdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZSBoZXJlXHJcbiAgICBsZXQgcmVsYXRlZDogTGlzdE9mUmVsYXRpb24gPSB7XHJcbiAgICAgICAgdGV4dDogc2V0UmVsYXRpb25zQXJyYXkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgYCMke2lkfSA+IFtkYXRhLXRleHQ9JHthY3Rpb24udmFyaWFibGV9XWApLCBcclxuICAgICAgICAgICAgXCJ0ZXh0XCIpLFxyXG4gICAgICAgIHNob3c6IHNldFJlbGF0aW9uc0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgIGAjJHtpZH0gPiBbZGF0YS1zaG93PSR7YWN0aW9uLnZhcmlhYmxlfV1gKSwgXHJcbiAgICAgICAgICAgIFwic2hvd1wiKVxyXG4gICAgfTtcclxuXHJcbiAgICAvL1NldCB0aGUgcmVsYXRpb25zXHJcbiAgICBhY3Rpb24ucmVsYXRpb24gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KHJlbGF0ZWQudGV4dCwgcmVsYXRlZC5zaG93KTtcclxuXHJcbiAgICAvL1NldCB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhlIHRleHQtcmVsYXRlZCBlbGVtZW50c1xyXG4gICAgaWYocmVsYXRlZC50ZXh0ICE9IHVuZGVmaW5lZCkgc2V0VGV4dEVsZW1lbnRzKHJlbGF0ZWQudGV4dC5tYXAoZWwgPT4gZWwuZWxlbWVudCksIGNoZWNrLnZhbHVlKTtcclxuXHJcbiAgICAvL1NldCB0aGUgY2xpY2sgZXZlbnRcclxuICAgIHNldENsaWNrKHtcclxuICAgICAgICBlbDogZWwsXHJcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24uYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGNoZWNrLFxyXG4gICAgICAgIG5vZGVzOiBhY3Rpb24ucmVsYXRpb25cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBhY3Rpb247XHJcbn1cclxuXHJcbi8vI3JlZ2lvbiBMb2NhbCBGdW5jdGlvbnNcclxuLyoqXHJcbiAqIFBhcnNlIHRoZSBhdHRyaWJ1dGUgdmFsdWVcclxuICogQHBhcmFtIHtUcnlQYXJzZX0gcGFyc2UgVGhlIHN0cmluZywgYW5kIHRoZSByZWdleCBwYXR0ZXJuc1xyXG4gKiBAcmV0dXJucyBQYXJzZWQgRGF0YVxyXG4gKi9cclxuIGZ1bmN0aW9uIHRyeVRvUGFyc2UocGFyc2U6IFRyeVBhcnNlKTogUGFyc2VkRGF0YSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYXJyYXkgd2l0aCB0aGUgcmVnZXggcGF0dGVybnMgdGFodCB3aWxsIGJlIHVzZVxyXG4gICAgICogQHR5cGUge1BhdHRlcm5zfVxyXG4gICAgICovXHJcbiAgICBsZXQgcGF0dGVybnNBcnI6IFBhdHRlcm5zID0gT2JqZWN0LmVudHJpZXMocGFyc2UucGF0dGVybnMpO1xyXG5cclxuICAgIC8vVGhlIGZpcnN0IGVsZW1lbnQgaXMgdGhlIGJhc2UgcGF0dGVybiwgaXQgaXNuJ3QgbmVjY2Vzc2FyeVxyXG4gICAgcGF0dGVybnNBcnIuc2hpZnQoKTtcclxuXHJcbiAgICBsZXQgcGFyc2VkRGF0YTogUGFyc2VkRGF0YSA9IHt9O1xyXG5cclxuICAgIC8vVHJ5IHRvIHBhcnNlIHRoZSBkYXRhIHdpdGggYWxsIG9mIHRoZSBvcHRpb25zXHJcbiAgICBwYXR0ZXJuc0Fyci5zb21lKChwYXR0ZXJuKSA9PiB7XHJcbiAgICAgICAgaWYocGF0dGVyblsxXS50ZXN0KHBhcnNlLnN0cikpIHtcclxuICAgICAgICAgICAgcGFyc2VkRGF0YS5hY3Rpb24gICA9IHBhdHRlcm5bMF0sXHJcbiAgICAgICAgICAgIHBhcnNlZERhdGEubmFtZSAgICAgPSBwYXJzZS5zdHIucmVwbGFjZShwYXR0ZXJuWzFdLCBcIlwiKSxcclxuICAgICAgICAgICAgcGFyc2VkRGF0YS50eXBlICAgICA9IHBhcnNlLnR5cGU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy9JZiB0aGUgZXhwcmVzc2lvbiBjb3VsZG4ndCBiZSBwYXJzZWRcclxuICAgIGlmKHBhcnNlZERhdGEgPT0ge30pIHRocm93IG5ldyBTeW50YXhFcnJvcihcIlRoZSBleHByZXNzaW9uIGNvdWxkbid0IGJlIHBhcnNlZCwgY2hlY2sgdGhlIHZhbHVlIG9mIHRoZSBkYXRhLWNsaWNrIGF0dHJpYnV0ZVwiKTtcclxuXHJcbiAgICByZXR1cm4gcGFyc2VkRGF0YTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgYXJyYXkgb2YgcmVsYXRpb25zIHRoYXQgZXhpc3RzIGJldHdlZW4gYW4gQWN0aW9uIGFuZCBtYW55IEVsZW1lbnRzXHJcbiAqIEBwYXJhbSB7Tm9kZUxpc3RPZjxFbGVtZW50Pn0gbGlzdCBFbGVtZW50cyB0aGF0IHdpbGwgYmUgbWFwcGVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHJlbGF0aW9uLCBcInNob3dcIiBmb3IgZXhhbXBsZVxyXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiByZWxhdGVkIGVsZW1lbnRzXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXRSZWxhdGlvbnNBcnJheShsaXN0OiBOb2RlTGlzdE9mPEVsZW1lbnQ+LCB0eXBlOiBzdHJpbmcpOiBSZWxhdGlvbltdfHVuZGVmaW5lZCB7XHJcbiAgICBpZihsaXN0KSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obGlzdCkubWFwKGVsID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IFxyXG59XHJcbi8vI2VuZHJlZ2lvbiIsImltcG9ydCBDaGV2ZXJleCBmcm9tIFwiLi9DaGV2ZXJleFwiO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHtcclxuICAgIENoZXZlcmV4LnN0YXJ0KCk7XHJcbn0pOyIsIi8vI3JlZ2lvbiBUeXBlc1xyXG5leHBvcnQgdHlwZSBUeXBlcyA9IHN0cmluZ3xudW1iZXJ8Ym9vbGVhbjtcclxuZXhwb3J0IHR5cGUgUGF0dGVybnMgPSBbc3RyaW5nLCBSZWdFeHBdW107XHJcbi8vI2VuZHJlZ2lvblxyXG5cclxuLy8jcmVnaW9uIEVudW1zXHJcbmV4cG9ydCBlbnVtIENoZXZlcmV4VHlwZXMge1xyXG4gICAgXCJib29sZWFuXCIsXHJcbiAgICBcIm51bWJlclwiLFxyXG4gICAgXCJzdHJpbmdcIlxyXG59O1xyXG4vLyNlbmRyZWdpb25cclxuXHJcbi8vI3JlZ2lvbiBJbnRlcmZhY2VzXHJcbmV4cG9ydCBpbnRlcmZhY2UgQWN0aW9uIHtcclxuICAgIGVsZW06IEVsZW1lbnQsXHJcbiAgICB0eXBlPzogc3RyaW5nLFxyXG4gICAgYWN0aW9uPzogc3RyaW5nLFxyXG4gICAgdmFyaWFibGU/OiBzdHJpbmcsXHJcbiAgICByZWxhdGlvbj86IFJlbGF0aW9uW11cclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVsYXRpb24ge1xyXG4gICAgZWxlbWVudDogRWxlbWVudCxcclxuICAgIHR5cGU6IHN0cmluZ1xyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaXN0T2ZSZWxhdGlvbiB7XHJcbiAgICBbdHlwZTogc3RyaW5nXTogUmVsYXRpb25bXXx1bmRlZmluZWRcclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2xpY2tFdmVudCB7XHJcbiAgICBlbDogRWxlbWVudCxcclxuICAgIGFjdGlvbj86IHN0cmluZyxcclxuICAgIGRhdGE6IENoZXZlcmV4T2JqZWN0LFxyXG4gICAgbm9kZXM6IFJlbGF0aW9uW11cclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUGF0dGVybiB7XHJcbiAgICBbbmFtZTogc3RyaW5nXToge1xyXG4gICAgICAgIFthY3Rpb246IHN0cmluZ106IFJlZ0V4cFxyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUcnlQYXJzZSB7XHJcbiAgICBwYXR0ZXJuczogeyBbYWN0aW9uOiBzdHJpbmddOiBSZWdFeHA7IH0sIFxyXG4gICAgc3RyOiBzdHJpbmcsXHJcbiAgICB0eXBlOiBzdHJpbmdcclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkRGF0YSB7XHJcbiAgICBhY3Rpb24/OiBzdHJpbmcsXHJcbiAgICBuYW1lPzogc3RyaW5nLFxyXG4gICAgdHlwZT86IFR5cGVzLFxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDaGV2ZXJleE9iamVjdCB7XHJcbiAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICB2YWx1ZTogc3RyaW5nfG51bWJlcnxib29sZWFuLFxyXG4gICAgdHlwZTogc3RyaW5nfG51bWJlcnxib29sZWFuXHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENoZXZlcmV4RWxlbWVudCB7XHJcbiAgICBpZDogc3RyaW5nLFxyXG4gICAgZWxlbWVudDogRWxlbWVudCxcclxuICAgIGRhdGE6IENoZXZlcmV4T2JqZWN0W10sXHJcbiAgICBhY3Rpb25zPzogQWN0aW9uW10sXHJcbiAgICBjaGlsZHM/OiBDaGV2ZXJleENoaWxkc1tdLFxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIHtcclxuICAgIFt0eXBlOiBzdHJpbmddOiBzdHJpbmdbXVxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDaGV2ZXJleENoaWxkcyB7XHJcbiAgICBpZDogc3RyaW5nLFxyXG4gICAgdHlwZTogc3RyaW5nLFxyXG4gICAgYWN0aW9uOiBzdHJpbmcsXHJcbiAgICB2YXJpYWJsZTogc3RyaW5nLFxyXG4gICAgZWxlbWVudDogRWxlbWVudCxcclxuICAgIHJlbGF0aW9uczogc3RyaW5nW11cclxufTtcclxuLy8jZW5kcmVnaW9uIiwiaW1wb3J0IHsgVHlwZXMgfSBmcm9tIFwiLi9pbnRlcmZhY2VzXCI7XHJcblxyXG4vKipcclxuICogU2V0IHRoZSB0ZXh0IG9mIGEgZ3JvdXAgb2YgZWxlbWVudHNcclxuICogQHBhcmFtIHtFbGVtZW50W119IGVsIFRoZSBlbGVtZW50cyB0aGF0IHdpbGwgYmUgYWZmZWN0ZWRcclxuICogQHBhcmFtIHtUeXBlc30gdmFsIFRoZSBzdHJpbmcgdGhhdCB3aWxsIGJlIGFzc2lnbmVkIHRvIHRob3NlIGVsZW1lbnRzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0VGV4dEVsZW1lbnRzKGVsOiBFbGVtZW50W10sIHZhbDogVHlwZXMpOiB2b2lkIHtcclxuICAgIGVsLmZvckVhY2goKGVsZW1lbnQpID0+IHtcclxuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gdmFsLnRvU3RyaW5nKCk7XHJcbiAgICB9KTtcclxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c1wiKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=