const path = require('path');
const webpack = require('webpack');

module.exports = {
  // ... other Webpack configurations ...

  plugins: [
    // Define the process.env object with the GITHUB_TOKEN value
    new webpack.DefinePlugin({
      'process.env.GITHUB_TOKEN': JSON.stringify(process.env.GITHUB_TOKEN)
    })
  ]
};