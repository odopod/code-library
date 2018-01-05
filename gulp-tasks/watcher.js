const path = require('path');
const config = require('../utils/config');

module.exports = gulp => () => {
  gulp.watch(path.join(config.pkgdir, 'src/**/*.js'), gulp.parallel('code-quality', 'compile'));
  gulp.watch([
    path.join(config.pkgdir, 'demos/**/*.js'),
    '!' + path.join(config.pkgdir, 'demos/**/demo.js'),
  ], gulp.parallel('compile-demo'));
};
