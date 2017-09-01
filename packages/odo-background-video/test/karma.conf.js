const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../css/odo-background-video.css',
      '../../odo-video/css/odo-video.css',
      '../../../node_modules/classlist.js/classList.js',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../../odo-responsive-images/node_modules/picturefill/dist/picturefill.min.js',
      '../../odo-video/node_modules/screenfull/dist/screenfull.js',
      '../../odo-window-events/dist/odo-window-events.min.js',
      '../../odo-object-fit/dist/odo-object-fit.min.js',
      '../../odo-viewport/dist/odo-viewport.min.js',
      '../../odo-responsive-images/dist/odo-responsive-images.min.js',
      'odo-video-mock.js',
      '../src/background-video.js',
      'test.js',
    ],
  });
};
