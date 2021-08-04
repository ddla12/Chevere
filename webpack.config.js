const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/ts/index.ts",
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: {
            "@actions": path.resolve(__dirname, './src/ts/actions/index.ts'),
            "@chevere": path.resolve(__dirname, './src/ts/chevere/index.ts'),
            "@helpers": path.resolve(__dirname, './src/ts/utils/index.ts'),
            "@interfaces": path.resolve(__dirname, './src/ts/interfaces.ts'),
          },
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        sourceMapFilename: 'bundle.map.js',
        path: path.resolve(__dirname, "dist"),
    },
};
