/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const OdoDialog = window.OdoDialog;
const animation = window.OdoHelpers.animation;
const OdoDevice = window.OdoDevice;
const ScrollFix = OdoDialog.ScrollFix;

let clock;

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

beforeEach(() => {
  clock = sinon.useFakeTimers();

  function fake(el, fn, context) {
    setTimeout(() => {
      const target = el;
      fn.call(context, {
        target,
        currentTarget: target,
      });
    }, 0);
  }

  // Make onTransitionEnd and onAnimationEnd a zero timeout every time.
  sinon.stub(animation, 'onTransitionEnd').callsFake(fake);
  sinon.stub(animation, 'onAnimationEnd').callsFake(fake);

  sinon.stub(window, 'requestAnimationFrame').callsFake((fn) => {
    fn();
  });
});

afterEach(() => {
  animation.onTransitionEnd.restore();
  animation.onAnimationEnd.restore();
  window.requestAnimationFrame.restore();
  clock.restore();
});

describe('The ScrollFix Service', () => {
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

describe('The OdoDialog Component', () => {
  let fixtureElement;
  let instance;

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id, options) {
    fixtureElement = document.getElementById(id).cloneNode(true);
    document.body.appendChild(fixtureElement);
    instance = new OdoDialog(fixtureElement, options);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
      clock.tick(1);
    }

    document.body.removeChild(fixtureElement);
    fixtureElement = null;
    instance = null;
  }

  it('will throw an error if it does not receive an element', () => {
    expect(() => {
      new OdoDialog(null); // eslint-disable-line no-new
    }).to.throw(TypeError);
  });

  it('will add and remove to and from the `Instances` array', () => {
    expect(OdoDialog.Instances).to.have.lengthOf(0);

    createFixture('dialog-basic-fixture');
    const instance2 = new OdoDialog(fixtureElement);
    expect(OdoDialog.Instances).to.have.lengthOf(2);

    instance2.dispose();
    removeFixture();
    expect(OdoDialog.Instances).to.have.lengthOf(0);
  });

  it('will clear all dialog instances', () => {
    createFixture('dialog-basic-fixture');

    OdoDialog.disposeAll();
    expect(OdoDialog.Instances).to.have.lengthOf(0);
    removeFixture();
  });

  it('will initialize all dialogs', () => {
    const disposeAll = sinon.spy(OdoDialog, 'disposeAll');
    OdoDialog.initializeAll();
    expect(disposeAll.called).to.be.true;
    OdoDialog.disposeAll();
  });

  it('can determine when an element is visible', () => {
    expect(OdoDialog._isVisibleElement({
      offsetWidth: 0,
      offsetHeight: 0,
      getClientRects: () => [],
    })).to.equal(false);

    expect(OdoDialog._isVisibleElement({
      offsetWidth: 0,
      offsetHeight: 1,
      getClientRects: () => [],
    })).to.equal(true);

    expect(OdoDialog._isVisibleElement({
      offsetWidth: 1,
      offsetHeight: 0,
      getClientRects: () => [],
    })).to.equal(true);

    expect(OdoDialog._isVisibleElement({
      offsetWidth: 0,
      offsetHeight: 0,
      getClientRects: () => [{}],
    })).to.equal(true);
  });

  describe('basic dialog', () => {
    beforeEach(() => {
      createFixture('dialog-basic-fixture');
      OdoDevice.HAS_TRANSITIONS = true;
    });

    afterEach(() => {
      removeFixture();
    });

    it('can be retrieved by id', () => {
      expect(OdoDialog.getDialogById('dialog-basic-fixture')).to.equal(instance);
      expect(OdoDialog.getDialogById('foo')).to.equal(undefined);
      expect(instance.element).to.equal(instance.element);
    });

    it('can determine focusable elements', () => {
      // Has to be open before checkingn for focusable elements so that they're visible.
      instance.open();
      clock.tick(1);
      expect(OdoDialog._getFocusableChildren(instance.element)).to.have.lengthOf(2);
    });

    it('dialog will close when pressing ESC key', () => {
      const hide = sinon.stub(instance, 'close');

      instance.onKeyPress({ which: 27 });
      expect(hide.calledOnce).to.be.true;

      instance.onKeyPress({ which: 13 });
      expect(hide.calledOnce).to.be.true;
      hide.restore();
    });

    it('will trap focus when pressing TAB', () => {
      instance.open(true); // open sync

      const spy1 = sinon.spy();
      const spy2 = sinon.spy();

      const tab = {
        shiftKey: false,
        which: 9,
        preventDefault: spy1,
      };

      const shiftTab = {
        shiftKey: true,
        which: 9,
        preventDefault: spy2,
      };

      // There are 2 focusable elements in the basic fixture, an anchor and the
      // close button.
      const anchor = instance.element.querySelector('a');
      const button = instance.element.querySelector('button');

      // set focus because we're faking pressing the tab key, so
      // document.activeElement is not updated.
      instance.element.focus();
      instance.onKeyPress(tab); // focus on anchor
      expect(spy1.callCount).to.equal(0);

      anchor.focus();
      instance.onKeyPress(tab); // focus on close button
      expect(spy1.callCount).to.equal(0);

      button.focus();
      instance.onKeyPress(tab); // trap focus. Should still be on close button.
      expect(spy1.callCount).to.equal(1);

      button.focus();
      instance.onKeyPress(shiftTab); // focus on anchor.
      expect(spy2.callCount).to.equal(0);

      anchor.focus();
      instance.onKeyPress(shiftTab); // trap focus.
      expect(spy2.callCount).to.equal(1);
    });

    it('will open a dialog when trigger is pressed', () => {
      const open = sinon.stub(instance, 'open');
      const spy = sinon.spy();

      const button = document.body.querySelector('.odo-trigger');

      OdoDialog._handleTriggerClick({
        target: button,
        preventDefault: spy,
      });

      expect(spy.callCount).to.equal(1);
      expect(open.callCount).to.equal(1);

      OdoDialog._handleTriggerClick({
        target: document.body,
        preventDefault: spy,
      });

      expect(spy.callCount).to.equal(1);
      expect(open.callCount).to.equal(1);
    });

    it('will not try to close if already closed', () => {
      const spy = sinon.spy(instance, '_closed');
      expect(instance.isOpen).to.equal(false);
      instance.close(true);
      expect(spy.callCount).to.equal(0);
    });

    it('will not try to open if already opened', () => {
      const spy = sinon.spy(instance, '_opened');
      expect(instance.isOpen).to.equal(false);
      instance.isOpen = true;
      instance.open(true);
      expect(spy.callCount).to.equal(0);
      instance.isOpen = false;
    });

    it('can close with transition', () => {
      const next = sinon.spy(OdoDialog, '_nextFrame');
      const closed = sinon.spy(instance, '_closed');

      instance.open(true);
      expect(next.callCount).to.equal(0);
      expect(closed.callCount).to.equal(0);
      instance.close();
      expect(next.callCount).to.equal(1);
      expect(closed.callCount).to.equal(0);
      clock.tick(1);
      expect(next.callCount).to.equal(1);
      expect(closed.callCount).to.equal(1);
    });

    it('will not call focus() on the element which had focus before the dialog opened if it does not exist', () => {
      instance.open(true);
      OdoDialog.focusedBeforeDialog = null;
      const fn = () => {
        instance.close(true);
      };

      expect(fn).to.not.throw(Error);
    });

    it('will close the dialog if the main element is clicked', () => {
      const close = sinon.stub(instance, 'close');
      instance.onClick({ target: instance._content });
      expect(close.callCount).to.equal(0);

      instance.onClick({ target: instance.element });
      expect(close.callCount).to.equal(1);

      instance.options.dismissable = false;
      instance.onClick({ target: instance.element });
      expect(close.callCount).to.equal(1);
    });

    describe('scrollbar offsets', () => {
      const originalScrollbarWidth = OdoDialog.SCROLLBAR_WIDTH;

      afterEach(() => {
        OdoDialog.SCROLLBAR_WIDTH = originalScrollbarWidth;
      });

      it('zero when there is no scrollbar width', () => {
        OdoDialog.SCROLLBAR_WIDTH = 0;
        expect(instance._getScrollbarOffset()).to.equal(0);
      });

      it('zero when the body and dialog have scrollbars', () => {
        const element = instance.element;
        OdoDialog.SCROLLBAR_WIDTH = 20;
        instance._hasBodyScrollbar = true;
        instance.element = { scrollHeight: Infinity };
        expect(instance._getScrollbarOffset()).to.equal(0);

        instance.element = element;
      });

      it('SCROLLBAR_WIDTH when the body has a scrollbar, but the dialog does not', () => {
        const element = instance.element;

        OdoDialog.SCROLLBAR_WIDTH = 20;
        instance._hasBodyScrollbar = true;
        instance.element = { scrollHeight: 1 };
        expect(instance._getScrollbarOffset()).to.equal(20);

        instance.element = element;
      });

      it('zero when the body does not have a scrollbar', () => {
        OdoDialog.SCROLLBAR_WIDTH = 20;
        instance._hasBodyScrollbar = false;
        expect(instance._getScrollbarOffset()).to.equal(0);
      });

      it('will set `paddingRight` on the main element and body', () => {
        sinon.stub(instance, '_getScrollbarOffset').returns(20);

        OdoDialog.SCROLLBAR_WIDTH = 20;

        instance.open(true);
        expect(instance.element.style.paddingRight).to.equal('20px');
        expect(document.body.style.paddingRight).to.equal('20px');
      });

      it('will not set `paddingRight` on the main element and body when the offset/size is zero', () => {
        sinon.stub(instance, '_getScrollbarOffset').returns(0);

        OdoDialog.SCROLLBAR_WIDTH = 0;

        instance.open(true);
        expect(instance.element.style.paddingRight).to.equal('');
        expect(document.body.style.paddingRight).to.equal('');
      });
    });
  });

  describe('options', () => {
    afterEach(() => {
      removeFixture();
    });

    it('scrollableElement - will use the main element by default', () => {
      createFixture('dialog-basic-fixture', {});

      const spy = sinon.spy(OdoDialog.ScrollFix, 'add');

      instance._applyScrollFix();
      expect(spy.calledWith(instance.element)).to.equal(true);
      spy.restore();
    });

    it('scrollableElement - can use a selector', () => {
      createFixture('dialog-basic-fixture', {
        scrollableElement: '.odo-dialog__inner',
      });

      const element = instance.element.querySelector('.odo-dialog__inner');
      const spy = sinon.spy(OdoDialog.ScrollFix, 'add');

      instance._applyScrollFix();
      expect(spy.calledWith(element)).to.equal(true);
      spy.restore();
    });

    it('scrollableElement - can disable scroll fix', () => {
      createFixture('dialog-basic-fixture', {
        scrollableElement: null,
      });

      const spy = sinon.spy(OdoDialog.ScrollFix, 'add');

      instance._applyScrollFix();
      expect(spy.callCount).to.equal(0);
      spy.restore();
    });
  });
});
