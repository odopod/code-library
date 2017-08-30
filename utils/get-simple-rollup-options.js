const path = require('path');
const config = require('./config');

module.exports = function getSimpleRollupOptions(filepath) {
  // Get the name without an underscore.
  const outputName = path.basename(filepath).replace('_', '');

  return {
    input: path.join(config.pkgdir, filepath),
    output: {
      file: path.join(config.pkgdir, path.dirname(filepath), outputName),
      format: 'iife',
    },
    plugins: config.main.plugins,
  };
};
