#!/usr/bin/env node

const execSync = require('child_process').execSync;
const getLocalDependencies = require('./get-local-dependencies');

getLocalDependencies(process.cwd()).forEach((dep) => {
  execSync(`yarn link ${dep}`, { stdio: 'inherit' });
});
