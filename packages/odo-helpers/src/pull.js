/**
 * Remove an item from an array.
 * @param {Array.<*>} arr An array.
 * @param {*} item Thing to remove from the array.
 * @return {?*} The item which was removed or null.
 */
export default function pull(arr, item) {
  const index = arr.indexOf(item);
  if (index === -1) {
    return null;
  }

  arr.splice(index, 1);
  return item;
}
