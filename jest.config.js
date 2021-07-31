const { defaults } = require("jest-config");

module.exports = {
    testEnvironment: 'jsdom',
    moduleFileExtensions: [...defaults.moduleFileExtensions],
    //preset: "ts-jest"
};