const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/js/index.js",
    devtool: "inline-source-map",
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
        filename: "bundle.js",
        sourceMapFilename: 'bundle.map.js',
        path: path.resolve(__dirname, "dist"),
    },
};
