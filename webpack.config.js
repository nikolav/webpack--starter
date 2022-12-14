const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
//
const isProduction = process.env.NODE_ENV === "production";

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "style-loader";

const config = {
  // declare graph nodes
  entry: {
    main: "./src/index.js",
  },
  // export * @dist
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  // --hmr true
  devServer: {
    hot: true,
    // host: "localhost",
    // static: path,
  },
  // browser env
  target: "web",
  // asset import setup
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.(s[ac]|c)ss$/i,
        use: [stylesHandler, "css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpe?g|gif)$/i,
        type: "asset",
      },
    ],
  },
  // clear dist, mk index.html
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*"],
    }),
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
  ],
};
//
module.exports = () => {
  //
  if (isProduction) {
    // @production
    //  - extract css file
    //  - generate browser vendor prefixes from .browserslist
    //  - compress *
    //  - skip source maps
    config.mode = "production";
    config.plugins.push(new MiniCssExtractPlugin());
    config.optimization = {
      minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
      minimize: true,
    };
    config.target = "browserslist";
    config.devtool = false;
    //
  } else {
    // @development
    //  - dont compress
    //  - embed styles
    //  - skip vendor prefixes; --target web
    //  - run linter
    //  - generate source maps
    //  - run HMR, --hot true
    config.mode = "development";
    config.plugins.push(
      new ESLintPlugin({
        extensions: "js",
        emitWarning: true,
        files: path.resolve(__dirname, "src"),
      })
    );
    config.devtool = "source-map";
  }
  //
  return config;
};
