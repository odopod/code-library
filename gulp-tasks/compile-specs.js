const getSimpleRollupOptions = require('../utils/get-simple-rollup-options');
const bundle = require('../utils/bundle');

module.exports = () => bundle(getSimpleRollupOptions('tests/_specs.js'));
