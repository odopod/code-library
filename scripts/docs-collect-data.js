const path = require('path');
const fs = require('fs-extra');
const getPackageDirectories = require('./get-package-directories');

const root = path.resolve(__dirname, '../');

function getShield(name, value, color) {
  return `https://img.shields.io/badge/${name}-${encodeURIComponent(value)}-${color}.svg`;
}

class Component {
  constructor(pkg, hasDemo, coverage) {
    const shortName = pkg.name.replace('@odopod/odo-', '');

    this.name = pkg.name.replace('@odopod/', '');
    this.scopedName = pkg.name;
    this.version = pkg.version;
    this.description = pkg.description;
    this.keywords = pkg.odoKeywords || [];
    this.shortName = shortName;
    this.niceName = shortName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    this.hasDemo = hasDemo;
    this.hasCoverage = !!coverage.coverage;
    this.coverage = coverage;
    this.watermark = this.getWatermark(this.coverage.coverage);
    this.isBeta = pkg.version.startsWith('0.');
    this.repo = pkg.homepage;
  }

  getKeywordBadge(keyword) {
    return getShield('tag', keyword, 'blue');
  }

  getCoveragePercentage(property) {
    if (property.total === 0) {
      return '100%';
    }

    return Math.round(property.covered / property.total * 1000) / 10 + '%';
  }

  getCoverageTotals(property) {
    return `(${property.covered} / ${property.total})`;
  }

  getCoverageBadge() {
    return getShield('coverage', `${this.coverage.coverage}%`, this.watermark);
  }

  getCoverageSummary() {
    const lines = {
      Statements: this.coverage.statements,
      Branches: this.coverage.branches,
      Functions: this.coverage.functions,
    };

    return Object.keys(lines).reduce((str, title) => {
      const pct = this.getCoveragePercentage(lines[title]);
      const totals = this.getCoverageTotals(lines[title]);
      const prefix = str ? '\n' : '';

      return `${str}${prefix}${title}: ${pct} ${totals}`;
    }, '');
  }

  getWatermark(percentage) {
    if (percentage >= 95) {
      return 'brightgreen';
    } else if (percentage >= 90) {
      return 'green';
    } else if (percentage >= 80) {
      return 'yellowgreen';
    } else if (percentage >= 50) {
      return 'yellow';
    } else if (percentage >= 30) {
      return 'orange';
    } else if (percentage >= 0) {
      return 'red';
    }
    return 'lightgrey';
  }

  static getAll() {
    return new Promise((resolve) => {
      getPackageDirectories.then((packages) => {
        const components = packages.map((dirname) => {
          const dirpath = path.join(root, 'packages', dirname);
          const pkg = fs.readJsonSync(path.join(dirpath, 'package.json'));
          const hasDemo = fs.existsSync(path.join(root, 'docs', dirname, 'index.html'));

          let coverage;
          try {
            coverage = fs.readJsonSync(path.join(dirpath, 'coverage.json'));
          } catch (e) {
            coverage = {};
          }

          return new Component(pkg, hasDemo, coverage);
        });

        resolve(components);
      });
    });
  }

  /**
   * Retrieve a unique array of odo keywords.
   * @param {Array.<Component>} components List of components.
   * @return {Array.<string>}
   */
  static getKeywords(components) {
    const keywords = new Set();
    components.forEach((component) => {
      component.keywords.forEach(keyword => keywords.add(keyword));
    });

    return Array.from(keywords);
  }
}

module.exports = Component;
