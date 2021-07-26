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
        this.actions = this.checkDataTypes(this.element);
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
    checkDataTypes(el) {
        const selectors = [
            el.querySelectorAll(`#${this.id} > *[data-click]`),
        ];
        let clickedData = [];
        if (selectors[0]) {
            selectors[0].forEach((click) => {
                clickedData.push(Parsers.parseClick(click, this.data, this.id));
            });
        }
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
/**
 * Convierte el valor del atributo "data-attached" en una array de objetos
 * @param str string
 * @returns CheverexObject[]
 */
function parserData(str) {
    const pattern = /(\w+:)|(\w+\s+:)/g;
    if (str === "") {
        throw new Error("Es nulo el valor del atributo");
    }
    const parsedStr = str.replace(pattern, (matched) => {
        return `"${matched.substr(0, matched.length - 1)}":`;
    }).replaceAll("'", "\"");
    let sanitized = JSON.parse(parsedStr);
    const obj = [
        Object.values(sanitized),
        Object.keys(sanitized)
    ];
    const final = obj[1].map((key) => {
        if (!(typeof sanitized[key] in interfaces_1.CheverexTypes)) {
            throw new Error("Tipo no permitido");
        }
        return {
            name: key,
            value: sanitized[key],
            type: typeof sanitized[key]
        };
    });
    return final;
}
exports.parserData = parserData;
;
function parseClick(el, data, id) {
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
    let attr = el.getAttribute("data-click");
    let action = {
        elem: el,
        type: "click",
    };
    let parseBool = (patterns.boolean.base.test(attr)), parseNum = (patterns.numeric.base.test(attr));
    let parsed = [];
    if ((!parseBool) && (!parseNum)) {
        throw new Error("Tipo de asignacion invalida para el tipo de variable");
    }
    if (parseNum) {
        parsed = tryToParse({
            patterns: patterns.numeric,
            str: attr,
            type: "number"
        });
    }
    if (parseBool) {
        parsed = tryToParse({
            patterns: patterns.boolean,
            str: attr,
            type: "boolean"
        });
    }
    [action.action, action.variable] = parsed;
    let check = data.find((d) => {
        return ((d.name == action.variable) && (typeof d.value == parsed[2]));
    });
    let related = document.querySelectorAll(`#${id} > [data-text=${action.variable}]`);
    if (!check)
        throw new Error("No se encontro la propiedad o hay un operador invalido");
    action.relation = Array.from(related).map(el => {
        return {
            element: el,
            type: "text"
        };
    });
    let toText = action.relation.map((rel) => rel.element);
    utils_1.setTextElements(toText, check.value);
    Index_1.setClick({
        el: el,
        action: action.action,
        data: check,
        nodes: action.relation
    });
    return action;
}
exports.parseClick = parseClick;
function tryToParse(parse) {
    let patternsArr = Object.entries(parse.patterns);
    patternsArr.shift();
    let arr = [];
    patternsArr.some((pattern) => {
        if (pattern[1].test(parse.str)) {
            arr[0] = pattern[0],
                arr[1] = parse.str.replace(pattern[1], ""),
                arr[2] = parse.type;
        }
    });
    if (arr == [])
        throw new Error("Verifica la expresion, ningun tipo compatible");
    return arr;
}


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
;
;
;
var CheverexTypes;
(function (CheverexTypes) {
    CheverexTypes[CheverexTypes["boolean"] = 0] = "boolean";
    CheverexTypes[CheverexTypes["number"] = 1] = "number";
    CheverexTypes[CheverexTypes["string"] = 2] = "string";
})(CheverexTypes = exports.CheverexTypes || (exports.CheverexTypes = {}));
;


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setTextElements = void 0;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGV2ZXJleC8uL3NyYy9BY3Rpb25zL0luZGV4LnRzIiwid2VicGFjazovL2NoZXZlcmV4Ly4vc3JjL0NoZXZlcmV4LnRzIiwid2VicGFjazovL2NoZXZlcmV4Ly4vc3JjL1BhcnNlci9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJleC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9jaGV2ZXJleC8uL3NyYy9pbnRlcmZhY2VzLnRzIiwid2VicGFjazovL2NoZXZlcmV4Ly4vc3JjL3V0aWxzLnRzIiwid2VicGFjazovL2NoZXZlcmV4L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NoZXZlcmV4L3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQ0Esc0VBQTJDO0FBRTNDLFNBQWdCLFFBQVEsQ0FBQyxLQUFpQjtJQUN0QyxLQUFLLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDcEMsUUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNwQixLQUFLLFFBQVE7Z0JBQUU7b0JBQ1gsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFlLENBQUM7aUJBQ3pFO2dCQUFDLE1BQU07WUFFUixLQUFLLFNBQVM7Z0JBQUc7b0JBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFnQixDQUFDLENBQUM7aUJBQ2hGO2dCQUFDLE1BQU07U0FDWDtRQUVELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFD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QyxDQUFDO0FBQ1AsQ0FBQztBQUpELDBDQUlDOzs7Ozs7O1VDTkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVQ3RCQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbGlja0V2ZW50IH0gZnJvbSBcIi4uL2ludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgc2V0VGV4dEVsZW1lbnRzIH0gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2xpY2soY2xpY2s6IENsaWNrRXZlbnQpOiB2b2lkIHtcclxuICAgIGNsaWNrLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgc3dpdGNoKGNsaWNrLmRhdGEudHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6IHtcclxuICAgICAgICAgICAgICAgIGNsaWNrLmRhdGEudmFsdWUgPSBpbmNPckRlYyhjbGljay5hY3Rpb24hLCBjbGljay5kYXRhLnZhbHVlIGFzIG51bWJlcilcclxuICAgICAgICAgICAgfSBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJib29sZWFuXCIgOiB7XHJcbiAgICAgICAgICAgICAgICBjbGljay5kYXRhLnZhbHVlID0gdG9nZ2xlT3JBc3NpZyhjbGljay5hY3Rpb24hLCBjbGljay5kYXRhLnZhbHVlIGFzIGJvb2xlYW4pO1xyXG4gICAgICAgICAgICB9IGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRleHROb2RlcyA9IGNsaWNrLm5vZGVzLm1hcCgobm9kZSkgPT4gbm9kZS5lbGVtZW50KTtcclxuICAgICAgICBzZXRUZXh0RWxlbWVudHModGV4dE5vZGVzLCBjbGljay5kYXRhLnZhbHVlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbmNPckRlYyhhY3Rpb246IHN0cmluZywgdmFsdWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSBcImluY3JlbWVudFwiOiB7XHJcbiAgICAgICAgICAgIHZhbHVlKys7XHJcbiAgICAgICAgfSBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImRlY3JlbWVudFwiOiB7XHJcbiAgICAgICAgICAgIHZhbHVlLS07XHJcbiAgICAgICAgfSBicmVhaztcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0b2dnbGVPckFzc2lnKGFjdGlvbjogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbik6IGJvb2xlYW4ge1xyXG4gICAgc3dpdGNoKGFjdGlvbikge1xyXG4gICAgICAgIGNhc2UgXCJ0b2dnbGVcIjoge1xyXG4gICAgICAgICAgICB2YWx1ZSA9ICF2YWx1ZTtcclxuICAgICAgICB9IGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiYXNzaWduVG9UcnVlXCI6IHtcclxuICAgICAgICAgICAgdmFsdWUgPSB0cnVlO1xyXG4gICAgICAgIH0gYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJhc3NpZ25Ub0ZhbHNlXCI6IHtcclxuICAgICAgICAgICAgdmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB9IGJyZWFrO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn07IiwiaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgKiBhcyBQYXJzZXJzIGZyb20gXCIuL1BhcnNlclwiO1xyXG5pbXBvcnQgeyBDaGV2ZXJleEVsZW1lbnQsIENoZXZlcmV4T2JqZWN0IH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENoZXZlcmV4Tm9kZSBpbXBsZW1lbnRzIENoZXZlcmV4RWxlbWVudCB7XHJcbiAgICBkYXRhOiBDaGV2ZXJleE9iamVjdFtdO1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGFjdGlvbnM/OiBBY3Rpb25bXTtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YTogc3RyaW5nLCBlbDogRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLnNldElkKDEwKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWw7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmlkID0gdGhpcy5pZDtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhID0gUGFyc2Vycy5wYXJzZXJEYXRhKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IHRoaXMuY2hlY2tEYXRhVHlwZXModGhpcy5lbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJZChsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGZpbmFsOiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgICAgICBjb25zdCBjaGFyczogeyBbdHlwZTogc3RyaW5nXTogc3RyaW5nICB9ID0ge1xyXG4gICAgICAgICAgICBcImxldHRlcnNcIjogXCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiLFxyXG4gICAgICAgICAgICBcIm1heXVzXCI6IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcIixcclxuICAgICAgICAgICAgXCJudW1iZXJzXCI6IFwiMDEyMzQ1Njc4OVwiXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8PSBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcmtleTogc3RyaW5nID0gT2JqZWN0LmtleXMoY2hhcnMpW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXTtcclxuICAgICAgICAgICAgZmluYWwgKz0gY2hhcnNbcmtleV1bTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGVuZ3RoKV1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmaW5hbDtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja0RhdGFUeXBlcyhlbDogRWxlbWVudCk6IEFjdGlvbltdIHtcclxuICAgICAgICBjb25zdCBzZWxlY3RvcnM6IE5vZGVMaXN0T2Y8RWxlbWVudD5bXSA9IFtcclxuICAgICAgICAgICAgZWwucXVlcnlTZWxlY3RvckFsbChgIyR7dGhpcy5pZH0gPiAqW2RhdGEtY2xpY2tdYCksXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbGV0IGNsaWNrZWREYXRhOiBBY3Rpb25bXSA9IFtdO1xyXG5cclxuICAgICAgICBpZihzZWxlY3RvcnNbMF0pIHtcclxuICAgICAgICAgICAgc2VsZWN0b3JzWzBdLmZvckVhY2goKGNsaWNrKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjbGlja2VkRGF0YS5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgIFBhcnNlcnMucGFyc2VDbGljayhjbGljaywgdGhpcy5kYXRhLCB0aGlzLmlkKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2xpY2tlZERhdGE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIENoZXZlcmV4RGF0YSB7XHJcbiAgICBlbGVtZW50czogQ2hldmVyZXhFbGVtZW50W10gPSBbXTtcclxufVxyXG5cclxuY29uc3QgQ2hldmVyZXg6IHsgc3RhcnQoKTogdm9pZCB9ID0ge1xyXG4gICAgc3RhcnQoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2W2RhdGEtYXR0YWNoZWRdXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBjaGV2ZXJleCA9IG5ldyBDaGV2ZXJleERhdGEoKTtcclxuXHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGE6IHN0cmluZyA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtYXR0YWNoZWRcIikhO1xyXG4gICAgICAgICAgICBjaGV2ZXJleC5lbGVtZW50cy5wdXNoKG5ldyBDaGV2ZXJleE5vZGUoZGF0YSwgZWwpKTtcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKGNoZXZlcmV4LmVsZW1lbnRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENoZXZlcmV4OyIsImltcG9ydCB7IHNldENsaWNrIH0gZnJvbSBcIi4uL0FjdGlvbnMvSW5kZXhcIjtcclxuaW1wb3J0IHsgQ2hldmVyZXhPYmplY3QsIENoZXZlcmV4VHlwZXMsIFBhdHRlcm4sIFRyeVBhcnNlLCBBY3Rpb24gfSBmcm9tIFwiLi4vaW50ZXJmYWNlc1wiO1xyXG5pbXBvcnQgeyBzZXRUZXh0RWxlbWVudHMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuLyoqXHJcbiAqIENvbnZpZXJ0ZSBlbCB2YWxvciBkZWwgYXRyaWJ1dG8gXCJkYXRhLWF0dGFjaGVkXCIgZW4gdW5hIGFycmF5IGRlIG9iamV0b3NcclxuICogQHBhcmFtIHN0ciBzdHJpbmdcclxuICogQHJldHVybnMgQ2hldmVyZXhPYmplY3RbXVxyXG4gKi9cclxuIGV4cG9ydCBmdW5jdGlvbiBwYXJzZXJEYXRhKHN0cjogc3RyaW5nKTogQ2hldmVyZXhPYmplY3RbXSB7XHJcbiAgICBjb25zdCBwYXR0ZXJuOiBSZWdFeHAgPSAvKFxcdys6KXwoXFx3K1xccys6KS9nO1xyXG5cclxuICAgIGlmKHN0ciA9PT0gXCJcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVzIG51bG8gZWwgdmFsb3IgZGVsIGF0cmlidXRvXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcnNlZFN0cjogc3RyaW5nID0gc3RyLnJlcGxhY2UocGF0dGVybiwgKG1hdGNoZWQpID0+IHtcclxuICAgICAgICByZXR1cm4gYFwiJHttYXRjaGVkLnN1YnN0cigwLCBtYXRjaGVkLmxlbmd0aC0xKX1cIjpgO1xyXG4gICAgfSkucmVwbGFjZUFsbChcIidcIiwgXCJcXFwiXCIpO1xyXG4gICAgXHJcbiAgICBsZXQgc2FuaXRpemVkOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0gSlNPTi5wYXJzZShwYXJzZWRTdHIpO1xyXG4gICAgICBcclxuICAgIGNvbnN0IG9iajogc3RyaW5nW11bXSA9IFtcclxuICAgICAgICBPYmplY3QudmFsdWVzKHNhbml0aXplZCksXHJcbiAgICAgICAgT2JqZWN0LmtleXMoc2FuaXRpemVkKVxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCBmaW5hbDogQ2hldmVyZXhPYmplY3RbXSA9IG9ialsxXS5tYXAoKGtleSkgPT4ge1xyXG5cclxuICAgICAgICBpZighKHR5cGVvZiBzYW5pdGl6ZWRba2V5XSBpbiBDaGV2ZXJleFR5cGVzKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaXBvIG5vIHBlcm1pdGlkb1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWU6IGtleSxcclxuICAgICAgICAgICAgdmFsdWU6IHNhbml0aXplZFtrZXldLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlb2Ygc2FuaXRpemVkW2tleV1cclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ2xpY2soZWw6IEVsZW1lbnQsIGRhdGE6IENoZXZlcmV4T2JqZWN0W10sIGlkOiBzdHJpbmcpOiBBY3Rpb24ge1xyXG5cclxuICAgIGNvbnN0IHBhdHRlcm5zOiBQYXR0ZXJuID0ge1xyXG4gICAgICAgIG51bWVyaWM6IHtcclxuICAgICAgICAgICAgYmFzZTovXlthLXpBLVpdKihcXCt7MiwyfXxcXC17MiwyfSkkLyxcclxuICAgICAgICAgICAgaW5jcmVtZW50OiAvKFxcK3syLDJ9KSQvLFxyXG4gICAgICAgICAgICBkZWNyZW1lbnQ6IC8oXFwtezIsMn0pJC8sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib29sZWFuOiB7XHJcbiAgICAgICAgICAgIGJhc2U6IC9eIVxcdyokfF5bYS16QS1aXS4qPShcXHN7MX0pKGZhbHNlfHRydWUpKD8hXFx3KS8sXHJcbiAgICAgICAgICAgIHRvZ2dsZTogL14hLyxcclxuICAgICAgICAgICAgYXNzaWduVG9UcnVlOiAvXFxzPShcXHN7MX0pKHRydWUpKD8hXFx3KSQvLFxyXG4gICAgICAgICAgICBhc3NpZ25Ub0ZhbHNlOiAvXFxzPShcXHN7MX0pKGZhbHNlKSg/IVxcdykkLyxcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBhdHRyOiBzdHJpbmcgPSBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNsaWNrXCIpITsgXHJcblxyXG4gICAgbGV0IGFjdGlvbjogQWN0aW9uID0ge1xyXG4gICAgICAgIGVsZW06IGVsLFxyXG4gICAgICAgIHR5cGU6IFwiY2xpY2tcIixcclxuICAgIH07XHJcblxyXG4gICAgbGV0IHBhcnNlQm9vbDogYm9vbGVhbiA9IChwYXR0ZXJucy5ib29sZWFuLmJhc2UudGVzdChhdHRyKSksIFxyXG4gICAgcGFyc2VOdW06IGJvb2xlYW4gPSAocGF0dGVybnMubnVtZXJpYy5iYXNlLnRlc3QoYXR0cikpXHJcblxyXG4gICAgbGV0IHBhcnNlZDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBpZigoIXBhcnNlQm9vbCkgJiYgKCFwYXJzZU51bSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaXBvIGRlIGFzaWduYWNpb24gaW52YWxpZGEgcGFyYSBlbCB0aXBvIGRlIHZhcmlhYmxlXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKHBhcnNlTnVtKSB7XHJcbiAgICAgICAgcGFyc2VkID0gdHJ5VG9QYXJzZSh7XHJcbiAgICAgICAgICAgIHBhdHRlcm5zOiBwYXR0ZXJucy5udW1lcmljLCBcclxuICAgICAgICAgICAgc3RyOiBhdHRyLFxyXG4gICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYocGFyc2VCb29sKSB7XHJcbiAgICAgICAgcGFyc2VkID0gdHJ5VG9QYXJzZSh7XHJcbiAgICAgICAgICAgIHBhdHRlcm5zOiBwYXR0ZXJucy5ib29sZWFuLCBcclxuICAgICAgICAgICAgc3RyOiBhdHRyLFxyXG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIFthY3Rpb24uYWN0aW9uLCBhY3Rpb24udmFyaWFibGUgXSA9IHBhcnNlZDtcclxuXHJcbiAgICBsZXQgY2hlY2s6IENoZXZlcmV4T2JqZWN0fHVuZGVmaW5lZCA9IGRhdGEuZmluZCgoZCkgPT4ge1xyXG4gICAgICAgIHJldHVybiAoKGQubmFtZSA9PSBhY3Rpb24udmFyaWFibGUpICYmICh0eXBlb2YgZC52YWx1ZSA9PSBwYXJzZWRbMl0pKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCByZWxhdGVkOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgIyR7aWR9ID4gW2RhdGEtdGV4dD0ke2FjdGlvbi52YXJpYWJsZX1dYCk7XHJcblxyXG4gICAgaWYoIWNoZWNrKSB0aHJvdyBuZXcgRXJyb3IoXCJObyBzZSBlbmNvbnRybyBsYSBwcm9waWVkYWQgbyBoYXkgdW4gb3BlcmFkb3IgaW52YWxpZG9cIik7XHJcblxyXG4gICAgYWN0aW9uLnJlbGF0aW9uID0gQXJyYXkuZnJvbShyZWxhdGVkKS5tYXAoZWwgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGVsLFxyXG4gICAgICAgICAgICB0eXBlOiBcInRleHRcIlxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGxldCB0b1RleHQ6IEVsZW1lbnRbXSA9IGFjdGlvbi5yZWxhdGlvbi5tYXAoKHJlbCkgPT4gcmVsLmVsZW1lbnQpO1xyXG5cclxuICAgIHNldFRleHRFbGVtZW50cyh0b1RleHQsIGNoZWNrLnZhbHVlKTtcclxuICAgIHNldENsaWNrKHtcclxuICAgICAgICBlbDogZWwsXHJcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24uYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGNoZWNrLFxyXG4gICAgICAgIG5vZGVzOiBhY3Rpb24ucmVsYXRpb25cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBhY3Rpb247XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRyeVRvUGFyc2UocGFyc2U6IFRyeVBhcnNlKTogc3RyaW5nW10ge1xyXG4gICAgbGV0IHBhdHRlcm5zQXJyOiBbc3RyaW5nLCBSZWdFeHBdW10gPSBPYmplY3QuZW50cmllcyhwYXJzZS5wYXR0ZXJucyk7XHJcbiAgICBwYXR0ZXJuc0Fyci5zaGlmdCgpO1xyXG5cclxuICAgIGxldCBhcnI6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgcGF0dGVybnNBcnIuc29tZSgocGF0dGVybikgPT4ge1xyXG4gICAgICAgIGlmKHBhdHRlcm5bMV0udGVzdChwYXJzZS5zdHIpKSB7XHJcbiAgICAgICAgICAgIGFyclswXSA9IHBhdHRlcm5bMF0sXHJcbiAgICAgICAgICAgIGFyclsxXSA9IHBhcnNlLnN0ci5yZXBsYWNlKHBhdHRlcm5bMV0sIFwiXCIpLFxyXG4gICAgICAgICAgICBhcnJbMl0gPSBwYXJzZS50eXBlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmKGFyciA9PSBbXSkgdGhyb3cgbmV3IEVycm9yKFwiVmVyaWZpY2EgbGEgZXhwcmVzaW9uLCBuaW5ndW4gdGlwbyBjb21wYXRpYmxlXCIpO1xyXG5cclxuICAgIHJldHVybiBhcnI7XHJcbn0iLCJpbXBvcnQgQ2hldmVyZXggZnJvbSBcIi4vQ2hldmVyZXhcIjtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7XHJcbiAgICBDaGV2ZXJleC5zdGFydCgpO1xyXG59KTsiLCJleHBvcnQgaW50ZXJmYWNlIEFjdGlvbiB7XHJcbiAgICBlbGVtOiBFbGVtZW50LFxyXG4gICAgdHlwZT86IHN0cmluZyxcclxuICAgIGFjdGlvbj86IHN0cmluZyxcclxuICAgIHZhcmlhYmxlPzogc3RyaW5nLFxyXG4gICAgcmVsYXRpb24/OiBSZWxhdGlvbltdXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVsYXRpb24ge1xyXG4gICAgZWxlbWVudDogRWxlbWVudCxcclxuICAgIHR5cGU6IHN0cmluZ1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENsaWNrRXZlbnQge1xyXG4gICAgZWw6IEVsZW1lbnQsXHJcbiAgICBhY3Rpb24/OiBzdHJpbmcsXHJcbiAgICBkYXRhOiBDaGV2ZXJleE9iamVjdCxcclxuICAgIG5vZGVzOiBSZWxhdGlvbltdXHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBhdHRlcm4ge1xyXG4gICAgW25hbWU6IHN0cmluZ106IHtcclxuICAgICAgICBbYWN0aW9uOiBzdHJpbmddOiBSZWdFeHBcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVHJ5UGFyc2Uge1xyXG4gICAgcGF0dGVybnM6IHsgW2FjdGlvbjogc3RyaW5nXTogUmVnRXhwOyB9LCBcclxuICAgIHN0cjogc3RyaW5nLFxyXG4gICAgdHlwZTogc3RyaW5nXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBUeXBlcyA9IHN0cmluZ3xudW1iZXJ8Ym9vbGVhbjtcclxuXHJcbmV4cG9ydCBlbnVtIENoZXZlcmV4VHlwZXMge1xyXG4gICAgXCJib29sZWFuXCIsXHJcbiAgICBcIm51bWJlclwiLFxyXG4gICAgXCJzdHJpbmdcIlxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDaGV2ZXJleE9iamVjdCB7XHJcbiAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICB2YWx1ZTogc3RyaW5nfG51bWJlcnxib29sZWFuLFxyXG4gICAgdHlwZTogc3RyaW5nfG51bWJlcnxib29sZWFuXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2hldmVyZXhFbGVtZW50IHtcclxuICAgIGlkOiBzdHJpbmcsXHJcbiAgICBlbGVtZW50OiBFbGVtZW50LFxyXG4gICAgZGF0YTogQ2hldmVyZXhPYmplY3RbXSxcclxuICAgIGFjdGlvbnM/OiBBY3Rpb25bXSxcclxuICAgIGNoaWxkcz86IENoZXZlcmV4Q2hpbGRzW10sXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2hldmVyZXhDaGlsZHMge1xyXG4gICAgaWQ6IHN0cmluZyxcclxuICAgIHR5cGU6IHN0cmluZyxcclxuICAgIGFjdGlvbjogc3RyaW5nLFxyXG4gICAgdmFyaWFibGU6IHN0cmluZyxcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQsXHJcbiAgICByZWxhdGlvbnM6IHN0cmluZ1tdXHJcbn0iLCJpbXBvcnQgeyBUeXBlcyB9IGZyb20gXCIuL2ludGVyZmFjZXNcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRUZXh0RWxlbWVudHMoZWw6IEVsZW1lbnRbXSwgdmFsOiBUeXBlcykge1xyXG4gICAgZWwuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xyXG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSB2YWwudG9TdHJpbmcoKTtcclxuICAgIH0pO1xyXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzXCIpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==