/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const Coordinate = window.OdoHelpers.Coordinate;

describe('The Coordinate class', function coord() {
  this.timeout(5000);

  it('can initialize', () => {
    let c = new Coordinate();
    expect(c.x).to.equal(0);
    expect(c.y).to.equal(0);

    c = new Coordinate(null, 5);
    expect(c.x).to.equal(null);
    expect(c.y).to.equal(5);

    c = new Coordinate(undefined, null);
    expect(c.x).to.equal(0);
    expect(c.y).to.equal(null);

    c = new Coordinate(4, 3);
    expect(c.x).to.equal(4);
    expect(c.y).to.equal(3);

    c = new Coordinate(4);
    expect(c.x).to.equal(4);
    expect(c.y).to.equal(0);
  });

  it('can be compared', () => {
    const a = new Coordinate(1, 1);
    const b = new Coordinate(1, 1);
    const c = new Coordinate(2, 2);

    expect(Coordinate.equals(a, b)).to.be.true;
    expect(Coordinate.equals(b, a)).to.be.true;
    expect(Coordinate.equals(a, c)).to.be.false;
    expect(Coordinate.equals(b, c)).to.be.false;

    expect(Coordinate.equals('foo', 'foo')).to.be.true;
    expect(Coordinate.equals(null, a)).to.be.false;
    expect(Coordinate.equals(undefined, a)).to.be.false;
  });

  it('can get the distance between two points', () => {
    const a = new Coordinate(0, 0);
    const b = new Coordinate(3, 4);
    expect(Coordinate.distance(a, b)).to.equal(5);
  });

  it('can calculate the difference between two points', () => {
    const a = new Coordinate(0, 0);
    const b = new Coordinate(3, 4);
    const ret = Coordinate.difference(a, b);
    expect(Coordinate.equals(ret, new Coordinate(-3, -4))).to.be.true;
  });

  it('can calculate the sum between two points', () => {
    const a = new Coordinate(1, 1);
    const b = new Coordinate(3, 4);
    const ret = Coordinate.sum(a, b);
    expect(Coordinate.equals(ret, new Coordinate(4, 5))).to.be.true;
  });

  it('can calculate the product between two points', () => {
    const a = new Coordinate(0, 0);
    const b = new Coordinate(3, 4);
    const ret = Coordinate.product(a, b);
    expect(Coordinate.equals(ret, new Coordinate(0, 0))).to.be.true;
  });

  it('can calculate the quotient between two points', () => {
    const a = new Coordinate(100, 0);
    const b = new Coordinate(10, 20);
    const ret = Coordinate.quotient(a, b);
    expect(Coordinate.equals(ret, new Coordinate(10, 0))).to.be.true;
  });

  it('can scale a cooridinate without changing the original', () => {
    const a = new Coordinate(4, 4);
    let ret = Coordinate.scale(a, 2);
    expect(Coordinate.equals(ret, new Coordinate(8, 8))).to.be.true;
    expect(Coordinate.equals(a, new Coordinate(4, 4))).to.be.true;

    ret = Coordinate.scale(a, 2, 4);
    expect(Coordinate.equals(ret, new Coordinate(8, 16))).to.be.true;
    expect(Coordinate.equals(a, new Coordinate(4, 4))).to.be.true;
  });

  it('can clone itself', () => {
    const a = new Coordinate(4, 4);
    const clone = a.clone();
    expect(Coordinate.equals(clone, a)).to.be.true;

    clone.x = 10;
    clone.y = -2;

    expect(a.x).to.equal(4);
    expect(a.y).to.equal(4);
  });

  it('can scale itself', () => {
    const a = new Coordinate(4, 4);
    a.scale(0.5);
    expect(a.x).to.equal(2);
    expect(a.y).to.equal(2);

    a.scale(2, 4);
    expect(a.x).to.equal(4);
    expect(a.y).to.equal(8);
  });

  it('can translate itself', () => {
    const a = new Coordinate(4, 4);
    a.translate(10, 5);
    expect(a.x).to.equal(14);
    expect(a.y).to.equal(9);

    a.translate(new Coordinate(-10, -5));
    expect(a.x).to.equal(4);
    expect(a.y).to.equal(4);
  });
});
