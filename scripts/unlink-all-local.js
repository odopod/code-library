#!/usr/bin/env node

const executeLocal = require('./execute-local');

// Call `yarn unlink ${package-name}` for every local package.
executeLocal('yarn unlink');
