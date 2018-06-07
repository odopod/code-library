const path = require('path');
const fs = require('fs-extra');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const { terser } = require('rollup-plugin-terser');
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
const DIST_FILE_ESM = path.join(DIST_DIR, COMPONENT_NAME + '.esm.js');
const { external, globals } = getExternalDeps(PACKAGE_DIRECTORY);
const CLASS_NAME = getClassName(COMPONENT_NAME);

const COMMONJS_CONFIG = {
  include: /node_modules/,
};

const BABEL_CONFIG = {
  exclude: 'node_modules/**',
  presets: [
    ['babel-preset-env', { modules: false }],
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

const MINIFY_CONFIG = {
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
    input: {
      input: SOURCE,
      external,
      cache: undefined,
      plugins: [
        resolve(),
        commonjs(COMMONJS_CONFIG),
        babel(BABEL_CONFIG),
      ],
    },
    output: {
      name: CLASS_NAME,
      file: DIST_FILE,
      format: 'umd',
      sourcemap: true,
      globals,
    },
  },

  min: {
    input: {
      input: SOURCE,
      external,
      cache: undefined,
      plugins: [
        resolve(),
        commonjs(COMMONJS_CONFIG),
        babel(BABEL_CONFIG),
        terser(MINIFY_CONFIG),
      ],
    },
    output: {
      name: CLASS_NAME,
      file: DIST_FILE_MIN,
      format: 'umd',
      sourcemap: true,
      globals,
    },
  },

  esm: {
    input: {
      input: SOURCE,
      external,
      cache: undefined,
      plugins: [
        resolve(),
        commonjs(COMMONJS_CONFIG),
        babel(BABEL_CONFIG),
      ],
    },
    output: {
      name: CLASS_NAME,
      file: DIST_FILE_ESM,
      format: 'es',
      sourcemap: true,
      globals,
    },
  },

  instrumented: {
    cache: undefined,
    output: {
      name: CLASS_NAME,
      format: 'umd',
      sourcemap: 'inline',
      globals,
    },
    plugins: [
      resolve(),
      commonjs(COMMONJS_CONFIG),
      babel(BABEL_CONFIG_INSTRUMENTED),
    ],
    external,
  },
};

module.exports = config;
