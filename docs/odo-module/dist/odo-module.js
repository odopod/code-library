(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.OdoModule = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var requestIdleCallback = function requestIdleCallback(cb) {
	  if (commonjsGlobal.requestIdleCallback) return commonjsGlobal.requestIdleCallback(cb);
	  var start = Date.now();
	  return setTimeout(function () {
	    cb({
	      didTimeout: false,
	      timeRemaining: function timeRemaining() {
	        return Math.max(0, 50 - (Date.now() - start));
	      }
	    });
	  }, 1);
	};

	var requestIdleCallback_2 = requestIdleCallback;

	/**
	 * Utilities for the Odo Module component.
	 *
	 * @author Nathan Buchar
	 */

	/**
	 * If the first parameter is not an array, return an array containing the
	 * first parameter.
	 *
	 * @author Glen Cheney <glen@odopod.com>
	 * @param {*} thing - Anything.
	 * @returns {Array.<*>} Array of things.
	 */
	function arrayify(thing) {
	  if (Array.isArray(thing)) {
	    return thing;
	  }

	  if (thing && typeof thing.length === 'number') {
	    return Array.from(thing);
	  }

	  return [thing];
	}

	/**
	 * Determine if the given item is an HTMLElement. Adapted from
	 * {@link http://stackoverflow.com/a/36894871/373422}
	 *
	 * @param {*} thing - Anything.
	 * @returns {boolean}
	 */
	function isHTMLElement(thing) {
	  return thing instanceof Element;
	}

	/**
	 * Any method defined here will be automatically applied to all OdoModules.
	 *
	 * @author Nathan Buchar
	 */

	var OdoModuleMethods = (function (Module, selector) {
	  return {
	    /**
	     * Gets the Module instance for a given element, if it has been created.
	     * Returns undefined if no instance was found for this element.
	     *
	     * @param {HTMLElement} element
	     * @returns {?Module}
	     */
	    getInstance: function getInstance(element) {
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
	    deleteInstance: function deleteInstance(element) {
	      var instance = Module.getInstance(element);

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
	    initialize: function initialize(elements) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	      if (typeof elements === 'undefined') {
	        throw new TypeError('Element(s) to initialize must be defined.');
	      }

	      var instances = new Map();

	      arrayify(elements).forEach(function (element) {
	        // Verify that the element is in fact an HTML Element.
	        if (!isHTMLElement(element)) {
	          throw new TypeError('Expected HTML Element. Got "' + Object.prototype.toString.call(element) + '".');
	        }

	        // Verify that an instance has not already been initialized for this element.
	        if (Module.Instances.has(element)) {
	          // eslint-disable-next-line no-console
	          console.warn('An instance has already been initialized for this element.');
	          return;
	        }

	        var instance = new Module(element, options);

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
	    initializeAll: function initializeAll() {
	      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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
	    initializeWhenIdle: function initializeWhenIdle(context, options) {
	      return new Promise(function (resolve) {
	        requestIdleCallback_2(function () {
	          resolve(Module.initializeAll(context, options));
	        });
	      });
	    },


	    /**
	     * Initializes all Module within the given context.
	     * @param {HTMLElement|HTMLDocument} [context=document]
	     */
	    disposeAll: function disposeAll() {
	      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

	      arrayify(context.querySelectorAll(selector)).forEach(function (element) {
	        Module.deleteInstance(element);
	      });
	    }
	  };
	});

	/**
	 * Entry point into the Odo Module component. Exposes a single `register`
	 * static property, which when called will register the given base selector
	 * with the given module class and apply several static methods and properties.
	 *
	 * @author Nathan Buchar
	 */

	/**
	 * A map of all registered modules, keyed by the base selector. No two
	 * registers may share the same base selector.
	 * @type {Map}
	 * @private
	 */
	var store = new Map();

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
	    var classes = Module.ClassName || Module.Classes;
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
	  var type = Object.prototype.toString.call(Module);
	  var isObject = type === '[object Object]';
	  var isFunction = type === '[object Function]';
	  if (!(isObject || isFunction)) {
	    throw new TypeError('Module must be an Function (class) or Object. Got "' + Object.prototype.toString.call(Module) + '".');
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
	  var _selector = getSelector(Module, selector);

	  validate(Module, _selector);

	  var methods = OdoModuleMethods(Module, _selector);

	  // Apply OdoModule static methods.
	  Object.keys(methods).forEach(function (method) {
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
	  var _selector = getSelector(Module, selector);

	  // Internally unregister the module.
	  store.delete(_selector);
	}

	var module$1 = { register: register, unregister: unregister };

	return module$1;

})));
//# sourceMappingURL=odo-module.js.map
