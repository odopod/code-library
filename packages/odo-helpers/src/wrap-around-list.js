/**
 * Calculates the offset index for a circular list.
 * @param {number} index Starting index.
 * @param {number} displacement Offset from the starting index. Can be negative
 *     or positive. For example, -2 or 2.
 * @param {number} length Length of the list.
 * @return {number} The index of the relative displacement, wrapping around
 *     the end of the list to the start when the displacement is larger than
 *     what's left in the list.
 */
export default function wrapAroundList(index, displacement, length) {
  return (index + displacement + length * 10) % length;
}
