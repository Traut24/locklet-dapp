const path = require('path');

module.exports = {
  src: path.resolve(__dirname, '../src'),
  public: path.resolve(__dirname, '../public'),
  contracts: path.resolve(__dirname, '../contracts'),
  build: path.resolve(__dirname, '../dist'),
  faviconPath: path.resolve(__dirname, '../', 'src/assets/images/favicon.png'),
  templatePath: path.resolve(__dirname, '../', 'src/template.html'),
};
