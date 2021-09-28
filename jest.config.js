const { defaults } = require("jest-config");
const { pathsToModuleNameMapper } = require('ts-jest/utils');

module.exports = {
    testEnvironment: 'jsdom',
    moduleFileExtensions: [...defaults.moduleFileExtensions],
    preset: "ts-jest",
    moduleNameMapper: {
        "@helpers": "<rootDir>/src/ts/utils/index.ts",
        "@chevere": "<rootDir>/src/ts/chevere/index.ts",
        "@interfaces": "<rootDir>/src/ts/interfaces.ts",
        "@actions": "<rootDir>/src/ts/actions/index.ts"
      },
};