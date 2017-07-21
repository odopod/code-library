/**
 * Entry point into the Odo Module component. Exposes a single `register`
 * static property, which when called will register the given base selector
 * with the given module class and apply several static methods and properties.
 *
 * @author Nathan Buchar <nathan@odopod.com>
 */

import OdoModuleMethods from './module-methods';

/**
 * A map of all registered modules, keyed by the base selector. No two
 * registers may share the same base selector.
 * @type {Map}
 * @private
 */
const store = new Map();

/**
 * Determine the base selector for this module.
 * @param {Object} Module
 * @param {string} [selector]
 * @return {string} Updated selector string.
 * @throws {TypeError} If the selector cannot be determined.
 */
function getSelector(Module, selector) {
  // Verify that a base selector is defined.
  if (typeof selector === 'undefined') {
    if (Module.Selectors && Module.Selectors.BASE) {
      return Module.Selectors.BASE;
    }

    // Support both `ClassName` and `Classes` enumerations.
    const classes = Module.ClassName || Module.Classes;
    if (classes && classes.BASE) {
      return '.' + classes.BASE;
    }

    throw new TypeError('A base selector for this module must be specified.');
  }

  return selector;
}

/**
 * Ensure all required properties exist.
 * @param {Object} Module
 * @param {string} [selector]
 * @throws {TypeError} When something is missing.
 * @private
 */
function validate(Module, selector) {
  // Verify that the Module is an Object or Class.
  const type = Object.prototype.toString.call(Module);
  const isObject = type === '[object Object]';
  const isFunction = type === '[object Function]';
  if (!(isObject || isFunction)) {
    throw new TypeError(`Module must be an Function (class) or Object. Got "${typeof Module}".`);
  }

  // Verify that the module has not yet been registered.
  if (store.has(selector)) {
    throw new TypeError('The base selector for this module has already been registered. Please use a unique base selector.');
  }
}

/**
 * Adds static methods and internally registers the module.
 * @param {Object} Module
 * @param {string} [selector]
 * @return {Object} The module.
 */
function register(Module, selector) {
  const _selector = getSelector(Module, selector);

  validate(Module, _selector);

  const methods = OdoModuleMethods(Module, _selector);

  // Apply OdoModule static methods.
  Object.keys(methods).forEach((method) => {
    Module[method] = methods[method];
  });

  // Apply the OdoModule static property.
  Module.Instances = new Map();

  // Internally register the module.
  store.set(_selector, Module);

  return Module;
}

/**
 * Forget about this module. Currently leaves methods and instances as-is in
 * case they're needed.
 * @param {Object} Module
 * @param {string} [selector]
 */
function unregister(Module, selector) {
  const _selector = getSelector(Module, selector);

  // Internally unregister the module.
  store.delete(_selector, Module);
}

export default { register, unregister };
