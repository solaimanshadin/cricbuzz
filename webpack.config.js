const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
module.exports = ({ mode }) => {
  return {
    mode,
    resolve: {
      extensions: [".ts", ".js"],
    },
    output: {
      filename: "dist.js",
    },
    module: {
      rules: [
        {
          test: /\.css/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.ts/,
          use: "ts-loader",
        },
      ],
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        template: "src/index.html",
      }),
    ],
  };
};
