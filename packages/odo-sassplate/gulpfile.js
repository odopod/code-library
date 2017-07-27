const fs = require('fs');
const path = require('path');
const sass = require('node-sass');
const gulp = require('gulp'); // eslint-disable-line
const mkdirp = require('mkdirp');
const jsonImporter = require('node-sass-json-importer');

const styleguide = require('@odopod/style-guide');

// Configure style guide
styleguide.configure({
  name: 'Odo Sassplate',
  client: 'Odopod',
  jsonSource: 'extensions',
  themeColor: '#ff4843',
  stylesheets: [
    'styles.css',
    'css/docs.css',
  ],
  dist: {
    markup: path.join(process.cwd(), 'dist'),
  },
});

function compile(done) {
  function logError(err, done) {
    console.error(err.message); // eslint-disable-line no-console
    console.log(err.file, 'on line', err.line); // eslint-disable-line no-console
    done(err);
  }

  sass.render({
    file: 'styles.scss',
    importer: jsonImporter,
  }, (err, result) => {
    if (err) {
      logError(err, done);
      return;
    }

    mkdirp('dist', (err) => {
      if (err) {
        logError(err, done);
        return;
      }

      fs.writeFile('dist/styles.css', result.css, (err) => {
        if (err) {
          logError(err, done);
          return;
        }

        done();
      });
    });
  });
}

gulp.task('compile', compile);
gulp.task('default', ['compile', 'style-guide']);

gulp.task('watch', ['compile'], () => {
  gulp.watch([
    'styles.scss',
    'components/*.scss',
    'global-rules/*.scss',
    'extensions/*.{scss,json}',
  ], ['compile']);
});
