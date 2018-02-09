/**
 * Check for Microsoft Edge string.
 * @param {string} userAgent The user agent string.
 * @return {boolean}
 */
export default function isEdge(userAgent) {
  return userAgent.includes('Edge/');
}
