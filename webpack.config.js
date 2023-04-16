const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: 'assets/js/main.js', // Your entry file
  output: {
    path: path.resolve(__dirname, 'dist'), // Output path
    filename: 'bundle.js' // Output filename
  },
  module: {
    rules: [
      // Example rule for JavaScript transpilation using Babel
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    // Define the process.env object with the GITHUB_TOKEN value
    new webpack.DefinePlugin({
      'process.env.GITHUB_TOKEN': JSON.stringify(process.env.GITHUB_TOKEN)
    })
  ]
};
