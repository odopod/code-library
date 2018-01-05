const config = require('../utils/config');

module.exports = function setWatching(done) {
  config.watch = true;
  done();
};
