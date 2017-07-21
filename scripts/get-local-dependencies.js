const fs = require('fs');
const path = require('path');

const packageCache = new Map();

function isOdoDependency(dependency) {
  return dependency.startsWith('@odopod/odo-');
}

function getDirectoryFromPackageName(name) {
  return path.join(__dirname, '../packages/', name.replace('@odopod/', ''));
}

function getPackage(dirname) {
  const absolutePath = path.resolve(path.join(dirname, 'package.json'));
  if (packageCache.has(absolutePath)) {
    return packageCache.get(absolutePath);
  }

  const pkg = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  packageCache.set(absolutePath, pkg);

  return pkg;
}

function getDependencyArray(pkg, key) {
  if (pkg[key]) {
    return Object.keys(pkg[key]);
  }

  return [];
}

function getPackageDependencies(pkg) {
  return getDependencyArray(pkg, 'dependencies').concat(
      getDependencyArray(pkg, 'devDependencies'));
}

function getLocalDependencies(dirname) {
  return getPackageDependencies(getPackage(dirname)).filter(isOdoDependency);
}

function toSet(set, name) {
  set.add(name);
  const locals = getLocalDependencies(getDirectoryFromPackageName(name));
  return locals.reduce(toSet, set);
}

module.exports = function getDeepDependencies(dirname) {
  const unique = getLocalDependencies(dirname).reduce(toSet, new Set());
  return Array.from(unique);
};
