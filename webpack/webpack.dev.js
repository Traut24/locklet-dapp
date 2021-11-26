const paths = require('./paths');

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const Dotenv = require('dotenv-webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    historyApiFallback: true,
    compress: true,
    open: true,
    port: 8080,
    client: {
      overlay: true,
      progress: true
    },
  },
  plugins: [
    new Dotenv(),
  ],
});
