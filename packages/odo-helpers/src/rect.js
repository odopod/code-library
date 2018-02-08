export default class Rect {
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
   * Right
   * @type {number}
   */
  get right() {
    return this.left + this.width;
  }

  /**
   * Bottom
   * @type {number}
   */
  get bottom() {
    return this.top + this.height;
  }

  /**
   * Returns whether two rectangles intersect. Two rectangles intersect if they
   * touch at all, for example, two zero width and height rectangles would
   * intersect if they had the same top and left.
   * @param {Rect} a A Rectangle.
   * @param {Rect} b A Rectangle.
   * @return {boolean} Whether a and b intersect.
   */
  static intersects(a, b) {
    return (a.left <= b.right && b.left <= a.right &&
      a.top <= b.bottom && b.top <= a.bottom);
  }
}
