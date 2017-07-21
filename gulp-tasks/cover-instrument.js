const config = require('../utils/config');
const bundle = require('../utils/bundle');

module.exports = () => bundle(config.instrumented);
