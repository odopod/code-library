/**
 * @fileoverview Determine the package directory to work with. It can be:
 * * --package odo-carousel
 * * -p carousel
 * * Or run from a subdirectory.
 */

const path = require('path');
const minimist = require('minimist');

module.exports = () => {
  const options = minimist(process.argv.slice(2));

  let packageName;

  // Gulp changes the current working directory to the one with the gulpfile.js
  // in it, then executes tasks.
  if (process.env.INIT_CWD.includes(`packages${path.sep}`)) {
    packageName = path.basename(process.env.INIT_CWD);
  } else if (options.package || options.p) {
    packageName = options.package || options.p;

    if (!packageName.startsWith('odo-')) {
      packageName = `odo-${packageName}`;
    }
  }

  if (!packageName) {
    throw new Error('Define a package to work with. Use the package option: --package odo-carousel. Or run `gulp` from the subdirectory.');
  }

  return path.join(process.cwd(), 'packages', packageName);
};
