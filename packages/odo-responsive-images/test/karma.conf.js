const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../css/odo-responsive-images.css',
      '1x1.jpg',
      '../../../node_modules/classlist.js/classList.min.js',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../node_modules/picturefill/dist/picturefill.min.js',
      '../../odo-viewport/node_modules/@odopod/odo-window-events/dist/odo-window-events.min.js',
      '../../odo-viewport/dist/odo-viewport.min.js',
      'odo-viewport-mock.js',
      '../src/responsive-images.js',
      'test.js',
    ],
  });
};
