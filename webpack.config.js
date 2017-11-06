'use strict';
// webpack.config.js


var webpack = require('webpack');
var CompressionPlugin = require("compression-webpack-plugin");
var production = process.env.NODE_ENV === 'production';

var plugins = []

if (production) {
  plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false },
      sourceMap: false
    }),
    new webpack.DefinePlugin({ // <--key to reduce React's size
      'process.env': { NODE_ENV: JSON.stringify('production') }
    })
  ]
}

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      loader: 'babel-loader',
      test: /\.js$/,
      exclude: /node_modules/
    },{
      test: /\.css$/,
      loader: "style-loader!css-loader"
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      use: [{
        loader: 'file-loader',
        options: { query: {
          hash: 'sha512',
          digest: 'hex',
          name: '[hash].[ext]'
        }}
      },{
        loader: 'image-webpack-loader',
        options: {query: {
          bypassOnDebug: true,
          optimizationLevel: 7,
          interlaced: false
        }
      }}]
    }]
  },
  plugins: plugins,
  devServer: {
    port: 3000
  },
  devtool: 'source-map'
};
