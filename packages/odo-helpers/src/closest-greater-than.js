import closest from './closest';

/**
 * Given an array of numbers (`arr`), find the item in the array closest
 * to a given number (`num`), while also greater than (`num`).
 *
 * @param  {Array.<number>} arr An array of numbers.
 * @param  {number} num Close number to search from.
 * @return {?number} The closest number in the array.
 */
export default function closestGreaterThan(arr, num) {
  return closest(arr.filter(value => value > num), num);
}
