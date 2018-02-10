const { rollup } = require('rollup');

module.exports = function bundle(options) {
  const configs = Array.isArray(options) ? options : [options];

  // Create a bundle for each config.
  const bundles = configs.map(config => rollup(config.input).then((bundle) => {
    config.input.cache = bundle;
    return bundle.write(config.output);
  }));

  return Promise.all(bundles);
};
