/**
 * Returns a promise which resolves when the window load event is fired, or
 * one which resolves immediately if that has already happened.
 * @type {Promise<void>}
 */
export default new Promise((resolve) => {
  /* istanbul ignore if */
  if (document.readyState === 'complete') {
    resolve();
  } else {
    window.addEventListener('load', function complete() {
      window.removeEventListener('load', complete);
      resolve();
    });
  }
});
