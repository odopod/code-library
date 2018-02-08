export default class Box {
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
