/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const string = window.OdoHelpers.string;

describe('The string class', function stringy() {
  this.timeout(5000);

  // string.capitalize
  describe('that capitalizes strings', () => {
    it('should have an uppercase G', () => {
      expect(string.capitalize('foo')).to.equal('Foo');
    });

    it('should have an uppercase G', () => {
      expect(string.capitalize('FOO')).to.equal('FOO');
    });

    it('should have an uppercase G', () => {
      expect(string.capitalize('Foo')).to.equal('Foo');
    });
  });

  describe('the hyphenate method', () => {
    it('can turn camel case to dash case', () => {
      expect(string.hyphenate('MozBoxSizing')).to.equal('-moz-box-sizing');
      expect(string.hyphenate('marginLeft')).to.equal('margin-left');
      expect(string.hyphenate('WebkitTransform')).to.equal('-webkit-transform');
    });

    it('can handle incorrect IE prefixes', () => {
      expect(string.hyphenate('msTransform')).to.equal('-ms-transform');
    });

    it('can handle falsy values', () => {
      expect(string.hyphenate(false)).to.equal('');
      expect(string.hyphenate(null)).to.equal('');
      expect(string.hyphenate(undefined)).to.equal('');
    });
  });

  describe('the random string method', () => {
    it('provides a random string.', () => {
      expect(string.random()).to.be.a.string;
    });

    it('provides a unique string.', () => {
      const a = string.random();
      const b = string.random();
      const c = string.random();

      expect(a).to.not.equal(b);
      expect(a).to.not.equal(c);
      expect(b).to.not.equal(c);
    });
  });
});
