const { rollup } = require('rollup');

module.exports = function bundle(options) {
  const configs = Array.isArray(options) ? options : [options];

  // Create a bundle for each config.
  const bundles = configs.map(config => rollup(config).then((bundle) => {
    config.cache = bundle;
    return bundle.write(config);
  }));

  return Promise.all(bundles);
};
