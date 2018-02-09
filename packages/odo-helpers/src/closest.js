/**
 * Given an array of numbers (`arr`), find the item in the array closest
 * to a given number (`num`).
 *
 * @param  {Array.<number>} arr An array of numbers.
 * @param  {number} num Close number to search from.
 * @return {?number} The closest number in the array.
 */
export default function closest(arr, num) {
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
}
