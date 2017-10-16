/**
 * @fileoverview A simple class for providing a stepping function for each
 * animation frame over a given length of time. Uses requestAnimationFrame
 * where available. Its API is similar to the AnimationPlayer in `Element.animate`.
 *
 * Assumes `requestAnimationFrame`, `Function.prototype.bind`, and `Object.assign`
 * are available.
 *
 * @author glen@odopod.com (Glen Cheney)
 */

function noop() {}

class Stepper {
  /**
   * Easy animation stepper.
   *
   * @param {Object} options Options object.
   * @param {number} options.start Starting number. Value to animate from.
   * @param {number} options.end Ending number. Value to animate to.
   * @param {function(number, number)} options.step Step function which will receive
   *     the step value and the current percentage completed.
   * @param {number} options.duration Length of the animation. Default is 250ms.
   * @param {Object} options.context The object scope to invoke the function in.
   * @param {Function} options.easing Easing function to apply.
   * @constructor
   */
  constructor(options) {
    this.options = Object.assign({}, Stepper.Defaults, options);

    /**
     * The percentage value which the scrubber and reveals will be animated to.
     * @type {number}
     * @private
     */
    this._animationAmount = this.options.end - this.options.start;

    /**
     * Time when the animation timer started.
     * @type {number}
     * @private
     */
    this._animationStart = +new Date();

    this._handler = this._animateLoop.bind(this);

    /**
     * Called at the end of the animation with `options.context`.
     * @type {Function}
     */
    this.onfinish = noop;

    // Start loop.
    this._requestId = requestAnimationFrame(this._handler);
  }

  /**
   * Internal loop ticker.
   * @private
   */
  _animateLoop() {
    const now = new Date().getTime();
    const remainingTime = this._animationStart + this.options.duration - now;

    // Even when duration is zero, this will result in Infinity, which will only
    // call the step method once then onfinish, which is desired.
    let percent = 1 - (remainingTime / this.options.duration);

    // Abort if already at or past 100%.
    if (percent >= 1) {
      // Make sure it always finishes with 1.
      this.options.step.call(this.options.context, this.options.end, 1);
      this.onfinish.call(this.options.context);
      this.dispose();
      return;
    }

    // Apply easing.
    percent = this.options.easing(percent);

    // Request animation frame.
    this._requestId = requestAnimationFrame(this._handler);

    // Tick.
    this.options.step.call(
      this.options.context,
      this.options.start + (this._animationAmount * percent), percent,
    );
  }

  /**
   * Stop the animation and dispose of it.
   */
  cancel() {
    cancelAnimationFrame(this._requestId);
    this.dispose();
  }

  /**
   * Destroy the animation instance.
   */
  dispose() {
    this._handler = null;
    this.options.context = null;
  }
}

Stepper.Defaults = {
  start: 0,
  end: 1,
  duration: 250,
  step: noop,
  context: window,
  easing(k) {
    return -0.5 * (Math.cos(Math.PI * k) - 1);
  },
};

export default Stepper;
