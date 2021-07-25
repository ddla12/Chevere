/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/tokenizer.ts":
/*!**************************!*\
  !*** ./src/tokenizer.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sanitizer = void 0;
const sanitizer = (str) => {
    if (str === null) {
        throw new Error("Es nulo el valor del atributo");
    }
    const patterns = {
        sanity: /[()\s]/g,
        boolean: /true|false/g,
        string: /"[a-zA-z0-9]*"|'[a-zA-z0-9]*'/g,
        number: /[0-9]*/g
    };
    let type = "";
    let sanitized = str.replace(patterns.sanity, "").split(",");
    try {
        if (patterns.boolean.test(sanitized[1])) {
            type = "boolean";
        }
        else if (patterns.string.test(sanitized[1])) {
            type = "string";
        }
        else if (patterns.number.test(sanitized[1])) {
            type = "number";
        }
        else {
            throw new Error("Ningun tipo compatible");
        }
    }
    catch (e) {
        console.log(e);
    }
    return [
        sanitized,
        type
    ];
};
exports.sanitizer = sanitizer;


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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tokenizer_1 = __webpack_require__(/*! ./tokenizer */ "./src/tokenizer.ts");
window.addEventListener("load", () => {
    const elements = document.querySelectorAll("[data-attached]");
    elements.forEach(el => {
        const data = el.getAttribute("data-attached");
        console.log(tokenizer_1.sanitizer(data));
    });
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGV2ZXJleC8uL3NyYy90b2tlbml6ZXIudHMiLCJ3ZWJwYWNrOi8vY2hldmVyZXgvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY2hldmVyZXgvLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQU9PLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBVyxFQUF3QixFQUFFO0lBQzNELElBQUcsR0FBRyxLQUFLLElBQUksRUFBRTtRQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztLQUNwRDtJQUVELE1BQU0sUUFBUSxHQUFhO1FBQ3ZCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE9BQU8sRUFBRSxhQUFhO1FBQ3RCLE1BQU0sRUFBRSxnQ0FBZ0M7UUFDeEMsTUFBTSxFQUFFLFNBQVM7S0FDcEIsQ0FBQztJQUVGLElBQUksSUFBSSxHQUFXLEVBQUUsQ0FBQztJQUN0QixJQUFJLFNBQVMsR0FBYSxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXRFLElBQUk7UUFDQSxJQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3JDLElBQUksR0FBRyxTQUFTLENBQUM7U0FDbkI7YUFBTSxJQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzVDLElBQUksR0FBRyxRQUFRLENBQUM7U0FDakI7YUFBTSxJQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzNDLElBQUksR0FBRyxRQUFRLENBQUM7U0FDbEI7YUFBTTtZQUNKLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztTQUM1QztLQUNKO0lBQUMsT0FBTSxDQUFDLEVBQUU7UUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCO0lBRUQsT0FBTztRQUNILFNBQVM7UUFDVCxJQUFJO0tBQ1AsQ0FBQztBQUNOLENBQUMsQ0FBQztBQWpDVyxpQkFBUyxhQWlDcEI7Ozs7Ozs7VUN4Q0Y7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7Ozs7O0FDdEJBLGlGQUF3QztBQUV4QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNqQyxNQUFNLFFBQVEsR0FBd0IsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFbkYsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNsQixNQUFNLElBQUksR0FBVyxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBRSxDQUFDO1FBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBQYXR0ZXJucyB7XHJcbiAgICBzYW5pdHkgIDogUmVnRXhwLFxyXG4gICAgYm9vbGVhbiA6IFJlZ0V4cCxcclxuICAgIHN0cmluZyAgOiBSZWdFeHAsXHJcbiAgICBudW1iZXIgIDogUmVnRXhwLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2FuaXRpemVyID0gKHN0cjogc3RyaW5nKTogWyBzdHJpbmdbXSwgc3RyaW5nIF0gPT4ge1xyXG4gICAgaWYoc3RyID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXMgbnVsbyBlbCB2YWxvciBkZWwgYXRyaWJ1dG9cIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGF0dGVybnM6IFBhdHRlcm5zID0ge1xyXG4gICAgICAgIHNhbml0eTogL1soKVxcc10vZyxcclxuICAgICAgICBib29sZWFuOiAvdHJ1ZXxmYWxzZS9nLFxyXG4gICAgICAgIHN0cmluZzogL1wiW2EtekEtejAtOV0qXCJ8J1thLXpBLXowLTldKicvZyxcclxuICAgICAgICBudW1iZXI6IC9bMC05XSovZ1xyXG4gICAgfTtcclxuICAgICAgXHJcbiAgICBsZXQgdHlwZTogc3RyaW5nID0gXCJcIjtcclxuICAgIGxldCBzYW5pdGl6ZWQ6IHN0cmluZ1tdID0gc3RyLnJlcGxhY2UocGF0dGVybnMuc2FuaXR5LCBcIlwiKS5zcGxpdChcIixcIik7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBpZihwYXR0ZXJucy5ib29sZWFuLnRlc3Qoc2FuaXRpemVkWzFdKSkge1xyXG4gICAgICAgICAgIHR5cGUgPSBcImJvb2xlYW5cIjtcclxuICAgICAgICB9IGVsc2UgaWYocGF0dGVybnMuc3RyaW5nLnRlc3Qoc2FuaXRpemVkWzFdKSkge1xyXG4gICAgICAgICAgdHlwZSA9IFwic3RyaW5nXCI7ICAgXHJcbiAgICAgICAgfSBlbHNlIGlmKHBhdHRlcm5zLm51bWJlci50ZXN0KHNhbml0aXplZFsxXSkpIHtcclxuICAgICAgICAgICB0eXBlID0gXCJudW1iZXJcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5pbmd1biB0aXBvIGNvbXBhdGlibGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzYW5pdGl6ZWQsXHJcbiAgICAgICAgdHlwZVxyXG4gICAgXTtcclxufTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgc2FuaXRpemVyIH0gZnJvbSBcIi4vdG9rZW5pemVyXCI7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKCkgPT4ge1xyXG4gICAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtYXR0YWNoZWRdXCIpO1xyXG5cclxuICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRhdGE6IHN0cmluZyA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtYXR0YWNoZWRcIikhO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHNhbml0aXplcihkYXRhKSk7XHJcbiAgICB9KTtcclxuXHJcbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=