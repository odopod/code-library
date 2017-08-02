const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../css/odo-video.css',
      '../../../node_modules/classlist.js/classList.js',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../node_modules/screenfull/dist/screenfull.js',
      '../src/video.js',
      { pattern: '../src/*.js', included: false },
      'test.js',
    ],
  });
};
