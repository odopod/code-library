import getSize from './get-size';
import getMarginBox from './get-margin-box';

/**
 * Returns the size (width or height) of a list of elements, including margins.
 * @param {HTMLElement[]} elements An array of child elements (not a NodeList).
 * @param {string} dimension `'width'` or `'height'`.
 * @return {number}
 */
export default function getElementsSize(elements, dimension) {
  return elements.reduce((memo, el) => {
    const outerSize = getSize(el)[dimension];
    const margins = getMarginBox(el);
    const marginSize = dimension === 'height' ?
      margins.top + margins.bottom :
      margins.left + margins.right;

    return memo + outerSize + marginSize;
  }, 0);
}
