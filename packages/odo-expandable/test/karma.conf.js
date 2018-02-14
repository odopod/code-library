const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../../../node_modules/classlist.js/classList.min.js',
      '../../../node_modules/element-closest/element-closest.js',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../../odo-device/dist/odo-device.min.js',
      '../../odo-helpers/dist/odo-helpers.min.js',
      '../../odo-window-events/dist/odo-window-events.min.js',
      '../src/expandable.js',
      'test.js',
    ],
  });
};
