import Box from './box';

/**
 * Parse string to return numerical value.
 * @param {string} value String of number
 * @return {number} Numerical value or 0 if parseFloat returns NaN
 */
function getFloat(value) {
  return parseFloat(value) || 0;
}

export default function getBox(element, property) {
  const props = window.getComputedStyle(element, null);
  return new Box(
    getFloat(props[property + 'Top']),
    getFloat(props[property + 'Right']),
    getFloat(props[property + 'Bottom']),
    getFloat(props[property + 'Left']),
  );
}
