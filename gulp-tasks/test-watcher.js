const path = require('path');
const { clearScreen } = require('ansi-escapes');
const config = require('../utils/config');

module.exports = (gulp) => {
  function clearScreenAndStart(task) {
    return () => {
      // Clear the console so it's easier to tell when the console has new output.
      process.stdin.write(clearScreen);
      gulp.start(task);
    };
  }

  return function testWatcher() {
    gulp.watch([
      path.join(config.pkgdir, 'src/**/*.js'),
    ], clearScreenAndStart('instrument-run'));

    gulp.watch([
      path.join(config.pkgdir, 'tests/**/*.js'),
      '!' + path.join(config.pkgdir, 'tests/**/specs.js'),
    ], clearScreenAndStart('compile-specs-run'));
  };
};
