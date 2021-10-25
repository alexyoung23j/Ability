const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');
console.log(__dirname);
console.log(path.join(__dirname, '/'));

const out = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.ts',
  // Put your normal webpack config below here
  mode: 'development',
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    mainFields: ['main'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, 'tsconfig.json'),
        baseUrl: path.join(__dirname),
      }),
    ],
  },
};

console.log(out);
module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.ts',
  // Put your normal webpack config below here

  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    mainFields: ['main'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],

    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, 'tsconfig.json'),
      }),
    ],
  },
};
