/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const array = window.OdoHelpers.array;

describe('The array class', function arr() {
  this.timeout(5000);

  // array.closest
  describe('The closest in array helper', () => {
    const arr = [0, 100, 200, 300, 400, 500];

    it('Should get the closest value to what I give it', () => {
      expect(array.closest(arr, 180)).to.equal(200);
    });

    it('Should only find the closest number which is greater than itself', () => {
      expect(array.closestGreaterThan(arr, 1)).to.equal(100);
    });

    it('Should only find the closest number which is less than itself', () => {
      expect(array.closestLessThan(arr, 280)).to.equal(200);
    });

    it('should return null when there are no matches', () => {
      expect(array.closest([], 123)).to.equal(null);
      expect(array.closestGreaterThan(arr, 500)).to.equal(null);
      expect(array.closestGreaterThan(arr, 501)).to.equal(null);
      expect(array.closestLessThan(arr, 0)).to.equal(null);
      expect(array.closestLessThan(arr, -1)).to.equal(null);
    });
  });

  describe('the chunk method', () => {
    it('can chunk arrays', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(array.chunk(arr, 1)).to.deep.equal([
        [1],
        [2],
        [3],
        [4],
        [5],
        [6],
        [7],
        [8],
        [9],
        [10],
      ]);
      expect(array.chunk(arr, 2)).to.deep.equal([
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
        [9, 10],
      ]);
      expect(array.chunk(arr, 3)).to.deep.equal([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10],
      ]);
      expect(array.chunk(arr, 4)).to.deep.equal([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10],
      ]);
      expect(array.chunk(arr, 5)).to.deep.equal([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
      ]);
      expect(array.chunk(arr, 10)).to.deep.equal([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      ]);
      expect(array.chunk(arr, 11)).to.deep.equal([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      ]);
    });

    it('can handle zero for size', () => {
      expect(array.chunk([1, 2, 3], 0)).to.deep.equal([]);
    });

    it('can handle empty arrays', () => {
      expect(array.chunk([], 3)).to.deep.equal([]);
    });
  });

  describe('the longest string method', () => {
    it('can identify the longest string in a array of strings.', () => {
      const testArrayOfWords = ['foo', 'bar', 'text', 'testing'];

      const result = array.getLongestString(testArrayOfWords);
      expect(result).to.equal('testing');
    });
  });

  describe('the `remove` method', () => {
    it('can remove an item from an array', () => {
      const letters = ['a', 'b', 'c', 'd'];
      expect(array.remove(letters, 'c')).to.equal('c');
      expect(letters).to.deep.equal(['a', 'b', 'd']);

      const elements = [document, document.documentElement, document.body];
      array.remove(elements, document.documentElement);
      expect(elements).to.deep.equal([document, document.body]);
    });

    it('will not throw if trying to remove an item which does not exist', () => {
      const letters = ['a', 'b', 'c', 'd'];
      expect(array.remove(letters, 'e')).to.equal(null);
    });
  });
});
