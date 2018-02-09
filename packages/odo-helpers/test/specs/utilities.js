/* global describe, it */
/* eslint-disable no-unused-expressions */


describe('The utilities', () => {
  const { expect } = window.chai;
  const { OdoHelpers } = window;

  describe('defaultsTo helper', () => {
    it('returns the original input', () => {
      expect(OdoHelpers.defaultsTo('foo', 'bar')).to.equal('foo');
      expect(OdoHelpers.defaultsTo(5, {})).to.equal(5);
      expect(OdoHelpers.defaultsTo('', 5)).to.equal('');
      expect(OdoHelpers.defaultsTo(false, 'bar')).to.equal(false);
      expect(OdoHelpers.defaultsTo(true, 'bar')).to.equal(true);
    });

    it('returns the default value', () => {
      expect(OdoHelpers.defaultsTo(undefined, 'foo')).to.equal('foo');
      expect(OdoHelpers.defaultsTo(undefined, 5)).to.equal(5);
      expect(OdoHelpers.defaultsTo(undefined, {})).to.eql({});
      expect(OdoHelpers.defaultsTo(undefined, false)).to.equal(false);
      expect(OdoHelpers.defaultsTo(undefined, true)).to.equal(true);

      expect(OdoHelpers.defaultsTo(null, 'foo')).to.equal('foo');
      expect(OdoHelpers.defaultsTo(null, 5)).to.equal(5);
      expect(OdoHelpers.defaultsTo(null, {})).to.eql({});
      expect(OdoHelpers.defaultsTo(null, false)).to.equal(false);
      expect(OdoHelpers.defaultsTo(null, true)).to.equal(true);
    });

    it('can use custom condition', () => {
      expect(OdoHelpers.defaultsTo('foo', 'bar', true)).to.equal('foo');
      expect(OdoHelpers.defaultsTo('foo', 'bar', false)).to.equal('bar');
      expect(OdoHelpers.defaultsTo('foo', 'bar', typeof 'foo' === 'string')).to.equal('foo');

      const fn = () => {};

      expect(OdoHelpers.defaultsTo(fn, 'bar', typeof fn === 'function')).to.equal(fn);
    });
  });

  describe('isString helper', () => {
    it('returns true if input is a string', () => {
      expect(OdoHelpers.isString('')).to.equal(true);
      expect(OdoHelpers.isString('foo')).to.equal(true);
      expect(OdoHelpers.isString('bar')).to.equal(true);
    });

    it('returns false if input is any other type of object', () => {
      expect(OdoHelpers.isString([])).to.equal(false);
      expect(OdoHelpers.isString({})).to.equal(false);
      expect(OdoHelpers.isString(() => {})).to.equal(false);
      expect(OdoHelpers.isString(123)).to.equal(false);
      expect(OdoHelpers.isString(true)).to.equal(false);
    });
  });

  describe('isDefined', () => {
    it('method knows what is up', () => {
      expect(OdoHelpers.isDefined(undefined)).to.equal(false);
      expect(OdoHelpers.isDefined(null)).to.equal(false);
      expect(OdoHelpers.isDefined({})).to.equal(true);
      expect(OdoHelpers.isDefined('')).to.equal(true);
      expect(OdoHelpers.isDefined(NaN)).to.equal(true);
    });
  });

  describe('noop', () => {
    it('does nothing', () => {
      expect(OdoHelpers.noop()).to.equal(undefined);
    });
  });

  describe('option getters', () => {
    it('can get number options', () => {
      expect(OdoHelpers.getNumberOption(5, 'foo')).to.equal(5);
      expect(OdoHelpers.getNumberOption('5', 10)).to.equal(5);
      expect(OdoHelpers.getNumberOption(5.2, 'foo')).to.equal(5.2);
      expect(OdoHelpers.getNumberOption('5.2', 'foo')).to.equal(5.2);
      expect(OdoHelpers.getNumberOption(undefined, 10)).to.equal(10);
      expect(OdoHelpers.getNumberOption(null, 10)).to.equal(10);
      expect(OdoHelpers.getNumberOption(NaN, 10)).to.equal(10);
      expect(OdoHelpers.getNumberOption({}, 10)).to.equal(10);
    });

    it('can get string options', () => {
      expect(OdoHelpers.getStringOption(5, 'foo')).to.equal('foo');
      expect(OdoHelpers.getStringOption('5', 10)).to.equal('5');
      expect(OdoHelpers.getStringOption(5.2, 'foo')).to.equal('foo');
      expect(OdoHelpers.getStringOption('5.2', 'foo')).to.equal('5.2');
      expect(OdoHelpers.getStringOption(undefined, 'bar')).to.equal('bar');
      expect(OdoHelpers.getStringOption(null, 'bar')).to.equal('bar');
      expect(OdoHelpers.getStringOption(NaN, 'bar')).to.equal('bar');
      expect(OdoHelpers.getStringOption({}, 'bar')).to.equal('bar');
    });

    it('can get percentage options', () => {
      expect(OdoHelpers.getPercentageOption('50%', '100%')).to.equal('50%');
      expect(OdoHelpers.getPercentageOption(null, '100%')).to.equal('100%');
      expect(OdoHelpers.getPercentageOption(undefined, '100%')).to.equal('100%');
      expect(OdoHelpers.getPercentageOption(10, '100%')).to.equal(10);
      expect(OdoHelpers.getPercentageOption(0.10, '100%')).to.equal(0.10);
    });
  });
});
