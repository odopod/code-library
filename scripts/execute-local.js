/* eslint-disable no-console */

const path = require('path');
const execSync = require('child_process').execSync;
const getLocalDependencies = require('./get-local-dependencies');
const getPackageDirectories = require('./get-package-directories');

const PACKAGE_DIR = path.join(process.cwd(), 'packages');
const stdio = 'inherit';

module.exports = (command) => {
  getPackageDirectories.then((packages) => {
    packages.forEach((dirname) => {
      const absolute = path.join(PACKAGE_DIR, dirname);
      console.log(`------------${dirname}------------`);
      getLocalDependencies(absolute).forEach((dep) => {
        execSync(`cd ${absolute} && ${command} ${dep}`, { stdio });
      });
    });
  });
};
