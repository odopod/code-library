const fs = require('fs');
const path = require('path');
const config = require('../utils/config');

module.exports = (cb) => {
  // Read in the summary file.
  fs.readFile(path.join(config.pkgdir, 'coverage/coverage-summary.json'), 'utf-8', (err, str) => {
    const data = JSON.parse(str);

    const summary = {
      lines: {
        total: data.total.lines.total,
        covered: data.total.lines.covered,
      },
      statements: {
        total: data.total.statements.total,
        covered: data.total.statements.covered,
      },
      functions: {
        total: data.total.functions.total,
        covered: data.total.functions.covered,
      },
      branches: {
        total: data.total.branches.total,
        covered: data.total.branches.covered,
      },
    };

    // Distill everything to a single number (to 1 decimal).
    const statementCoverage = summary.statements.covered / summary.statements.total * 100;
    summary.coverage = Math.round(statementCoverage * 10) / 10;

    // Write out to a file.
    fs.writeFile(path.join(config.pkgdir, 'coverage.json'), JSON.stringify(summary), (err) => {
      if (err) {
        throw err;
      }

      cb();
    });
  });
};
