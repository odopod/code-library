// Node v6 doesn't yet support the ES2017 dangling comma in functions.
/* eslint-disable comma-dangle */

const path = require('path');
const fs = require('fs-extra');
const getPackageDirectories = require('./get-package-directories');
const rewritePaths = require('./docs-rewrite-paths');

const root = path.resolve(__dirname, '../');
const noop = () => {};

const cache = new Set();

function copyNpmDependencies(dependencies) {
  // Ignore files that have already been copied before.
  const arr = Array.from(dependencies).filter(({ sourcePath }) => !cache.has(sourcePath));

  // Create an array of promises.
  const copiers = arr.map(({ sourceLocation, sourcePath }) => {
    cache.add(sourcePath);
    // Allow sourceLocation to be absolute or relative to packages dir.
    const fileLocation = sourceLocation.includes('packages') ?
      sourceLocation : path.join(root, 'packages', sourceLocation);
    return fs.copy(fileLocation, path.join(root, 'docs', sourcePath));
  });

  return Promise.all(copiers);
}

function copyPackageDependencies() {
  return new Promise((resolve) => {
    getPackageDirectories.then((dirnames) => {
      const copies = dirnames.map(dirname => new Promise((resolve) => {
        const src = path.join(root, 'packages', dirname);
        const docs = path.join(root, 'docs', dirname);

        // Treat sassplate special.
        if (dirname === 'odo-sassplate') {
          const dist = fs.copy(path.join(src, 'dist'), docs, {
            filter: filename => !filename.includes('.instrumented.js'),
          }).catch(noop);

          dist.then(resolve);
          return;
        }

        // Any CSS files. Silently fail if the component doesn't have a css directory.
        const css = fs.copy(path.join(src, 'css'), path.join(docs, 'css'))
          .catch(noop);

        // Move demos up a folder.
        const styles = fs.copy(path.join(src, 'demos/styles'), path.join(docs, 'styles'))
          .catch(noop);

        const scripts = fs.copy(path.join(src, 'demos/scripts'), path.join(docs, 'scripts'), {
          filter: filename => !filename.includes('_demo.js'),
        }).catch(noop);

        const html = rewritePaths(path.join(src, 'demos/*.html'), docs)
          .then(copyNpmDependencies);

        // Bundled js files, but not the instrumented file.
        const dist = fs.copy(path.join(src, 'dist'), path.join(docs, 'dist'), {
          filter: filename => !filename.includes('.instrumented.js'),
        }).catch(noop);

        Promise.all([
          css,
          scripts,
          styles,
          html,
          dist,
        ]).then(resolve);
      }));

      Promise.all(copies).then(resolve);
    });
  });
}

function copyCommonDependencies() {
  return Promise.all([
    fs.copy(
      path.join(root, 'node_modules/classlist.js/classList.min.js'),
      path.join(root, 'docs/node_modules/classlist.js/classList.min.js')
    ),
    fs.copy(
      path.join(root, 'node_modules/babel-polyfill/dist/polyfill.min.js'),
      path.join(root, 'docs/node_modules/babel-polyfill/dist/polyfill.min.js')
    ),
    fs.copy(
      path.join(root, 'node_modules/shufflejs/dist/shuffle.min.js'),
      path.join(root, 'docs/node_modules/shufflejs/dist/shuffle.min.js')
    ),
  ]);
}

module.exports = () => Promise.all([
  copyPackageDependencies(),
  copyCommonDependencies(),
]);
