/**
 * @fileoverview Rewrite resource paths for each demo file.
 */

const path = require('path');
const pify = require('pify');
const glob = pify(require('glob'));
const fs = require('fs-extra');

// Now that the demos directory is one level up from where it usually is,
// remove the "../".
const HREF_DOT_DOT_SLASH = /href="\.\.\//g;
const SRC_DOT_DOT_SLASH = /src="\.\.\//g;
// Match
// <link rel="stylesheet" href="../../../docs/demo.css" />
const ROOT_FILE = /\.\.\/\.\.\/docs\/(.+)/g;
// Match:
// <script src="../../node_modules/babel-polyfill/dist/polyfill.min.js"></script>
const ROOT_NODE_MODULE = /src="\.\.\/\.\.\/(node_modules\/.+)"/g;
// Match:
// <script src="../odo-responsive-images/node_modules/picturefill/dist/picturefill.min.js"></script>
// capture "odo-responsive-images/node_modules/picturefill/dist/picturefill.min.js"
// to find the right file to copy.
// capture "picturefill/dist/picturefill.min.js" to rewrite the correct path.
const NESTED_NODE_MODULE = /src="\.\.\/([\w-]+\/(node_modules\/.+))"/g;
// Match:
// <script src="node_modules/tiny-emitter/dist/tinyemitter.min.js"></script>
const LOCAL_NODE_MODULE = /src="(node_modules\/.+)"/g;

/**
 * Rewrite html files' resource paths.
 * @param {string} pattern glob pattern to find the files.
 * @param {string} dest Destination directory for the files.
 * @return {Promise.<Set>} A promise which contains a Set of the external
 *     dependencies for the html pages.
 */
module.exports = (pattern, dest) => new Promise((resolve) => {
  glob(pattern).then((files) => {
    const externalDependencies = new Set();

    const rewrites = files.map(filename => new Promise((resolve) => {
      const basename = path.basename(filename);

      fs.readFile(filename, 'utf-8').then((str) => {
        const contents = str
          .replace(HREF_DOT_DOT_SLASH, 'href="')
          .replace(SRC_DOT_DOT_SLASH, 'src="')
          .replace(ROOT_FILE, '../$1')
          .replace(NESTED_NODE_MODULE, (match, p1, p2) => {
            externalDependencies.add({
              sourceLocation: p1,
              sourcePath: p2,
            });
            return `src="../${p2}"`;
          })
          .replace(LOCAL_NODE_MODULE, (match, p1) => {
            externalDependencies.add({
              sourceLocation: path.resolve(filename, '../../', p1),
              sourcePath: p1,
            });
            return `src="../${p1}"`;
          })
          .replace(ROOT_NODE_MODULE, 'src="../$1"');

        fs.writeFile(path.join(dest, basename), contents).then(resolve);
      });
    }));

    Promise.all(rewrites).then(() => {
      resolve(externalDependencies);
    });
  });
});
