const dom = {

  /**
   * Retrieves the first child which is an element from a parent node.
   * @param {Element} node Parent node.
   * @return {?Element} The first element child or null if there isn't one.
   */
  getFirstElementChild(node) {
    return node.firstElementChild;
  },

  /**
   * Removes all children from a parent node.
   * @param {Element} element Parent node.
   */
  removeChildren(element) {
    element.textContent = '';
  },

  /**
   * Retrieves all children (excluding text nodes) for an element. `children` is
   * available in IE9+, but does not work for document fragments nor SVG.
   * @param {Element} element Parent node.
   * @return {!Array.<Element>} A real array of child elements.
   */
  getChildren(element) {
    return Array.from(element.children);
  },

  /**
   * Swaps element1 with element2 in the DOM.
   * @param {Element} elm1 first element.
   * @param {Element} elm2 second element.
   */
  swapElements(elm1, elm2) {
    if (!elm1 || !elm2) {
      return;
    }

    const parent1 = elm1.parentNode;
    const next1 = elm1.nextSibling;
    const parent2 = elm2.parentNode;
    const next2 = elm2.nextSibling;

    parent1.insertBefore(elm2, next1);
    parent2.insertBefore(elm1, next2);
  },

  /**
   * Set an id on an element if one doesn't exist.
   * @param {Element} element Element to give an id.
   * @param {function():string|string} fn Returns an id to set.
   */
  giveId(element, fn) {
    if (!element.id) {
      element.id = typeof fn === 'function' ? fn() : fn;
    }
  },

  /**
   * Ripped from: goog.testing.editor.dom.getRelativeDepth_.
   *
   * Returns the depth of the given node relative to the given parent node, or -1
   * if the given node is not a descendant of the given parent node. E.g. if
   * node == parentNode returns 0, if node.parentNode == parentNode returns 1,
   * etc.
   * @param {Node} node Node whose depth to get.
   * @param {Node} parentNode Node relative to which the depth should be
   *     calculated.
   * @return {number} The depth of the given node relative to the given parent
   *     node, or -1 if the given node is not a descendant of the given parent
   *     node.
   */
  getRelativeDepth(node, parentNode) {
    let depth = 0;
    let child = node;
    while (child) {
      if (child === parentNode) {
        return depth;
      }

      child = child.parentNode;
      depth += 1;
    }

    return -1;
  },

  /**
   * Retrieves the nth sibling of an element, or null if the would be nth sibling
   * does not exist. Heads up! This function excludes text nodes.
   * @param {Element} node Element to start looking from.
   * @param {number} n An integer representing the desired element relative to
   *     `node`. For example, `2` would look for `node.nextSibling.nextSibling`.
   * @param {boolean=} optIsForward Whether to look forwards or backwards. Default is true.
   * @return {?Element} The nth sibling or null.
   */
  getNthSibling(node, n, optIsForward) {
    const isForward = optIsForward !== false;
    let siblingCount = 0;
    let sibling = node;
    do {
      sibling = isForward ?
        sibling.nextElementSibling :
        sibling.previousElementSibling;
      siblingCount += 1;
    } while (sibling && siblingCount < n);
    return sibling;
  },

  /**
   * Returns a promise for interactive ready state / DOMContentLoaded event trigger
   * Page has finished loading but external resources are still loading
   * @type {Promise}
   */
  ready: new Promise((resolve) => {
    /* istanbul ignore if */
    if (document.readyState === 'interactive') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', function ready() {
        document.removeEventListener('DOMContentLoaded', ready);
        resolve();
      });
    }
  }),

  /**
   * Returns as promise for complete ready state / load event trigger
   * Page has completely finished loading
   * @type {Promise}
   */
  loaded: new Promise((resolve) => {
    /* istanbul ignore if */
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', function complete() {
        window.removeEventListener('load', complete);
        resolve();
      });
    }
  }),
};

export default dom;
