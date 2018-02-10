const path = require('path');
const config = require('./config');

module.exports = function getSimpleRollupOptions(filepath) {
  // Get the name without an underscore.
  const outputName = path.basename(filepath).replace('_', '');

  return {
    input: {
      input: path.join(config.pkgdir, filepath),
      plugins: config.main.input.plugins,
    },
    output: {
      file: path.join(config.pkgdir, path.dirname(filepath), outputName),
      format: 'iife',
    },
  };
};
