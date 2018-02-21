/**
 * Any method defined here will be automatically applied to all OdoModules.
 *
 * @author Nathan Buchar
 */

import { requestIdleCallback } from 'request-idle-callback';
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
   * @param {HTMLElement|HTMLElement[]|NodeList} elements
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
        throw new TypeError(`Expected HTML Element. Got "${Object.prototype.toString.call(element)}".`);
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
   * @param {HTMLElement|HTMLDocument} [context=document]
   * @param {Object} [options={}]
   * @returns {Map}
   */
  initializeAll(context = document, options = {}) {
    return Module.initialize(context.querySelectorAll(selector), options);
  },

  /**
   * Initialize all modules within a context when the browser has a moment of
   * idle time.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
   * @param {HTMLElement|HTMLDocument} [context]
   * @param {Object} [options]
   * @return {Promise.<Map>} A promise which resolves when the modules have been initialized.
   */
  initializeWhenIdle(context, options) {
    return new Promise((resolve) => {
      requestIdleCallback(() => {
        resolve(Module.initializeAll(context, options));
      });
    });
  },

  /**
   * Initializes all Module within the given context.
   * @param {HTMLElement|HTMLDocument} [context=document]
   */
  disposeAll(context = document) {
    arrayify(context.querySelectorAll(selector)).forEach((element) => {
      Module.deleteInstance(element);
    });
  },
});
