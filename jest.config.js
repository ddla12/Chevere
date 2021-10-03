const { defaults } = require("jest-config");

module.exports = {
    testEnvironment: "jsdom",
    moduleFileExtensions: [...defaults.moduleFileExtensions],
    testMatch: ["**/*.(test|spec).ts"],
    coveragePathIgnorePatterns: ["/node_modules/"],
    moduleNameMapper: {
        "@helpers": "<rootDir>/src/utils/index.ts",
        "@chevere": "<rootDir>/src/chevere/index.ts",
        "@interfaces": "<rootDir>/src/interfaces.ts",
        "@actions": "<rootDir>/src/actions/index.ts"
    },
    verbose: true,
    preset: "ts-jest"
};