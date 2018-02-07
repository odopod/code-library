const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../css/odo-dialog.css',
      '../../../node_modules/classlist.js/classList.min.js',
      '../../../node_modules/element-closest/element-closest.js',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../node_modules/tiny-emitter/dist/tinyemitter.min.js',
      '../../odo-device/dist/odo-device.min.js',
      '../../odo-helpers/dist/odo-helpers.min.js',
      '../src/dialog.js',
      { pattern: '../src/*.js', included: false },
      'test.js',
      'scroll-fix.test.js',
    ],
  });
};
