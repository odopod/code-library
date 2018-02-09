/**
 * Creates a random string for IDs, etc.
 * http://stackoverflow.com/a/8084248/995529
 * @return {string} Random string.
 */
export default function random() {
  return Math.random().toString(36).substring(7);
}
