// Node v6 doesn't yet support the ES2017 dangling comma in functions.
/* eslint-disable comma-dangle */

const gulp = require('gulp');
const sequence = require('gulp-sequence').use(gulp);

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

// Watch source and demo files.
gulp.task('watch', (done) => {
  sequence(
    'set-watching',
    'build',
    'watcher',
    done
  );
});

// Watch all files and re-run tests.
gulp.task('watch-test', (done) => {
  sequence(
    'set-watching',
    'watcher',
    'all',
    done
  );
});

gulp.task('build', (done) => {
  sequence(
    ['code-quality', 'compile', 'compile-demo'],
    done
  );
});

gulp.task('test', (done) => {
  sequence('run-tests', 'test-summary', done);
});

gulp.task('all', (done) => {
  sequence(['build', 'test'], done);
});

gulp.task('default', (done) => {
  sequence('all', done);
});
