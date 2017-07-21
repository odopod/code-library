#!/usr/bin/env node

const executeLocal = require('./execute-local');

// Call `yarn link ${package-name}` for every local package.
executeLocal('yarn link');
