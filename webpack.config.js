const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./dist/module/index.js",
    resolve: {
        alias: {
            "@actions": path.resolve(__dirname, './dist/module/actions/index.js'),
            "@chevere": path.resolve(__dirname, './dist/module/chevere/index.js'),
            "@helpers": path.resolve(__dirname, './dist/module/utils/index.js'),
            "@types": path.resolve(__dirname, './dist/module/@types.js'),
          },
        extensions: [".js"],
    },
    output: {
        filename: "chevere.min.js",
        path: path.resolve(__dirname, "dist/cdn/"),
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
};
