class Timer {
  /**
   * A simple timer class. The timer does not start automatically when
   * initialized.
   * @param {Function} fn Callback for when the timer expires.
   * @param {number} delay Timer length in milliseconds.
   * @param {boolean} [continuous] If true, the timer will automatically
   *     restart itself when it expires.
   * @constructor
   */
  constructor(fn, delay, continuous = false) {
    this.timerId = null;
    this.startTime = null;
    this.isPaused = false;
    this.isTicking = false;
    this.isContinuous = continuous;
    this.delay = delay;
    this.remaining = delay;
    this.fn = fn;

    this.resume = this.start;
    this.pause = this.stop;
  }

  /**
   * Starts ticking the timer.
   * @return {number|boolean} The remaining time or false if the timer is
   *     already ticking.
   */
  start() {
    if (this.isTicking) {
      return false;
    }

    this.startTime = Date.now();
    this.timerId = setTimeout(() => {
      this.fn();

      // If the timer wasn't stopped in the callback and this is a continuous
      // timer, start it again.
      if (!this.isPaused && this.isContinuous) {
        this.restart();
      } else {
        this.reset();
      }
    }, this.remaining);
    this.isTicking = true;
    this.isPaused = false;
    return this.remaining;
  }

  /**
   * Pauses the timer. Resuming will continue it with the remaining time.
   * @return {number} Time remaining.
   */
  stop() {
    this.clear();
    this.remaining -= Date.now() - this.startTime;
    this.isPaused = true;
    this.isTicking = false;
    return this.remaining;
  }

  /**
   * Sets time remaining to initial delay and clears timer.
   */
  reset() {
    this.remaining = this.delay;
    this.clear();
  }

  /**
   * Resets the timer to the original delay, clears the current timer, and
   * starts the timer again.
   */
  restart() {
    this.reset();
    this.resume();
  }

  /**
   * Clears timer.
   */
  clear() {
    clearTimeout(this.timerId);
    this.isPaused = false;
    this.isTicking = false;
  }

  /**
   * Destroy the timer.
   */
  dispose() {
    this.clear();
    this.fn = null;
  }
}

export default Timer;
