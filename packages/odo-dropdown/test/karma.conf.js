const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../css/odo-dropdown.css',
      '../../../node_modules/classlist.js/classList.min.js',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../node_modules/tiny-emitter/dist/tinyemitter.min.js',
      '../node_modules/@odopod/odo-device/dist/odo-device.min.js',
      '../node_modules/@odopod/odo-helpers/dist/odo-helpers.min.js',
      '../node_modules/@odopod/odo-base-component/dist/odo-base-component.min.js',
      '../src/dropdown.js',
      'test.js',
    ],
  });
};
