/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const utils = window.OdoHelpers.utilities;

describe('The utilities', function utility() {
  this.timeout(5000);

  describe('defaultsTo helper', () => {
    it('returns the original input', () => {
      expect(utils.defaultsTo('foo', 'bar')).to.equal('foo');
      expect(utils.defaultsTo(5, {})).to.equal(5);
      expect(utils.defaultsTo('', 5)).to.equal('');
      expect(utils.defaultsTo(false, 'bar')).to.equal(false);
      expect(utils.defaultsTo(true, 'bar')).to.equal(true);
    });

    it('returns the default value', () => {
      expect(utils.defaultsTo(undefined, 'foo')).to.equal('foo');
      expect(utils.defaultsTo(undefined, 5)).to.equal(5);
      expect(utils.defaultsTo(undefined, {})).to.eql({});
      expect(utils.defaultsTo(undefined, false)).to.equal(false);
      expect(utils.defaultsTo(undefined, true)).to.equal(true);

      expect(utils.defaultsTo(null, 'foo')).to.equal('foo');
      expect(utils.defaultsTo(null, 5)).to.equal(5);
      expect(utils.defaultsTo(null, {})).to.eql({});
      expect(utils.defaultsTo(null, false)).to.equal(false);
      expect(utils.defaultsTo(null, true)).to.equal(true);
    });

    it('can use custom condition', () => {
      expect(utils.defaultsTo('foo', 'bar', true)).to.equal('foo');
      expect(utils.defaultsTo('foo', 'bar', false)).to.equal('bar');
      expect(utils.defaultsTo('foo', 'bar', typeof 'foo' === 'string')).to.equal('foo');

      const fn = () => {};

      expect(utils.defaultsTo(fn, 'bar', typeof fn === 'function')).to.equal(fn);
    });
  });

  describe('isString helper', () => {
    it('returns true if input is a string', () => {
      expect(utils.isString('')).to.equal(true);
      expect(utils.isString('foo')).to.equal(true);
      expect(utils.isString('bar')).to.equal(true);
    });

    it('returns false if input is any other type of object', () => {
      expect(utils.isString([])).to.equal(false);
      expect(utils.isString({})).to.equal(false);
      expect(utils.isString(() => {})).to.equal(false);
      expect(utils.isString(123)).to.equal(false);
      expect(utils.isString(true)).to.equal(false);
    });
  });

  describe('isDefined', () => {
    it('method knows what is up', () => {
      expect(utils.isDefined(undefined)).to.equal(false);
      expect(utils.isDefined(null)).to.equal(false);
      expect(utils.isDefined({})).to.equal(true);
      expect(utils.isDefined('')).to.equal(true);
      expect(utils.isDefined(NaN)).to.equal(true);
    });
  });

  describe('noop', () => {
    it('does nothing', () => {
      expect(utils.noop()).to.equal(undefined);
    });
  });

  describe('option getters', () => {
    it('can get number options', () => {
      expect(utils.getNumberOption(5, 'foo')).to.equal(5);
      expect(utils.getNumberOption('5', 10)).to.equal(5);
      expect(utils.getNumberOption(5.2, 'foo')).to.equal(5.2);
      expect(utils.getNumberOption('5.2', 'foo')).to.equal(5.2);
      expect(utils.getNumberOption(undefined, 10)).to.equal(10);
      expect(utils.getNumberOption(null, 10)).to.equal(10);
      expect(utils.getNumberOption(NaN, 10)).to.equal(10);
      expect(utils.getNumberOption({}, 10)).to.equal(10);
    });

    it('can get string options', () => {
      expect(utils.getStringOption(5, 'foo')).to.equal('foo');
      expect(utils.getStringOption('5', 10)).to.equal('5');
      expect(utils.getStringOption(5.2, 'foo')).to.equal('foo');
      expect(utils.getStringOption('5.2', 'foo')).to.equal('5.2');
      expect(utils.getStringOption(undefined, 'bar')).to.equal('bar');
      expect(utils.getStringOption(null, 'bar')).to.equal('bar');
      expect(utils.getStringOption(NaN, 'bar')).to.equal('bar');
      expect(utils.getStringOption({}, 'bar')).to.equal('bar');
    });

    it('can get percentage options', () => {
      expect(utils.getPercentageOption('50%', '100%')).to.equal('50%');
      expect(utils.getPercentageOption(null, '100%')).to.equal('100%');
      expect(utils.getPercentageOption(undefined, '100%')).to.equal('100%');
      expect(utils.getPercentageOption(10, '100%')).to.equal(10);
      expect(utils.getPercentageOption(0.10, '100%')).to.equal(0.10);
    });
  });
});
