/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const ScrollFeedback = window.OdoScrollFeedback;

describe('ScrollFeedback instance', () => {
  let instance;

  beforeEach(() => {
    instance = new ScrollFeedback(document.body);
  });

  afterEach(() => {
    instance.dispose();
    instance = null;
  });

  it('will return true when scrolled past a threshold', () => {
    expect(instance.canScroll).to.equal(true);

    expect(instance._intentToNavigate({
      x: 0,
      y: instance.options.movementThreshold,
    })).to.equal(false);

    expect(instance._intentToNavigate({
      x: 0,
      y: instance.options.movementThreshold + 1,
    })).to.equal(true);

    expect(instance._intentToNavigate({
      x: 10,
      y: 11,
    })).to.equal(true);

    expect(instance._intentToNavigate({
      x: 10,
      y: 10,
    })).to.equal(false);
  });

  it('will emit events', () => {
    const navigate = sinon.stub(instance, 'navigate');

    expect(instance.canScroll).to.equal(true);

    instance._triggerNavigation({
      x: 0,
      y: instance.options.movementThreshold + 1,
    });
    expect(navigate.callCount).to.equal(1);

    expect(instance.canScroll).to.equal(true);

    instance._triggerNavigation({
      x: 10,
      y: 11,
    });
    expect(navigate.callCount).to.equal(2);
  });

  it('can ignore events within desired elements', () => {
    const child = document.createElement('div');
    instance.element.appendChild(child);

    expect(instance._shouldIgnoreEvent(child)).to.be.false;

    instance.options.ignore = 'body';

    expect(instance._shouldIgnoreEvent(child)).to.be.true;

    instance.element.removeChild(child);
  });

  it('will exit early from the wheel handler if the target is to be ignored', () => {
    sinon.stub(instance, '_shouldIgnoreEvent').returns(true);
    instance.wheelTimeout = 'foo';
    instance._handleWheel({ target: 'bar' });
    expect(instance.wheelTimeout).to.equal('foo');
  });

  it('can handle wheel events', () => {
    sinon.stub(instance, '_intentToNavigate');
    const getDelta = sinon.stub(instance, '_getWheelDelta').returns({
      x: 0,
      y: -3,
    });
    const preventDefault = sinon.spy();
    const stopPropagation = sinon.spy();

    expect(instance.wheelAmount).to.deep.equal({
      x: 0,
      y: 0,
    });

    // Some of the properties from a Chrome WheelEvent.
    instance._handleWheel({
      deltaX: -0,
      deltaY: 1,
      deltaZ: 0,
      target: document.body,
      type: 'wheel',
      wheelDelta: -3,
      wheelDeltaX: 0,
      wheelDeltaY: -3,
      which: 1,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(1);
    expect(stopPropagation.callCount).to.equal(1);
    expect(instance.wheelAmount).to.deep.equal({
      x: 0,
      y: -3,
    });

    getDelta.returns({
      x: -3,
      y: 0,
    });

    // Horizontal movement.
    instance._handleWheel({
      deltaX: -1,
      deltaY: 0,
      deltaZ: 0,
      target: document.body,
      type: 'wheel',
      wheelDelta: -3,
      wheelDeltaX: -3,
      wheelDeltaY: 0,
      which: 1,
      preventDefault,
      stopPropagation,
    });

    // Prevent default should not be called to allow swipe-to-go-back|forward.
    expect(preventDefault.callCount).to.equal(1);
    expect(stopPropagation.callCount).to.equal(1);

    // Based on user scrolling, when there is intent to navigate
    instance._intentToNavigate.restore();
    const evt = {
      preventDefault: sinon.spy(),
      stopPropagation: sinon.spy(),
    };

    instance.wheelAmount = {
      x: 10,
      y: 11,
    };

    const triggerSpy = sinon.spy(instance, '_triggerNavigation');
    instance._handleWheel(evt);
    expect(triggerSpy.calledOnce).to.be.true;
  });

  it('starts a timer when the user begins scrolling which enables movement when it expires', () => {
    const clock = sinon.useFakeTimers();
    const spy = sinon.spy(instance, '_handleScrollTimerExpired');
    sinon.stub(instance, '_shouldIgnoreEvent').returns(false);
    sinon.stub(instance, '_intentToNavigate').returns(false);
    sinon.stub(instance, '_handleScrollEnd');
    sinon.stub(instance, '_getWheelDelta').returns({
      x: 2,
      y: 0,
    });

    instance.scrollTimeout = 'foo';
    instance._handleWheel({});
    expect(instance.scrollTimeout).to.not.equal('foo');
    clock.tick(instance.options.scrollTimerDelay);
    expect(spy.callCount).to.equal(1);
    clock.restore();
  });

  it('will not start a scroll timeout if it\'s paused', () => {
    sinon.stub(instance, '_shouldIgnoreEvent').returns(false);
    const getWheelDelta = sinon.stub(instance, '_getWheelDelta').returns({
      x: 2,
      y: 0,
    });

    const spy = sinon.spy(instance, '_intentToNavigate');
    instance.pause();
    instance._handleWheel({});
    expect(spy.callCount).to.equal(0);
    expect(getWheelDelta.callCount).to.equal(1);
  });

  it('can normalize wheel event data', () => {
    const evt = {
      deltaX: 0,
      deltaY: 20,
      deltaMode: 0,
    };

    // Support for modern browsers
    // ===========================
    const zeroDelta = {
      x: -0,
      y: -20,
    };

    expect(instance._getWheelDelta(evt)).to.deep.equal(zeroDelta);

    // test for delta mode in lines (e.deltaMode === 1)
    const evt2 = Object.assign({}, evt);
    const posDelta = Object.assign({}, zeroDelta);
    evt2.deltaMode = 1;
    posDelta.x *= ScrollFeedback.MOUSE_WHEEL_SPEED;
    posDelta.y *= ScrollFeedback.MOUSE_WHEEL_SPEED;
    expect(instance._getWheelDelta(evt2)).to.deep.equal(posDelta);

    // Support for Safari<8
    // ======================
    const evt3 = {
      wheelDeltaX: 0,
      wheelDeltaY: 20,
    };
    const safariDelta = Object.assign({}, zeroDelta);
    safariDelta.x = evt3.wheelDeltaX / 120 * ScrollFeedback.MOUSE_WHEEL_SPEED;
    safariDelta.y = evt3.wheelDeltaY / 120 * ScrollFeedback.MOUSE_WHEEL_SPEED;
    expect(instance._getWheelDelta(evt3)).to.deep.equal(safariDelta);
  });

  it('can handle wheel event delay', () => {
    // when there hasn't been a wheel event in xx ms
    // where xx is the scrollDelay
    const e = {
      preventDefault: sinon.spy(),
      stopPropagation: sinon.spy(),
    };
    const clock = sinon.useFakeTimers();
    const endSpy = sinon.spy(instance, '_handleScrollEnd');
    instance._handleWheel(e);
    clock.tick(instance.options.scrollTimerDelay);
    expect(endSpy.called).to.be.true;
    expect(instance.wheelTimeout).to.equal(null);
    clock.restore();
  });

  it('will store touchstart point', () => {
    instance._handleTouchStart({
      changedTouches: [{ pageX: 10, pageY: 300 }],
    });
    expect(instance.startPosition).to.deep.equal({ x: 10, y: 300 });
  });

  it('will exit early if it should ignore the element', () => {
    sinon.stub(instance, '_shouldIgnoreEvent').returns(true);
    const intentToNavigate = sinon.spy(instance, '_intentToNavigate');
    instance._handleTouchMove({});
    expect(intentToNavigate.callCount).to.equal(0);
  });

  it('will exit early and preventDefault if paused', () => {
    const preventDefault = sinon.spy();
    const intentToNavigate = sinon.spy(instance, '_intentToNavigate');
    instance.pause();
    sinon.stub(instance, '_shouldIgnoreEvent').returns(false);
    instance._handleTouchMove({ preventDefault });
    expect(preventDefault.callCount).to.equal(1);
    expect(intentToNavigate.callCount).to.equal(0);
  });

  it('will attempt to navigate on touchmove', () => {
    sinon.stub(instance, '_shouldIgnoreEvent').returns(false);
    const preventDefault = sinon.spy();
    const triggerNavigation = sinon.spy(instance, '_triggerNavigation');

    instance.startPosition = { x: 70, y: 300 };
    instance._handleTouchMove({
      preventDefault,
      changedTouches: [{ pageX: 50, pageY: 200 }],
    });

    expect(preventDefault.callCount).to.equal(1);
    expect(triggerNavigation.callCount).to.equal(1);
    expect(instance.canScroll).to.be.false;

    instance._resume();

    instance._handleTouchMove({
      preventDefault,
      changedTouches: [{ pageX: 70, pageY: 301 }],
    });
    expect(preventDefault.callCount).to.equal(1);
    expect(triggerNavigation.callCount).to.equal(1);
  });

  it('can handle keyboard input', () => {
    const preventDefault = sinon.spy();
    const stopPropagation = sinon.spy();
    const navigate = sinon.stub(instance, 'navigate');

    const KeyCodes = {
      SPACE: 32,
      PAGE_UP: 33,
      PAGE_DOWN: 34,
      END: 35,
      HOME: 36,
      UP: 38,
      DOWN: 40,
    };

    // navigating up
    instance._handleKeydown({
      which: KeyCodes.UP,
      shiftKey: false,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(1);
    expect(navigate.calledWith(ScrollFeedback.Direction.PREVIOUS)).to.be.true;
    navigate.reset();

    // navigating down
    instance._handleKeydown({
      which: KeyCodes.DOWN,
      shiftKey: false,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(2);
    expect(navigate.calledWith(ScrollFeedback.Direction.NEXT)).to.be.true;
    navigate.reset();

    instance._handleKeydown({
      which: KeyCodes.PAGE_DOWN,
      shiftKey: false,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(3);
    expect(navigate.calledWith(ScrollFeedback.Direction.NEXT)).to.be.true;
    navigate.reset();

    // navigating to beginning
    instance._handleKeydown({
      which: KeyCodes.HOME,
      shiftKey: false,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(4);
    expect(navigate.calledWith(ScrollFeedback.Direction.START)).to.be.true;
    navigate.reset();

    // navigating to end
    instance._handleKeydown({
      which: KeyCodes.END,
      shiftKey: false,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(5);
    expect(navigate.calledWith(ScrollFeedback.Direction.END)).to.be.true;
    navigate.reset();

    // no navigation should be triggered
    instance._handleKeydown({
      which: 5000,
      shiftKey: false,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(5);
    expect(navigate.called).to.be.false;
    navigate.reset();

    // SPACE KEY
    // ====================

    // without SHIFT key - navigating down
    instance._handleKeydown({
      which: KeyCodes.SPACE,
      shiftKey: false,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(6);
    expect(navigate.calledWith(ScrollFeedback.Direction.NEXT)).to.be.true;
    navigate.reset();

    // with SHIFT key - navigating up
    instance._handleKeydown({
      which: KeyCodes.SPACE,
      shiftKey: true,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(7);
    expect(navigate.calledWith(ScrollFeedback.Direction.PREVIOUS)).to.be.true;
    navigate.reset();

    // Paused - tries to navigate.
    instance.pause();
    instance._handleKeydown({
      which: KeyCodes.DOWN,
      shiftKey: false,
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault.callCount).to.equal(8);
    expect(navigate.callCount).to.equal(0);
    navigate.reset();
  });

  it('can be paused by the developer and the component will not resume itself', () => {
    instance.pause();
    expect(instance._isUserPaused).to.equal(true);
    expect(instance.canScroll).to.equal(false);

    instance._resume();
    expect(instance._isUserPaused).to.equal(true);
    expect(instance.canScroll).to.equal(false);

    instance.resume();
    expect(instance._isUserPaused).to.equal(false);
    expect(instance.canScroll).to.equal(true);
  });

  describe('a browser with EventListenerOptions', () => {
    const original = ScrollFeedback.PASSIVE_LISTENERS;
    let _instance;

    beforeEach(() => {
      ScrollFeedback.PASSIVE_LISTENERS = true;
      _instance = new ScrollFeedback(document.body);
    });
    afterEach(() => {
      ScrollFeedback.PASSIVE_LISTENERS = original;
      _instance.dispose();
    });

    it('will use `passive` option', () => {
      expect(_instance._listenerOptions).to.deep.equal({
        passive: false,
      });
    });
  });
});
