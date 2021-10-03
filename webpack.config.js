const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./dist/module/index.js",
    output: {
        filename: "chevere.min.js",
        path: path.resolve(__dirname, "./dist/cdn/"),
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
};
