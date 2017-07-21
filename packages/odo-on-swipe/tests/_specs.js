/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const OdoOnSwipe = window.OdoOnSwipe;
const OdoPointer = window.OdoPointer;

describe('Odo On Swipe component', () => {
  let element;
  let instance;

  function createFixture(axis) {
    element = document.getElementById('fixture').cloneNode(true).firstElementChild;
    document.body.appendChild(element);

    instance = new OdoOnSwipe(element, () => {
      instance.swiped = true;
    }, axis);
  }

  afterEach(() => {
    if (instance.fn) {
      instance.dispose();
    }

    document.body.removeChild(element);
    element = null;
  });

  describe('with an undefined axis', () => {
    beforeEach(() => {
      createFixture();
    });

    it('should call the function if past threshold', () => {
      expect(instance.swiped).to.not.exist;

      instance._handlePointerEnd({
        velocity: {
          x: 0.7 + 0.1,
          y: 0,
        },
      });

      expect(instance.swiped).to.be.true;
    });

    it('should not call the function under the threshold', () => {
      expect(instance.swiped).to.not.exist;
      instance._handlePointerEnd({
        velocity: {
          x: 0.7 - 0.1,
          y: 0,
        },
      });

      expect(instance.swiped).to.not.exist;
    });

    it('will destroy the pointer when it is disposed of', () => {
      expect(instance.pointer._el).to.exist;
      expect(instance.fn).to.exist;
      instance.dispose();
      expect(instance.pointer._el).to.not.exist;
      expect(instance.fn).to.not.exist;
    });
  });

  describe('with a defined axis', () => {
    beforeEach(() => {
      createFixture(OdoPointer.Axis.BOTH);
    });

    it('should pass along the axis to OdoPointer', () => {
      expect(instance.pointer.axis).to.equal(OdoPointer.Axis.BOTH);
    });
  });
});
