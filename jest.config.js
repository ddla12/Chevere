const { defaults } = require("jest-config");

module.exports = {
    testEnvironment: "jsdom",
    moduleFileExtensions: [...defaults.moduleFileExtensions],
    testMatch: ["**/*.(test|spec).js"],
    coveragePathIgnorePatterns: ["/node_modules/"],
    moduleNameMapper: {
        "@helpers": "<rootDir>/dist/module/utils/index.js",
        "@chevere": "<rootDir>/dist/module/chevere/index.js",
        "@types": "<rootDir>/dist/module/@tpyes.js",
        "@actions": "<rootDir>/dist/module/actions/index.js"
    },
    verbose: false
};