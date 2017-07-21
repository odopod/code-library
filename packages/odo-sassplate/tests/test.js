const path = require('path');
const sassTrue = require('sass-true');
const jsonImporter = require('node-sass-json-importer');
const mocha = require('mocha');

const sassFile = path.join(__dirname, 'test.scss');
sassTrue.runSass({
  file: sassFile,
  importer: jsonImporter,
}, mocha.describe, mocha.it);
