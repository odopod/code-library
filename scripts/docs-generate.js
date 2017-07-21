/* eslint-disable no-console */
console.time('Docs generated in');

const clean = require('./docs-clean');
const copy = require('./docs-copy-files');
const template = require('./docs-template');

clean()
  .then(copy)
  .then(template)
  .then(() => {
    console.timeEnd('Docs generated in');
  });
