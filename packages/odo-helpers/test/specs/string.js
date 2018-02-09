/* global describe, it */
/* eslint-disable no-unused-expressions */


describe('The string class', () => {
  const { expect } = window.chai;
  const { OdoHelpers } = window;

  // OdoHelpers.capitalize
  describe('that capitalizes strings', () => {
    it('should have an uppercase G', () => {
      expect(OdoHelpers.capitalize('foo')).to.equal('Foo');
    });

    it('should have an uppercase G', () => {
      expect(OdoHelpers.capitalize('FOO')).to.equal('FOO');
    });

    it('should have an uppercase G', () => {
      expect(OdoHelpers.capitalize('Foo')).to.equal('Foo');
    });
  });

  describe('the hyphenate method', () => {
    it('can turn camel case to dash case', () => {
      expect(OdoHelpers.hyphenate('MozBoxSizing')).to.equal('-moz-box-sizing');
      expect(OdoHelpers.hyphenate('marginLeft')).to.equal('margin-left');
      expect(OdoHelpers.hyphenate('WebkitTransform')).to.equal('-webkit-transform');
    });

    it('can handle incorrect IE prefixes', () => {
      expect(OdoHelpers.hyphenate('msTransform')).to.equal('-ms-transform');
    });

    it('can handle falsy values', () => {
      expect(OdoHelpers.hyphenate(false)).to.equal('');
      expect(OdoHelpers.hyphenate(null)).to.equal('');
      expect(OdoHelpers.hyphenate(undefined)).to.equal('');
    });
  });

  describe('the random string method', () => {
    it('provides a random OdoHelpers.', () => {
      expect(OdoHelpers.randomString()).to.be.a.string;
    });

    it('provides a unique OdoHelpers.', () => {
      const a = OdoHelpers.randomString();
      const b = OdoHelpers.randomString();
      const c = OdoHelpers.randomString();

      expect(a).to.not.equal(b);
      expect(a).to.not.equal(c);
      expect(b).to.not.equal(c);
    });
  });
});
