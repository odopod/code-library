const fs = require('fs');
const path = require('path');
const getClassName = require('./get-class-name');
const brand = require('./brand');

// Mapping of dependencies which export themselves differently than the name
// of the package.
const COMMON_GLOBALS = {
  jquery: 'jQuery',
  underscore: '_',
  lodash: '_',
  'tiny-emitter': 'TinyEmitter',
};

function getGlobalName(packageName) {
  if (packageName.startsWith(brand.npmUser)) {
    return getClassName(packageName);
  } else if (COMMON_GLOBALS[packageName]) {
    return COMMON_GLOBALS[packageName];
  }

  return packageName;
}

function accumulateGlobals(obj, name) {
  obj[name] = getGlobalName(name);
  return obj;
}

module.exports = (packageDirectory) => {
  function getJson(filepath) {
    return JSON.parse(fs.readFileSync(path.join(packageDirectory, filepath), 'utf-8'));
  }

  const pkg = getJson('package.json');
  let deps = {};

  // If there are dependencies listed in package.json, add them.
  if (pkg.dependencies) {
    deps = pkg.dependencies;
  }

  // Allow packages to be bundled with the component.
  try {
    const packagesToBundle = getJson('bundle.json');
    packagesToBundle.forEach((packageName) => {
      delete deps[packageName];
    });
  } catch (e) {
    // Ignore
  }

  // In case there is a new dependency which exposes itself differntly, allow
  // the above mapping to be added to.
  try {
    const customExternals = getJson('externals.json');
    Object.assign(COMMON_GLOBALS, customExternals);
  } catch (e) {
    // Ignore
  }

  // Figure out external dependencies which should not be bundled.
  const external = Object.keys(deps);
  const globals = external.reduce(accumulateGlobals, {});

  return {
    external,
    globals,
  };
};
