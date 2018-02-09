/**
 * Make an array of smaller arrays from an array.
 * @param {Array.<*>} array An array to take chunks from.
 * @param {number} size The number of items per chunk.
 * @return {Array.<Array.<*>>}
 */
export default function chunk(array, size) {
  if (!size) {
    return [];
  }

  const numArrays = Math.ceil(array.length / size);
  const chunked = new Array(numArrays);

  // eslint-disable-next-line no-plusplus
  for (let i = 0, index = 0; i < numArrays; index += size, i++) {
    chunked[i] = array.slice(index, index + size);
  }

  return chunked;
}
