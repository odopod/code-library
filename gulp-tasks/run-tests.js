const path = require('path');
const execa = require('execa');
const config = require('../utils/config');

// Run karma in a new process because running it via `new Server()` stalls for
// ~30 seconds after the test suite has finished.
// https://github.com/karma-runner/karma/issues/1788

module.exports = () => execa('karma', [
  'start',
  path.join(config.pkgdir, 'test/karma.conf.js'),
  config.watch ? '--no-single-run' : '',
  '--package',
  config.componentName,
], { stdio: 'inherit' });
