// Node v6 doesn't yet support the ES2017 dangling comma in functions.
/* eslint-disable comma-dangle */

const gulp = require('gulp');
const sequence = require('gulp-sequence').use(gulp);

gulp.task('compile', require('./gulp-tasks/compile'));
gulp.task('compile-specs', require('./gulp-tasks/compile-specs'));
gulp.task('compile-demo', require('./gulp-tasks/compile-demo'));
gulp.task('cover-instrument', require('./gulp-tasks/cover-instrument'));

// Execute the test runner with PhantomJS and capture the coverage in coverage.json
gulp.task('run-tests', require('./gulp-tasks/run-tests')(gulp));

// Create a report from coverage.json.
gulp.task('cover-report', require('./gulp-tasks/cover-report')(gulp));

// Create a summary of the summary report.
gulp.task('test-summary', require('./gulp-tasks/test-summary'));

// Run the code style checker against the eslint.
gulp.task('code-quality', require('./gulp-tasks/code-quality')(gulp));

gulp.task('set-watching', require('./gulp-tasks/set-watching'));

// Watch js files for changes. Webpack will re-bundle itself.
gulp.task('watcher', require('./gulp-tasks/watcher')(gulp));
gulp.task('test-watcher', require('./gulp-tasks/test-watcher')(gulp));

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
    'test-watcher',
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

gulp.task('test-run', (done) => {
  sequence('run-tests', 'cover-report', 'test-summary', done);
});

// Instrument the code, then run it through PhantomJS with Mocha.
gulp.task('instrument-run', (done) => {
  sequence('cover-instrument', 'test-run', done);
});

// Bundle the test file, then run the tests.
gulp.task('compile-specs-run', (done) => {
  sequence('compile-specs', 'test-run', done);
});

// Bundle test file, instrument the code, then run it through PhantomJS with Mocha.
gulp.task('test', (done) => {
  sequence('compile-specs', 'instrument-run', done);
});

gulp.task('all', (done) => {
  sequence(['build', 'test'], done);
});

gulp.task('default', (done) => {
  sequence('all', done);
});
