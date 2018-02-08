const path = require('path');
const eslint = require('gulp-eslint');
const config = require('../utils/config');

module.exports = gulp => () => {
  const stream = gulp.src(path.join(config.pkgdir, 'src/**/*.js'))
    .pipe(eslint({
      configFile: path.join(process.cwd(), '.eslintrc.json'),
    }))
    .pipe(eslint.format());

  // If not watching, end the stream after linting if there are errors.
  if (!config.watch) {
    return stream.pipe(eslint.failAfterError());
  }

  return stream;
};
