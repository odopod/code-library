import math from './math';

const style = {
  /**
   * Gets the height and with of an element when the display is not none.
   * @param {Element} element Element to get size of.
   * @return {!{width: number, height: number}} Object with width/height.
   */
  getSize(element) {
    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  },

  /**
   * Parse string to return numerical value.
   * @param {string} value String of number
   * @return {number} Numerical value or 0 if parseFloat returns NaN
   */
  getFloat(value) {
    return parseFloat(value) || 0;
  },

  _getBox(element, property) {
    const props = window.getComputedStyle(element, null);
    return new math.Box(
      style.getFloat(props[property + 'Top']),
      style.getFloat(props[property + 'Right']),
      style.getFloat(props[property + 'Bottom']),
      style.getFloat(props[property + 'Left']));
  },

  getMarginBox(element) {
    return style._getBox(element, 'margin');
  },

  getPaddingBox(element) {
    return style._getBox(element, 'padding');
  },

  /**
   * Returns the size (width or height) of a list of elements, including margins.
   * @param {Array.<Element>} elements A real array of child elements.
   * @param {string} dimension Width or height.
   * @return {number}
   */
  getElementsSize(elements, dimension) {
    return elements.reduce((memo, el) => {
      const outerSize = style.getSize(el)[dimension];
      const margins = style.getMarginBox(el);
      const marginSize = dimension === 'height' ?
        margins.top + margins.bottom :
        margins.left + margins.right;

      return memo + outerSize + marginSize;
    }, 0);
  },

  // https://github.com/jquery/jquery/pull/764
  // http://stackoverflow.com/a/15717609/373422
  getWindowHeight() {
    const windowHeight = window.innerHeight;

    // Try to exclude the toolbars from the height on iPhone.
    // TODO: add isIPhone back when it's available
    // if (isIPhone) {
    //   let screenHeight = screen.height;
    //   let toolbarHeight = screenHeight - windowHeight;
    //   windowHeight = screenHeight - toolbarHeight;
    // }

    return windowHeight;
  },

  /**
   * Force the page to be repainted.
   */
  forceRedraw() {
    const tempStyleSheet = document.createElement('style');
    document.body.appendChild(tempStyleSheet);
    document.body.removeChild(tempStyleSheet);
  },

  /**
   * Ask the browser for a property that will cause it to recalculate styles
   * and layout the element (and possibly surrounding/parent elements).
   * @param {Element} element Element to for a layout for.
   * @return {number} Width of the element. If you actually need the width of
   *     element, use the `style.getSize` method.
   */
  causeLayout(element) {
    return element.offsetWidth;
  },

  /**
   * Determine which element in an array is the tallest.
   * @param {ArrayLike<Element>} elements Array-like of elements.
   * @return {number} Height of the tallest element.
   */
  _getTallest(elements) {
    let tallest = 0;

    for (let i = elements.length - 1; i >= 0; i--) {
      if (elements[i].offsetHeight > tallest) {
        tallest = elements[i].offsetHeight;
      }
    }

    return tallest;
  },

  /**
   * Set the height of every element in an array to a value.
   * @param {ArrayLike<Element>} elements Array-like of elements.
   * @param {string} height Height value to set.
   */
  _setAllHeights(elements, height) {
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].style.height = height;
    }
  },

  /**
   * For groups of elements which should be the same height. Using this method
   * will create far less style recalculations and layouts.
   * @param {ArrayLike.<ArrayLike.<Element>>} groups An array-like collection of
   *     an array-like collection of elements.
   * @return {number|Array.<number>} An array containing the pixel value of the
   *     tallest element for each group, or just a number if it's one group.
   */
  evenHeights(groups) {
    let list = Array.from(groups);

    // If the first item in the list is an element, then it needs to be wrapped
    // in an array so the rest of the methods will work.
    let isGroup = true;
    if (list[0] && list[0].nodeType) {
      isGroup = false;
      list = [list];
    }

    // First, reset the height for every element.
    // This is done first, otherwise we dirty the DOM on each loop!
    list.forEach((elements) => {
      style._setAllHeights(elements, '');
    });

    // Now, measure heights in each group and save the tallest value. Instead of
    // setting the height value for the entire group, save it. If it were set,
    // the next iteration in the loop would have to recalculate styles in the DOM
    const tallests = list.map(elements => style._getTallest(elements));

    // Lastly, set them all.
    list.forEach((elements, i) => {
      style._setAllHeights(elements, tallests[i] + 'px');
    });

    if (isGroup) {
      return tallests;
    }
    return tallests[0];
  },
};

export default style;
