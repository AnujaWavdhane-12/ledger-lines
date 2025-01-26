/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const slsw = require("serverless-webpack")
const webpack = require("webpack")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")

const isLocal = slsw.lib.webpack.isLocal

module.exports = {
  mode: isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  externals: [/aws-sdk/],
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    //fix: added to resolve issue with node-auth0 v2.36.2
    alias: {
      //  'formidable': false, //  node-auth0 build warning
      //  'coffee-script': false, //  node-auth0 build fail
      //  'vm2': false, // node-auth0 build fail
      //  'yargs': false, // auth0-deploy-cli build warning
      //  'colors': false, // auth0-deploy-cli build warning
      //  'keyv': false, // openid-client build warning
      'hexoid': 'hexoid/dist/index.js',
    },
  },
  output: {
    libraryTarget: "commonjs2",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  node: {
    __dirname: true,
  },
  target: "node",
  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "cache-loader",
            options: {
              cacheDirectory: path.resolve(".webpackCache"),
            },
          },
          "babel-loader",
        ],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new webpack.DefinePlugin({ "global.GENTLY": false }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'node_modules/mailgen/themes', to: 'node_modules/mailgen/themes' },
        { from: 'node_modules/sqlite3/build/Release', to: 'build' }
      ]
    })
  ]
}
