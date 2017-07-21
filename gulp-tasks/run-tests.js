const path = require('path');
const mochaPhantomJS = require('gulp-mocha-phantomjs');
const config = require('../utils/config');

module.exports = gulp => () => gulp.src(path.join(config.pkgdir, 'tests/runner.html'), { read: false })
  .pipe(mochaPhantomJS({
    phantomjs: {
      useColors: true,
      hooks: 'mocha-phantomjs-istanbul',
      coverageFile: path.join(config.pkgdir, 'coverage/coverage.json'),
    },
  }))

  // https://github.com/gulpjs/gulp/issues/259#issuecomment-61976830
  .on('error', function onerror(err) {
    if (config.watch) {
      console.error(err.message);
      this.emit('end');
    }
  });
