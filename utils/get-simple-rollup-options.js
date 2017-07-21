const path = require('path');
const config = require('./config');

module.exports = function getSimpleRollupOptions(filepath) {
  // Get the name without an underscore.
  const outputName = path.basename(filepath).replace('_', '');

  return {
    entry: path.join(config.pkgdir, filepath),
    dest: path.join(config.pkgdir, path.dirname(filepath), outputName),
    plugins: config.main.plugins,
    format: 'iife',
  };
};
