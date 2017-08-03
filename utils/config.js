const path = require('path');
const fs = require('fs-extra');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const getClassName = require('./get-class-name');
const getExternalDeps = require('./get-external-deps');
const getPackageDirectory = require('./get-package-directory');
const brand = require('./brand');

const PACKAGE_DIRECTORY = getPackageDirectory();
const pkg = fs.readJsonSync(path.join(PACKAGE_DIRECTORY, 'package.json'));
const DIST_DIR = path.join(PACKAGE_DIRECTORY, 'dist');
const COMPONENT_NAME = pkg.name.replace(`${brand.npmUser}/`, '');
const SOURCE = path.join(PACKAGE_DIRECTORY, pkg.odoModule);
const DIST_FILE = path.join(DIST_DIR, COMPONENT_NAME + '.js');
const DIST_FILE_MIN = path.join(DIST_DIR, COMPONENT_NAME + '.min.js');
const { external, globals } = getExternalDeps(PACKAGE_DIRECTORY);
const CLASS_NAME = getClassName(COMPONENT_NAME);

const COMMONJS_CONFIG = {
  include: /node_modules/,
};

const BABEL_CONFIG = {
  exclude: 'node_modules/**',
  presets: [
    ['babel-preset-es2015', { modules: false }],
  ],
  plugins: [
    ['babel-plugin-external-helpers'],

    // Support: IE10
    ['babel-plugin-transform-es2015-classes', { loose: true }],
    ['babel-plugin-transform-proto-to-assign'],
  ],
};

// Deep clone to break reference to the plugins array.
const BABEL_CONFIG_INSTRUMENTED = JSON.parse(JSON.stringify(BABEL_CONFIG));

// Add the istanbul plugin.
BABEL_CONFIG_INSTRUMENTED.plugins.push(['babel-plugin-istanbul']);

const UGLIFY_CONFIG = {
  sourceMap: true,
  compress: {
    warnings: true,
    drop_console: true,
  },
  mangle: true,
};

const config = {
  pkgdir: PACKAGE_DIRECTORY,
  componentName: COMPONENT_NAME,
  isProduction: false,

  watch: false,

  main: {
    entry: SOURCE,
    cache: undefined,
    plugins: [
      resolve(),
      commonjs(COMMONJS_CONFIG),
      babel(BABEL_CONFIG),
    ],
    dest: DIST_FILE,
    sourceMap: true,
    moduleName: CLASS_NAME,
    format: 'umd',
    globals,
    external,
  },

  min: {
    entry: SOURCE,
    cache: undefined,
    plugins: [
      resolve(),
      commonjs(COMMONJS_CONFIG),
      babel(BABEL_CONFIG),
      uglify(UGLIFY_CONFIG),
    ],
    dest: DIST_FILE_MIN,
    sourceMap: true,
    moduleName: CLASS_NAME,
    format: 'umd',
    globals,
    external,
  },

  instrumented: {
    cache: undefined,
    plugins: [
      resolve(),
      commonjs(COMMONJS_CONFIG),
      babel(BABEL_CONFIG_INSTRUMENTED),
    ],
    sourceMap: 'inline',
    moduleName: CLASS_NAME,
    format: 'umd',
    globals,
    external,
  },
};

module.exports = config;
