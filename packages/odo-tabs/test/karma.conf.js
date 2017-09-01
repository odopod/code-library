const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../css/odo-tabs.css',
      '../css/odo-tabs-theme.css',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../node_modules/tiny-emitter/dist/tinyemitter.min.js',
      '../../odo-helpers/node_modules/@odopod/odo-device/dist/odo-device.min.js',
      '../../odo-helpers/dist/odo-helpers.min.js',
      '../../odo-window-events/dist/odo-window-events.min.js',
      '../src/tabs.js',
      { pattern: '../src/*.js', included: false },
      'test.js',
    ],
  });
};
