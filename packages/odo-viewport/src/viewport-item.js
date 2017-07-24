class ViewportItem {
  /**
   * A viewport item represents an element being watched by the Viewport component.
   * @param {Object} options Viewport item options.
   * @param {Viewport} parent A reference to the viewport.
   * @constructor
   */
  constructor(options, parent) {
    this.parent = parent;
    this.id = Math.random().toString(36).substring(7);
    this.triggered = false;
    this.threshold = 200;
    this.isThresholdPercentage = false;

    // Override defaults with options.
    Object.assign(this, options);

    // The whole point is to have a callback function. Don't do anything if it's not given.
    if (typeof this.enter !== 'function') {
      throw new TypeError('Viewport.add :: No `enter` function provided in Viewport options.');
    }

    this.parseThreshold();

    this.hasExitCallback = typeof this.exit === 'function';

    // Cache element's offsets and dimensions.
    this.update();
  }

  // Use getter for `this.offset` so that the tests don't have to assign
  // a threshold and an offset.
  get offset() {
    return this.isThresholdPercentage ?
      this.threshold * this.parent.viewportHeight :
      this.threshold;
  }

  /**
   * Update offset and size values.
   */
  update() {
    const box = this.element.getBoundingClientRect();
    this.height = this.element.offsetHeight;
    this.width = this.element.offsetWidth;
    this.top = box.top + window.pageYOffset;
    this.left = box.left + window.pageXOffset;
    this.right = this.width + this.left;
    this.bottom = this.height + this.top;
  }

  /**
   * Determine the threshold setting.
   */
  parseThreshold() {
    const value = this.threshold;
    this.threshold = parseFloat(value);

    // Threshold can be a percentage. Parse it.
    if ((typeof value === 'string' && value.indexOf('%') > -1)) {
      this.isThresholdPercentage = true;
      this.threshold = this.threshold / 100;
    } else if (this.threshold < 1 && this.threshold > 0) {
      this.isThresholdPercentage = true;
    }
  }

  /**
   * Nullify references so they're garbage collected.
   */
  dispose() {
    this.element = null;
    this.enter = null;
    this.exit = null;
    this.parent = null;
  }
}

export default ViewportItem;
