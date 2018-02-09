import normalizeHash from './_normalize-hash';
import setHash from './set-hash';

/**
 * Updates the user's history with new hash
 * @param {string} newHash New hash, without `#`
 */
export default function replaceWithHash(newHash) {
  let hash = normalizeHash(newHash);
  if (window.history.replaceState) {
    hash = normalizeHash(hash);

    // If resetting the hash, the whole path is needed. `''` doesn't work.
    if (hash) {
      hash = '#' + hash;
    } else {
      hash = window.location.pathname + window.location.search;
    }

    window.history.replaceState({}, null, hash);
  } else {
    setHash(hash);
  }
}
