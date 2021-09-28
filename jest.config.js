const { defaults } = require("jest-config");

module.exports = {
    testEnvironment: "jsdom",
    moduleFileExtensions: [...defaults.moduleFileExtensions],
    testMatch: ["**/*.(test|spec).js"],
    coveragePathIgnorePatterns: ["/node_modules/"],
    moduleNameMapper: {
        "@helpers": "<rootDir>/src/js/utils/index.js",
        "@chevere": "<rootDir>/src/js/chevere/index.js",
        "@interfaces": "<rootDir>/src/js/interfaces.js",
        "@actions": "<rootDir>/src/js/actions/index.js"
    },
};