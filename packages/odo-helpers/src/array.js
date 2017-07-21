const array = {

  /**
   * Given an array of numbers (`arr`), find the item in the array closest
   * to a given number (`num`).
   *
   * @param  {Array.<number>} arr An array of numbers.
   * @param  {number} num Close number to search from.
   * @return {?number} The closest number in the array.
   */
  closest(arr, num) {
    let closest = null;

    arr.reduce((closestDiff, value) => {
      const diff = Math.abs(value - num);
      if (diff < closestDiff) {
        closest = value;
        return diff;
      }

      return closestDiff;
    }, Infinity);

    return closest;
  },

  /**
   * Given an array of numbers (`arr`), find the item in the array closest
   * to a given number (`num`), while also less than (`num`).
   *
   * @param  {Array.<number>} arr An array of numbers.
   * @param  {number} num Close number to search from.
   * @return {?number} The closest number in the array.
   */
  closestLessThan(arr, num) {
    return array.closest(arr.filter(value => value < num), num);
  },

  /**
   * Given an array of numbers (`arr`), find the item in the array closest
   * to a given number (`num`), while also greater than (`num`).
   *
   * @param  {Array.<number>} arr An array of numbers.
   * @param  {number} num Close number to search from.
   * @return {?number} The closest number in the array.
   */
  closestGreaterThan(arr, num) {
    return array.closest(arr.filter(value => value > num), num);
  },

  /**
   * Make an array of smaller arrays from an array.
   * @param {Array.<*>} array An array to take chunks from.
   * @param {number} size The number of items per chunk.
   * @return {Array.<Array.<*>>}
   */
  chunk(array, size) {
    if (!size) {
      return [];
    }

    const numArrays = Math.ceil(array.length / size);
    const chunked = new Array(numArrays);

    // eslint-disable-next-line no-plusplus
    for (let i = 0, index = 0; i < numArrays; index += size, i++) {
      chunked[i] = array.slice(index, index + size);
    }

    return chunked;
  },

  /**
   * Finds and returns the longest word in an array of words.
   *
   * @param {Array.<string>} stringsArray An array containing individual strings.
   * @return {string} The longest word in the array.
   */
  getLongestString(stringsArray) {
    let currentLongestIndex = 0;

    for (let i = 1; i < stringsArray.length; i++) {
      if (stringsArray[i].length > stringsArray[currentLongestIndex].length) {
        currentLongestIndex = i;
      }
    }

    return stringsArray[currentLongestIndex];
  },

  /**
   * Remove an item from an array.
   * @param {Array.<*>} arr An array.
   * @param {*} item Thing to remove from the array.
   * @return {?*} The item which was removed or null.
   */
  remove(arr, item) {
    const index = arr.indexOf(item);
    if (index === -1) {
      return null;
    }

    arr.splice(index, 1);
    return item;
  },
};

export default array;
