class Box {
  /**
   * Class for representing a box. A box is specified as a top, right, bottom,
   * and left. A box is useful for representing margins and padding.
   * @param {number} top Top.
   * @param {number} right Right.
   * @param {number} bottom Bottom.
   * @param {number} left Left.
   * @constructor
   */
  constructor(top, right, bottom, left) {
    /**
     * Top
     * @type {number}
     */
    this.top = top;

    /**
     * Right
     * @type {number}
     */
    this.right = right;

    /**
     * Bottom
     * @type {number}
     */
    this.bottom = bottom;

    /**
     * Left
     * @type {number}
     */
    this.left = left;
  }
}

class Rect {
  /**
   * Class for representing rectangular regions.
   * @param {number} x Left.
   * @param {number} y Top.
   * @param {number} w Width.
   * @param {number} h Height.
   * @constructor
   */
  constructor(x, y, w, h) {
    /**
     * Left
     * @type {number}
     */
    this.left = x;

    /**
     * Top
     * @type {number}
     */
    this.top = y;

    /**
     * Width
     * @type {number}
     */
    this.width = w;

    /**
     * Height
     * @type {number}
     */
    this.height = h;
  }

  /**
   * Returns whether two rectangles intersect. Two rectangles intersect if they
   * touch at all, for example, two zero width and height rectangles would
   * intersect if they had the same top and left.
   * @param {goog.math.Rect} a A Rectangle.
   * @param {goog.math.Rect} b A Rectangle.
   * @return {boolean} Whether a and b intersect.
   */
  static intersects(a, b) {
    return (a.left <= b.left + b.width && b.left <= a.left + a.width &&
      a.top <= b.top + b.height && b.top <= a.top + a.height);
  }
}

const math = {

  /**
   * Takes a number and clamps it to within the provided bounds.
   * @param {number} value The input number.
   * @param {number} min The minimum value to return.
   * @param {number} max The maximum value to return.
   * @return {number} The input number if it is within bounds, or the nearest
   *     number within the bounds.
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

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
  wrapAroundList(index, displacement, length) {
    return (index + displacement + length * 10) % length;
  },

  Box,

  Rect,

  /**
   * Add `right` and `bottom` properties to a rectangle. Normally this would be
   * done in the constructor, but to make integration into closure easier,
   * it is done in a separate method so the original goog.math.Rect is left unchanged.
   * @param {number} x Left.
   * @param {number} y Top.
   * @param {number} w Width.
   * @param {number} h Height.
   */
  getAugmentedRect(x, y, w, h) {
    const rect = new Rect(x, y, w, h);
    rect.right = rect.left + rect.width;
    rect.bottom = rect.top + rect.height;
    return rect;
  },

};

export default math;
