const path = require('path');
const fs = require('fs-extra');
const nunjucks = require('nunjucks');
const Component = require('./docs-collect-data');

const root = path.resolve(__dirname, '../');

const options = {
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
};
const loaders = [
  new nunjucks.FileSystemLoader('docs-src'),
];

const env = new nunjucks.Environment(loaders, options);

module.exports = () => new Promise((resolve) => {
  Component.getAll().then((components) => {
    const context = {
      components,
      keywords: Component.getKeywords(components),
      stringify: JSON.stringify,
    };

    env.render('index.nunjucks', context, (err, result) => {
      if (err) {
        throw err;
      }

      fs.writeFile(path.join(root, 'docs/index.html'), result).then(resolve);
    });
  });
});
