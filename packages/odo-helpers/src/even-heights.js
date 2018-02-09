/**
 * Determine which element in an array is the tallest.
 * @param {ArrayLike<Element>} elements Array-like of elements.
 * @return {number} Height of the tallest element.
 */
function getTallest(elements) {
  let tallest = 0;

  for (let i = elements.length - 1; i >= 0; i--) {
    if (elements[i].offsetHeight > tallest) {
      tallest = elements[i].offsetHeight;
    }
  }

  return tallest;
}

/**
 * Set the height of every element in an array to a value.
 * @param {ArrayLike<Element>} elements Array-like of elements.
 * @param {string} height Height value to set.
 */
function setAllHeights(elements, height) {
  for (let i = elements.length - 1; i >= 0; i--) {
    elements[i].style.height = height;
  }
}

/**
 * For groups of elements which should be the same height. Using this method
 * will create far less style recalculations and layouts.
 * @param {ArrayLike.<ArrayLike.<Element>>} groups An array-like collection of
 *     an array-like collection of elements.
 * @return {number|Array.<number>} An array containing the pixel value of the
 *     tallest element for each group, or just a number if it's one group.
 */
export default function evenHeights(groups) {
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
    setAllHeights(elements, '');
  });

  // Now, measure heights in each group and save the tallest value. Instead of
  // setting the height value for the entire group, save it. If it were set,
  // the next iteration in the loop would have to recalculate styles in the DOM
  const tallests = list.map(elements => getTallest(elements));

  // Lastly, set them all.
  list.forEach((elements, i) => {
    setAllHeights(elements, tallests[i] + 'px');
  });

  if (isGroup) {
    return tallests;
  }
  return tallests[0];
}
