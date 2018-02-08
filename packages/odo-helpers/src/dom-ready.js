/**
 * Returns a promise which resolves when the DOMContentLoaded event is fired, or
 * one which resolves immediately if that has already happened.
 * @type {Promise<void>}
 */
export default new Promise((resolve) => {
  /* istanbul ignore if */
  if (document.readyState === 'interactive') {
    resolve();
  } else {
    document.addEventListener('DOMContentLoaded', function ready() {
      document.removeEventListener('DOMContentLoaded', ready);
      resolve();
    });
  }
});
