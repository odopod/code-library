const gulp = require('gulp');

gulp.task('compile', require('./gulp-tasks/compile'));
gulp.task('compile-demo', require('./gulp-tasks/compile-demo'));

// Execute the test runner with PhantomJS and capture the coverage in coverage.json
gulp.task('run-tests', require('./gulp-tasks/run-tests'));

// Create a summary of the summary report.
gulp.task('test-summary', require('./gulp-tasks/test-summary'));

// Run the code style checker against the eslint.
gulp.task('code-quality', require('./gulp-tasks/code-quality')(gulp));

gulp.task('set-watching', require('./gulp-tasks/set-watching'));

// Watch js files for changes.
gulp.task('watcher', require('./gulp-tasks/watcher')(gulp));

gulp.task('build', gulp.parallel('code-quality', 'compile', 'compile-demo'));

gulp.task('test', gulp.series('run-tests', 'test-summary'));

gulp.task('all', gulp.series('build', 'test'));

// Watch source and demo files.
gulp.task('watch', gulp.series(
  'set-watching',
  'build',
  'watcher',
));

// Watch all files and re-run tests.
gulp.task('watch-test', gulp.series(
  'set-watching',
  'all',
  'watcher',
));

gulp.task('default', gulp.series('all'));
