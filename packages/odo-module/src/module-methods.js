/**
 * Any method defined here will be automatically applied to all OdoModules.
 *
 * @author Nathan Buchar <nathan@odopod.com>
 */

import { arrayify, isHTMLElement } from './module-utils';

export default (Module, selector) => ({
  /**
   * Gets the Module instance for a given element, if it has been created.
   * Returns undefined if no instance was found for this element.
   *
   * @param {HTMLElement} element
   * @returns {?Module}
   */
  getInstance(element) {
    return Module.Instances.get(element);
  },

  /**
   * Removes a given module instance from the Instances Map and calls the
   * "dispose" method on the instance, if it is implemented. Returns true if
   * the module instance was removed, or false if no module instance
   * exists for the given element
   *
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  deleteInstance(element) {
    const instance = Module.getInstance(element);

    if (instance) {
      Module.Instances.delete(element);

      // Call the "dispose" method if it is implemented by the module.
      if (typeof instance.dispose === 'function') {
        instance.dispose();
      }

      return true;
    }

    return false;
  },

  /**
   * Initalize Components from an element, or an array or NodeList of
   * elements. Returns a Map of all instances created, keyed by their
   * respective base elements.
   *
   * @param {arrayLike<HTLMElement>|HTMLElement} elements
   * @param {Object} [options={}]
   * @returns {Map} instances
   */
  initialize(elements, options = {}) {
    if (typeof elements === 'undefined') {
      throw new TypeError('Element(s) to initialize must be defined.');
    }

    const instances = new Map();

    arrayify(elements).forEach((element) => {
      // Verify that the element is in fact an HTML Element.
      if (!isHTMLElement(element)) {
        throw new TypeError(`Expected HTML Element. Got "${typeof element}".`);
      }

      // Verify that an instance has not already been initialized for this element.
      if (Module.Instances.has(element)) {
        // eslint-disable-next-line no-console
        console.warn('An instance has already been initialized for this element.');
        return;
      }

      const instance = new Module(element, options);

      instances.set(element, instance);
      Module.Instances.set(element, instance);
    });

    return instances;
  },

  /**
   * Initializes all Module within the given context.
   * @param {Object} [context=document]
   * @param {Object} [options={}]
   * @returns {Map}
   */
  initializeAll(context = document, options = {}) {
    return Module.initialize(context.querySelectorAll(selector), options);
  },

  /**
   * Initializes all Module within the given context.
   * @param {Object} [context=document]
   */
  disposeAll(context = document) {
    arrayify(context.querySelectorAll(selector)).forEach((element) => {
      Module.deleteInstance(element);
    });
  },
});
