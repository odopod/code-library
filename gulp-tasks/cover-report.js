const path = require('path');
const istanbulReport = require('gulp-istanbul-report');
const config = require('../utils/config');

module.exports = gulp => () => gulp.src(path.join(config.pkgdir, 'coverage/coverage.json'))
  .pipe(istanbulReport({
    dir: path.join(config.pkgdir, 'coverage'),
    reporters: ['html', 'json-summary', 'text-summary'],
  }));
