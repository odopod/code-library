/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const OdoDevice = window.OdoDevice;

describe('The OdoDevice Component', function device() {
  this.timeout(4000);

  it('can prefix properties', () => {
    expect(OdoDevice.prefixed('color')).to.equal('color');

    // Get the property name when a specific value.
    expect(OdoDevice.prefixed('color', 'blue')).to.equal('color');

    // Get the property name with a specific value which doesn't exit.
    expect(OdoDevice.prefixed('position', 'foo')).to.equal(false);

    // Get the property name of something that doesn't exist.
    expect(OdoDevice.prefixed('odopod')).to.equal(false);

    // Hit cached values.
    expect(OdoDevice.prefixed('odopod')).to.equal(false);
  });

  it('can hyphenate camel cased strings', () => {
    expect(
      OdoDevice.hyphenate('WebkitTapHighlightColor'),
    ).to.equal('-webkit-tap-highlight-color');

    expect(OdoDevice.hyphenate('msTransform')).to.equal('-ms-transform');
  });

  it('will return an empty string when hyphenating a falsy value', () => {
    expect(OdoDevice.hyphenate(null)).to.equal('');
  });

  it('has properties', () => {
    expect(OdoDevice.HAS_TRANSITIONS).to.be.a('boolean');
    expect(OdoDevice.HAS_CSS_ANIMATIONS).to.be.a('boolean');
    expect(OdoDevice.HAS_TRANSFORMS).to.be.a('boolean');
    expect(OdoDevice.CAN_TRANSITION_TRANSFORMS).to.be.a('boolean');
    expect(OdoDevice.HAS_TOUCH_EVENTS).to.be.a('boolean');
    expect(OdoDevice.HAS_POINTER_EVENTS).to.be.a('boolean');
    expect(OdoDevice.HAS_LOCAL_STORAGE).to.be.a('boolean');
    expect(OdoDevice.Dom).to.be.an('object');
    expect(OdoDevice.Css).to.be.an('object');
  });
});
