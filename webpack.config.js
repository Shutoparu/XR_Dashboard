// webpack.config.js
const path = require('path');

module.exports = {
  entry: './static/js/ovenspace.js', // Update with your destination file path
  output: {
    path: path.resolve(__dirname, 'static/dist'), // Update with your desired output directory
    filename: 'bundle.js',
  },
  mode: 'production', // or 'development' for non-minified output
};
