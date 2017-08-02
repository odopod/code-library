/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions, no-var */

function getFakeTouchEvent(x, y) {
  return {
    target: document.body,
    currentTarget: document.body,
    changedTouches: [
      {
        pageX: x,
        pageY: y,
      },
      {
        pageX: 200,
        pageY: 100,
      },
    ],
    preventDefault() {},
    stopPropagation() {},
  };
}

describe('The ScrollFix Service', () => {
  const sinon = window.sinon;
  const expect = window.chai.expect;
  const OdoDevice = window.OdoDevice;
  const OdoDialog = window.OdoDialog;
  const ScrollFix = OdoDialog.ScrollFix;
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    element.style.cssText = 'height:100px; width: 200px;';
    const inner = document.createElement('div');
    inner.style.cssText = 'height: 200px; width: 100%;';
    element.appendChild(inner);
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
    element = null;
  });

  describe('without touch events enabled', () => {
    const hasTouchEvents = OdoDevice.HAS_TOUCH_EVENTS;

    beforeEach(() => {
      OdoDevice.HAS_TOUCH_EVENTS = false;
    });

    afterEach(() => {
      OdoDevice.HAS_TOUCH_EVENTS = hasTouchEvents;
    });

    it('will not do anything', () => {
      const id = ScrollFix.add(element);
      expect(ScrollFix._fixes.size).to.equal(0);
      ScrollFix.remove(id);
    });
  });

  describe('with touch events enabled', () => {
    const hasTouchEvents = OdoDevice.HAS_TOUCH_EVENTS;

    beforeEach(() => {
      OdoDevice.HAS_TOUCH_EVENTS = true;
    });

    afterEach(() => {
      OdoDevice.HAS_TOUCH_EVENTS = hasTouchEvents;
    });

    it('will initialize ScrollFix', () => {
      const id = ScrollFix.add(element);

      expect(ScrollFix._fixes.size).to.equal(1);

      ScrollFix.remove(id);
    });

    it('can prevent default', () => {
      const id = ScrollFix.add(element);
      const instance = ScrollFix._fixes.get(id);
      const touchmove = getFakeTouchEvent(0, 0, 'touchmove');
      const spy = sinon.spy(touchmove, 'preventDefault');
      instance._preventDefault(touchmove);
      expect(spy.calledOnce).to.be.true;
      ScrollFix.remove(id);
    });

    it('will save touch start values', () => {
      const id = ScrollFix.add(element);
      const instance = ScrollFix._fixes.get(id);

      const touchstart = getFakeTouchEvent(100, 200, 'touchstart');
      instance._onTouchStart(touchstart);
      expect(instance.startY).to.equal(200);
      expect(instance.scrollY).to.equal(0);

      ScrollFix.remove(id);
    });

    it('will calculate values on touch move', () => {
      const id = ScrollFix.add(element);
      const instance = ScrollFix._fixes.get(id);
      let touchmove;
      let spyPrevent;
      let spyPropagation;

      // Set the first values.
      instance._onTouchStart(getFakeTouchEvent(100, 100, 'touchstart'));

      // Scroll up 30px (out of range).
      touchmove = getFakeTouchEvent(100, 130, 'touchmove');
      spyPrevent = sinon.spy(touchmove, 'preventDefault');
      spyPropagation = sinon.spy(touchmove, 'stopPropagation');
      instance._onTouchMove(touchmove);
      expect(spyPrevent.callCount).to.equal(1);
      expect(spyPropagation.callCount).to.equal(0);

      // Scroll down 10px (in range).
      touchmove = getFakeTouchEvent(100, 90, 'touchmove');
      spyPrevent = sinon.spy(touchmove, 'preventDefault');
      spyPropagation = sinon.spy(touchmove, 'stopPropagation');
      instance._onTouchMove(touchmove);
      expect(spyPrevent.callCount).to.equal(0);
      expect(spyPropagation.callCount).to.equal(1);

      // Move past total scroll height (200px).
      touchmove = getFakeTouchEvent(100, 301, 'touchmove');
      spyPrevent = sinon.spy(touchmove, 'preventDefault');
      spyPropagation = sinon.spy(touchmove, 'stopPropagation');
      instance._onTouchMove(touchmove);
      expect(spyPrevent.callCount).to.equal(1);
      expect(spyPropagation.callCount).to.equal(0);

      ScrollFix.remove(id);
    });
  });
});
