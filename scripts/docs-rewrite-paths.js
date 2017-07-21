const path = require('path');
const pify = require('pify');
const glob = pify(require('glob'));
const fs = require('fs-extra');

function getMultipleMatches(re, str) {
  const matches = [];
  let match = re.exec(str);
  while (match !== null) {
    matches.push(match[1]);
    match = re.exec(str);
  }

  return matches;
}

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
        // Now that demos are one level up from where they usually are, remove the ../.
        // Use the dist files from local odo components instead of their node modules.
        let contents = str
          .replace(/href="\.\.\/(?!node_modules)/g, 'href="')
          .replace(/src="\.\.\/(?!node_modules)/g, 'src="')
          .replace(/\.\.\/node_modules\/@odopod\//g, '../');

        // Find ../node_modules.
        const matches = getMultipleMatches(/src="\.\.\/(node_modules\/.+)"/g, contents);
        matches.forEach(match => externalDependencies.add(match));

        // Replace common dependencies after the package-specific ones have been discovered.
        contents = contents
          .replace(/\.\.\/\.\.\/docs\/demo\.css/, '../demo.css')
          .replace(/\.\.\/\.\.\//g, '../');

        fs.writeFile(path.join(dest, basename), contents).then(resolve);
      });
    }));

    Promise.all(rewrites).then(() => {
      resolve(externalDependencies);
    });
  });
});
