const path = require('path');
const config = require('../utils/config');

module.exports = gulp => () => {
  gulp.watch(path.join(config.pkgdir, 'src/**/*.js'), ['code-quality', 'compile']);
  gulp.watch([
    path.join(config.pkgdir, 'demos/**/*.js'),
    '!' + path.join(config.pkgdir, 'demos/**/demo.js'),
  ], ['compile-demo']);
};
