/* istanbul ignore next */
export default function normalizeHash(hash) {
  if (typeof hash !== 'string') {
    throw new Error('Hash must be of type string');
  } else {
    return hash.replace(/^#/, '');
  }
}
