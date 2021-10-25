const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'css-loader' }],
});

module.exports = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    mainFields: ['main'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
  },
  externals: [
    // Firebase, webpack, and TS don't go well together. This excludes it from being bundled.
    // See https://github.com/firebase/firebase-js-sdk/issues/2215
    {
      firebase: 'commonjs firebase',
    },
  ],
};
