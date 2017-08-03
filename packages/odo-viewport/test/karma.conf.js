const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../node_modules/@odopod/odo-window-events/dist/odo-window-events.min.js',
      '../src/viewport.js',
      { pattern: '../src/*.js', included: false },
      'test.js',
    ],
  });
};
