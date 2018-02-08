import normalizeHash from './_normalize-hash';

/**
 * Updates the browser's hash
 * @param {string} newHash New hash, without `#`
 */
export default function setHash(newHash) {
  const hash = normalizeHash(newHash);
  let st;

  // When resetting the hash with `''`, the page will scroll back to the top,
  // so we cache the current scroll position.
  if (!hash) {
    st = window.pageYOffset;
  }

  window.location.hash = hash;

  // Scroll back to the position from before.
  if (!hash) {
    window.scrollTo(0, st);
  }
}
