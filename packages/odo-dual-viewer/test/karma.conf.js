const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../css/odo-dual-viewer.css',
      '../css/odo-dual-viewer-theme.css',
      '../../../node_modules/classlist.js/classList.min.js',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../node_modules/tiny-emitter/dist/tinyemitter.min.js',
      '../../odo-window-events/dist/odo-window-events.min.js',
      '../../odo-helpers/node_modules/@odopod/odo-device/dist/odo-device.min.js',
      '../../odo-helpers/dist/odo-helpers.min.js',
      '../../odo-draggable/node_modules/@odopod/odo-pointer/dist/odo-pointer.min.js',
      '../../odo-draggable/dist/odo-draggable.min.js',
      '../../odo-object-fit/dist/odo-object-fit.min.js',
      '../src/dual-viewer.js',
      { pattern: '../src/*.js', included: false },
      'test.js',
    ],
  });
};
