const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../../../node_modules/classlist.js/classList.min.js',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../../odo-scroll-animation/dist/odo-scroll-animation.min.js',
      '../../odo-window-events/dist/odo-window-events.min.js',
      '../src/sticky-headers.js',
      { pattern: '../src/*.js', included: false },
      'test.js',
    ],
  });
};
