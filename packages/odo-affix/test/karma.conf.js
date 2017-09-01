const sharedConfig = require('../../../karma.conf.js');

module.exports = (config) => {
  sharedConfig(config);
  config.set({
    files: [
      'fixtures/*',
      '../../../node_modules/babel-polyfill/dist/polyfill.min.js',
      '../../../node_modules/chai/chai.js',
      '../../../node_modules/sinon/pkg/sinon.js',
      '../../odo-scroll-animation/dist/odo-scroll-animation.js',
      '../../odo-window-events/dist/odo-window-events.js',
      '../src/affix.js',
      'test.js',
    ],
  });
};
