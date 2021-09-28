const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./src/js/index.js",
    resolve: {
        alias: {
            "@actions": path.resolve(__dirname, './src/js/actions/index.js'),
            "@chevere": path.resolve(__dirname, './src/js/chevere/index.js'),
            "@helpers": path.resolve(__dirname, './src/js/utils/index.js'),
            "@interfaces": path.resolve(__dirname, './src/js/interfaces.js'),
          },
        extensions: [".js"],
    },
    output: {
        filename: "chevere.min.js",
        path: path.resolve(__dirname, "dist"),
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
};
