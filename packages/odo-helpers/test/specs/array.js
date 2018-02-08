/* global describe, it */
/* eslint-disable no-unused-expressions */

describe('The array class', () => {
  const { expect } = window.chai;
  const { OdoHelpers } = window;

  // OdoHelpers.closest
  describe('The closest in array helper', () => {
    const arr = [0, 100, 200, 300, 400, 500];

    it('Should get the closest value to what I give it', () => {
      expect(OdoHelpers.closest(arr, 180)).to.equal(200);
    });

    it('Should only find the closest number which is greater than itself', () => {
      expect(OdoHelpers.closestGreaterThan(arr, 1)).to.equal(100);
    });

    it('Should only find the closest number which is less than itself', () => {
      expect(OdoHelpers.closestLessThan(arr, 280)).to.equal(200);
    });

    it('should return null when there are no matches', () => {
      expect(OdoHelpers.closest([], 123)).to.equal(null);
      expect(OdoHelpers.closestGreaterThan(arr, 500)).to.equal(null);
      expect(OdoHelpers.closestGreaterThan(arr, 501)).to.equal(null);
      expect(OdoHelpers.closestLessThan(arr, 0)).to.equal(null);
      expect(OdoHelpers.closestLessThan(arr, -1)).to.equal(null);
    });
  });

  describe('the chunk method', () => {
    it('can chunk arrays', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(OdoHelpers.chunk(arr, 1)).to.deep.equal([
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
      expect(OdoHelpers.chunk(arr, 2)).to.deep.equal([
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
        [9, 10],
      ]);
      expect(OdoHelpers.chunk(arr, 3)).to.deep.equal([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10],
      ]);
      expect(OdoHelpers.chunk(arr, 4)).to.deep.equal([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10],
      ]);
      expect(OdoHelpers.chunk(arr, 5)).to.deep.equal([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
      ]);
      expect(OdoHelpers.chunk(arr, 10)).to.deep.equal([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      ]);
      expect(OdoHelpers.chunk(arr, 11)).to.deep.equal([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      ]);
    });

    it('can handle zero for size', () => {
      expect(OdoHelpers.chunk([1, 2, 3], 0)).to.deep.equal([]);
    });

    it('can handle empty arrays', () => {
      expect(OdoHelpers.chunk([], 3)).to.deep.equal([]);
    });
  });

  describe('the `pull` method', () => {
    it('can remove an item from an array', () => {
      const letters = ['a', 'b', 'c', 'd'];
      expect(OdoHelpers.pull(letters, 'c')).to.equal('c');
      expect(letters).to.deep.equal(['a', 'b', 'd']);

      const elements = [document, document.documentElement, document.body];
      OdoHelpers.pull(elements, document.documentElement);
      expect(elements).to.deep.equal([document, document.body]);
    });

    it('will not throw if trying to remove an item which does not exist', () => {
      const letters = ['a', 'b', 'c', 'd'];
      expect(OdoHelpers.pull(letters, 'e')).to.equal(null);
    });
  });
});
