/* global describe, it */
/* eslint-disable no-unused-expressions */


describe('The math class', () => {
  const { expect } = window.chai;
  const { OdoHelpers } = window;

  // OdoHelpers.clamp
  describe('Clamping numbers', () => {
    it('should be the same', () => {
      expect(OdoHelpers.clamp(3, -5, 5)).to.equal(3);
      expect(OdoHelpers.clamp(5, -5, 5)).to.equal(5);
      expect(OdoHelpers.clamp(-5, -5, 5)).to.equal(-5);
    });

    it('should be the minimum', () => {
      expect(OdoHelpers.clamp(-22, -5, 5)).to.equal(-5);
    });

    it('should be the maximum', () => {
      expect(OdoHelpers.clamp(6, -5, 5)).to.equal(5);
    });
  });

  describe('the rectangle', () => {
    it('should initalize correctly', () => {
      const rect = new OdoHelpers.Rect(1, 2, 3, 4);
      expect(rect.left).to.equal(1);
      expect(rect.top).to.equal(2);
      expect(rect.width).to.equal(3);
      expect(rect.height).to.equal(4);
    });

    it('can calculate intersections', () => {
      const r0 = new OdoHelpers.Rect(10, 10, 20, 20);
      const r1 = new OdoHelpers.Rect(15, 15, 25, 25);
      const r2 = new OdoHelpers.Rect(0, 0, 1, 1);

      expect(OdoHelpers.Rect.intersects(r0, r1)).to.be.true;
      expect(OdoHelpers.Rect.intersects(r1, r0)).to.be.true;

      expect(OdoHelpers.Rect.intersects(r0, r2)).to.be.false;
      expect(OdoHelpers.Rect.intersects(r2, r0)).to.be.false;
    });

    it('can augment the rectangle', () => {
      const rect = new OdoHelpers.Rect(10, 10, 20, 20);
      expect(rect.right).to.equal(30);
      expect(rect.bottom).to.equal(30);
    });
  });

  describe('#wrapAroundList', () => {
    it('can have positive numbers', () => {
      expect(OdoHelpers.wrapAroundList(0, 1, 4)).to.equal(1);
      expect(OdoHelpers.wrapAroundList(0, 2, 4)).to.equal(2);
      expect(OdoHelpers.wrapAroundList(1, 1, 4)).to.equal(2);
      expect(OdoHelpers.wrapAroundList(2, 1, 4)).to.equal(3);
    });

    it('can have negative numbers', () => {
      expect(OdoHelpers.wrapAroundList(3, -1, 4)).to.equal(2);
      expect(OdoHelpers.wrapAroundList(2, -2, 4)).to.equal(0);
      expect(OdoHelpers.wrapAroundList(1, -1, 4)).to.equal(0);
    });

    it('can wrap around positive numbers', () => {
      expect(OdoHelpers.wrapAroundList(3, 1, 4)).to.equal(0);
      expect(OdoHelpers.wrapAroundList(3, 2, 4)).to.equal(1);
      expect(OdoHelpers.wrapAroundList(3, 3, 4)).to.equal(2);
      expect(OdoHelpers.wrapAroundList(2, 3, 4)).to.equal(1);

      // Multiple wraps
      expect(OdoHelpers.wrapAroundList(3, 6, 4)).to.equal(1);
      expect(OdoHelpers.wrapAroundList(2, 9, 4)).to.equal(3);
      expect(OdoHelpers.wrapAroundList(2, 10, 4)).to.equal(0);
    });

    it('can wrap around negative numbers', () => {
      expect(OdoHelpers.wrapAroundList(0, -1, 4)).to.equal(3);
      expect(OdoHelpers.wrapAroundList(1, -2, 4)).to.equal(3);
      expect(OdoHelpers.wrapAroundList(1, -3, 4)).to.equal(2);

      // Multiple wraps
      expect(OdoHelpers.wrapAroundList(3, -6, 4)).to.equal(1);
      expect(OdoHelpers.wrapAroundList(2, -9, 4)).to.equal(1);
      expect(OdoHelpers.wrapAroundList(2, -10, 4)).to.equal(0);
      expect(OdoHelpers.wrapAroundList(2, -11, 4)).to.equal(3);
    });
  });
});
