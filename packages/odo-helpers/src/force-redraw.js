/**
 * Force the page to be repainted.
 */
export default function forceRedraw() {
  const tempStyleSheet = document.createElement('style');
  document.body.appendChild(tempStyleSheet);
  document.body.removeChild(tempStyleSheet);
}
