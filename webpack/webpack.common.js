const webpack = require('webpack');

const paths = require('./paths');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  // Where webpack looks to start building the bundle
  entry: [paths.src + '/index.jsx'],

  // Alias and extensions
  resolve: {
    alias: {
      src: paths.src,
      contracts: paths.contracts,
    },
    extensions: ['', '.js', '.jsx'],
  },

  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.src + '/assets',
          to: 'assets',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
        },
      ],
    }),

    // Generates an HTML file from a template
    // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
    new HtmlWebpackPlugin({
      title: 'Locklet — App',
      favicon: paths.src + '/assets/images/favicon.png',
      template: paths.public + '/template.html', // template file
      filename: 'index.html', // output file
    }),

    // Polyfill Node.js core modules
    new NodePolyfillPlugin(),

    // A secure webpack plugin that supports dotenv and other environment variables and only exposes what you choose and use
    new Dotenv(),

    // Automatically import react
    new webpack.ProvidePlugin({
      React: 'react'
   })
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: ['babel-loader'] },

      // Styles: Inject CSS into the head with source maps
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { sourceMap: true, importLoaders: 1 },
          },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },

      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
    ],
  },
};
