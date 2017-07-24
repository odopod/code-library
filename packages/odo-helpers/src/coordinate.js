class Coordinate {
  /**
   * Class for representing coordinates and positions.
   * @param {number} [x=0] Left, defaults to 0.
   * @param {number} [y=0] Top, defaults to 0.
   * @constructor
   */
  constructor(x = 0, y = 0) {
    /**
     * X-value
     * @type {number}
     */
    this.x = x;

    /**
     * Y-value
     * @type {number}
     */
    this.y = y;
  }

  /**
   * Returns a duplicate of this coordinate.
   * @return {Coordinate}
   */
  clone() {
    return new Coordinate(this.x, this.y);
  }

  /**
   * Scales this coordinate by the given scale factors. The x and y values are
   * scaled by {@code sx} and {@code optSy} respectively.  If {@code optSy}
   * is not given, then {@code sx} is used for both x and y.
   * @param {number} sx The scale factor to use for the x dimension.
   * @param {number=} optSy The scale factor to use for the y dimension.
   * @return {!Coordinate} This coordinate after scaling.
   */
  scale(sx, optSy = sx) {
    this.x *= sx;
    this.y *= optSy;
    return this;
  }

  /**
   * Translates this box by the given offsets. If a {@code Coordinate}
   * is given, then the x and y values are translated by the coordinate's x and y.
   * Otherwise, x and y are translated by {@code tx} and {@code opt_ty}
   * respectively.
   * @param {number|Coordinate} tx The value to translate x by or the
   *     the coordinate to translate this coordinate by.
   * @param {number} ty The value to translate y by.
   * @return {!Coordinate} This coordinate after translating.
   */
  translate(tx, ty) {
    if (tx instanceof Coordinate) {
      this.x += tx.x;
      this.y += tx.y;
    } else {
      this.x += tx;
      this.y += ty;
    }

    return this;
  }

  /**
   * Compares coordinates for equality.
   * @param {Coordinate} a A Coordinate.
   * @param {Coordinate} b A Coordinate.
   * @return {boolean} True iff the coordinates are equal, or if both are null.
   */
  static equals(a, b) {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    return a.x === b.x && a.y === b.y;
  }

  /**
   * Returns the distance between two coordinates.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {number} The distance between {@code a} and {@code b}.
   */
  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Returns the difference between two coordinates as a new Coordinate.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {!Coordinate} A Coordinate representing the difference
   *     between {@code a} and {@code b}.
   */
  static difference(a, b) {
    return new Coordinate(a.x - b.x, a.y - b.y);
  }

  /**
   * Returns the sum of two coordinates as a new Coordinate.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {!Coordinate} A Coordinate representing the sum of the two coordinates.
   */
  static sum(a, b) {
    return new Coordinate(a.x + b.x, a.y + b.y);
  }

  /**
   * Returns the product of two coordinates as a new Coordinate.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {!Coordinate} A Coordinate representing the product of the two coordinates.
   */
  static product(a, b) {
    return new Coordinate(a.x * b.x, a.y * b.y);
  }

  /**
   * Returns the quotient of two coordinates as a new Coordinate.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {!Coordinate} A Coordinate representing the quotient of the two coordinates.
   */
  static quotient(a, b) {
    return new Coordinate(a.x / b.x, a.y / b.y);
  }

  /**
   * Scales this coordinate by the given scale factors. This does not affect the
   * properites of the coordinate parameter.
   * @param {!Coordinate} a A Coordinate.
   * @param {number} sx The scale factor to use for the x dimension.
   * @param {number=} optSy The scale factor to use for the y dimension.
   * @return {!Coordinate} This coordinate after scaling.
   */
  static scale(a, sx, optSy = sx) {
    return new Coordinate(a.x * sx, a.y * optSy);
  }
}

export default Coordinate;
