const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../css/odo-background-video.css',
      '../node_modules/@odopod/odo-video/css/odo-video.css',
      '../../../node_modules/classlist.js/classList.js',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../node_modules/picturefill/dist/picturefill.min.js',
      '../node_modules/screenfull/dist/screenfull.js',
      '../node_modules/@odopod/odo-window-events/dist/odo-window-events.min.js',
      '../node_modules/@odopod/odo-object-fit/dist/odo-object-fit.min.js',
      '../node_modules/@odopod/odo-viewport/dist/odo-viewport.min.js',
      '../node_modules/@odopod/odo-responsive-images/dist/odo-responsive-images.min.js',
      'odo-video-mock.js',
      '../src/background-video.js',
      'test.js',
    ],
  });
};
