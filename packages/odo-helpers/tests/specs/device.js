/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const OdoDevice = window.OdoDevice;
const DeviceHelpers = window.OdoHelpers.device;

describe('The device class', function devyce() {
  this.timeout(5000);

  // DeviceHelpers.getTranslate
  describe('gets translate strings for css transforms', () => {
    it('should be a regular transform', () => {
      expect(DeviceHelpers.getTranslate(0, '50%')).to.equal('translate(0,50%)');
    });

    it('should be zero zero', () => {
      expect(DeviceHelpers.getTranslate()).to.equal('translate(0,0)');
    });

    it('can have optional arguments', () => {
      expect(DeviceHelpers.getTranslate('5px')).to.equal('translate(5px,0)');
    });

    it('can have optional arguments', () => {
      expect(DeviceHelpers.getTranslate(undefined, '5px')).to.equal('translate(0,5px)');
    });
  });

  // POINTER EVENTS
  describe('gets the pointer event names', () => {
    describe('when there are no pointer events', () => {
      const hasPointers = OdoDevice.HAS_POINTER_EVENTS;

      beforeEach(() => {
        OdoDevice.HAS_POINTER_EVENTS = false;
      });

      afterEach(() => {
        OdoDevice.HAS_POINTER_EVENTS = hasPointers;
      });

      it('should return null', () => {
        expect(DeviceHelpers.getPointerEvent('pointercancel')).to.be.null;
        expect(DeviceHelpers.getPointerEvent('pointerdown')).to.be.null;
        expect(DeviceHelpers.getPointerEvent('pointermove')).to.be.null;
        expect(DeviceHelpers.getPointerEvent('pointerover')).to.be.null;
        expect(DeviceHelpers.getPointerEvent('pointerout')).to.be.null;
        expect(DeviceHelpers.getPointerEvent('pointerup')).to.be.null;
      });
    });

    describe('when there are pointer events', () => {
      const hasPointers = OdoDevice.HAS_POINTER_EVENTS;

      beforeEach(() => {
        OdoDevice.HAS_POINTER_EVENTS = true;
      });

      afterEach(() => {
        OdoDevice.HAS_POINTER_EVENTS = hasPointers;
      });

      it('should return unprefixed pointer events', () => {
        expect(DeviceHelpers.getPointerEvent('pointercancel')).to.be.equal('pointercancel');
        expect(DeviceHelpers.getPointerEvent('pointerdown')).to.be.equal('pointerdown');
        expect(DeviceHelpers.getPointerEvent('pointermove')).to.be.equal('pointermove');
        expect(DeviceHelpers.getPointerEvent('pointerover')).to.be.equal('pointerover');
        expect(DeviceHelpers.getPointerEvent('pointerout')).to.be.equal('pointerout');
        expect(DeviceHelpers.getPointerEvent('pointerup')).to.be.equal('pointerup');
      });
    });
  });
});
