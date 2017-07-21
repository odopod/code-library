/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;

const Coordinate = window.OdoHelpers.Coordinate;
const EventType = window.OdoHelpers.events;

const OdoDevice = window.OdoDevice;
const Pointer = window.OdoPointer;

function getFakeMouseEvent(x, y, type = EventType.MOUSEMOVE,
  target = document.body, currentTarget = 'foo') {
  return {
    type,
    target,
    currentTarget,
    pageX: x,
    pageY: y,
    button: 0,
    preventDefault: sinon.spy(),
  };
}

function getFakeTouchEvent(x, y, type = EventType.TOUCHMOVE,
  target = document.body, currentTarget = 'foo') {
  return {
    type,
    target,
    currentTarget,
    changedTouches: [
      {
        pageX: x,
        pageY: y,
      }, {
        pageX: 200,
        pageY: 100,
      },
    ],
    preventDefault: sinon.spy(),
  };
}

function getFakePointerEvent(x, y, type = EventType.POINTERMOVE,
  target = document.body, currentTarget = 'foo') {
  return {
    type,
    target,
    currentTarget,
    button: 0,
    pageX: x,
    pageY: y,
    pointerId: 1,
    preventDefault: sinon.spy(),
  };
}

describe('The pointer component', function d() {
  this.timeout(5000);

  let instance;
  const propertyName = Pointer.TouchActionSupport[Pointer.Axis.BOTH];

  beforeEach(() => {
    Pointer.TouchActionSupport[Pointer.Axis.BOTH] = false;
  });

  afterEach(() => {
    Pointer.TouchActionSupport[Pointer.Axis.BOTH] = propertyName;
    if (instance && instance.element) {
      instance.dispose();
    }
  });

  it('will initialize', () => {
    instance = new Pointer(document.body);
    expect(instance.element).to.equal(document.body);
    expect(instance.axis).to.equal(Pointer.Axis.BOTH);
    expect(instance._shouldPreventDefault).to.equal(true);
    expect(instance.friction).to.equal(1);
    expect(instance.hasDragged).to.equal(false);
    expect(instance.dragEventTarget).to.equal(document);
    expect(instance._isTouchActionSupported).to.equal(false);
    instance.dispose();
  });

  it('will throw when given bad options', () => {
    expect(() => {
      new Pointer(); // eslint-disable-line no-new
    }).to.throw(TypeError);

    expect(() => {
      new Pointer('foo'); // eslint-disable-line no-new
    }).to.throw(TypeError);
  });

  it('can be disabled', () => {
    instance = new Pointer(document.body);

    expect(instance.isEnabled).to.be.true;
    instance.isEnabled = false;
    expect(instance.isEnabled).to.be.false;
    instance.isEnabled = true;
    expect(instance.isEnabled).to.be.true;

    instance.dispose();
  });

  it('should be able to move drags sometimes', () => {
    instance = new Pointer(document.body);

    expect(instance._canContinueDrag()).to.be.true;
    instance.isEnabled = false;
    expect(instance._canContinueDrag()).to.be.false;
    instance.isEnabled = true;
    instance._isDeactivated = true;
    expect(instance._canContinueDrag()).to.be.false;
    instance._isDeactivated = false;
    expect(instance._canContinueDrag()).to.be.true;

    instance.dispose();
  });

  it('can get page x and y from an event', () => {
    const mouseEvent = getFakeMouseEvent(20, 10);
    const touchEvent = getFakeTouchEvent(20, 10);
    const pointerEvent = getFakePointerEvent(20, 10);

    const coord1 = Pointer._getPageCoordinate(mouseEvent);
    const coord2 = Pointer._getPageCoordinate(touchEvent);
    const coord3 = Pointer._getPageCoordinate(pointerEvent);
    const result = new Coordinate(20, 10);

    expect(coord1).to.deep.equal(result);
    expect(coord2).to.deep.equal(result);
    expect(coord3).to.deep.equal(result);
  });

  it('can drag start', () => {
    instance = new Pointer(document.body);

    const setupHandlersSpy = sinon.spy(instance, '_addDragHandlers');

    const fakeMouse = getFakeMouseEvent(20, 10, EventType.MOUSEDOWN);
    instance._handleDragStart(fakeMouse);
    expect(instance.hasDragged).to.be.false;
    instance._removeDragHandlers();

    const fakeTouch = getFakeTouchEvent(20, 10, EventType.TOUCHSTART);
    instance._handleDragStart(fakeTouch);
    expect(setupHandlersSpy.callCount).to.equal(2);
    instance._removeDragHandlers();

    const fakePointer = getFakePointerEvent(20, 10, EventType.POINTERDOWN);
    instance._handleDragStart(fakePointer);
    expect(setupHandlersSpy.callCount).to.equal(3);
    expect(instance.pageStart.x).to.equal(20);
    expect(instance.pageStart.y).to.equal(10);
    instance._removeDragHandlers();

    setupHandlersSpy.restore();
    instance.dispose();
  });

  it('can prevent drag start from adding handlers', () => {
    instance = new Pointer(document.body);

    const spy = sinon.spy(instance, '_addDragHandlers');

    instance.once(Pointer.EventType.START, (evt) => {
      evt.preventDefault();
    });

    instance._handleDragStart(getFakeMouseEvent(22, 10, EventType.MOUSEDOWN));
    expect(spy.callCount).to.equal(0);

    spy.restore();
    instance.dispose();
  });

  it('can drag move', () => {
    instance = new Pointer(document.body);
    const lock = sinon.spy(instance, '_maybeLock');

    instance.pageStart = new Coordinate(20, 10);
    instance._handleDragMove(getFakeMouseEvent(21, 10));
    expect(instance.hasDragged).to.be.true;
    expect(lock.callCount).to.equal(1);

    instance.once(Pointer.EventType.MOVE, (evt) => {
      evt.preventDefault();
    });

    instance._handleDragMove(getFakeMouseEvent(22, 10));
    expect(lock.callCount).to.equal(1);

    instance.dispose();
  });

  it('events it emits will have the correct target and currentTarget', () => {
    const body = document.body;
    const mouseStartElement = document.body.firstElementChild;

    instance = new Pointer(body);
    const event = getFakeMouseEvent(21, 10, 'mousedown', mouseStartElement, instance.element);
    const spy = sinon.spy();

    instance.once(Pointer.EventType.MOVE, (evt) => {
      expect(evt.target).to.equal(mouseStartElement);
      expect(evt.currentTarget).to.equal(instance.element);
      spy();
    });

    instance._handleDragMove(event);

    expect(spy.callCount).to.equal(1);

    instance.dispose();
  });

  it('knows cancel events', () => {
    expect(Pointer._isCancelEvent(getFakeMouseEvent(20, 10, 'mouseup'))).to.be.false;
    expect(Pointer._isCancelEvent(getFakeMouseEvent(20, 10, 'touchstart'))).to.be.false;
    expect(Pointer._isCancelEvent(getFakeMouseEvent(20, 10, 'touchcancel'))).to.be.true;
  });

  it('will lock when past the threshold', () => {
    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });
    instance.delta = new Coordinate(Pointer.LOCK_THRESHOLD - 1, 1000);
    instance._maybeLock();
    expect(instance._isLocked).to.be.false;

    instance.delta = new Coordinate(Pointer.LOCK_THRESHOLD, 1000);
    instance._maybeLock();
    expect(instance._isLocked).to.be.false;

    instance.delta = new Coordinate(Pointer.LOCK_THRESHOLD + 1, 1000);
    instance._maybeLock();
    expect(instance._isLocked).to.be.true;

    instance.delta = new Coordinate(Pointer.LOCK_THRESHOLD - 1, 1000);
    instance._maybeLock();
    expect(instance._isLocked).to.be.true;

    // It will now never deactivate because it has been locked.
    instance._maybeDeactivate();
    expect(instance._isDeactivated).to.be.false;
  });

  it('will deactivate when past the threshold', () => {
    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });
    instance.delta = new Coordinate(0, Pointer.DRAG_THRESHOLD - 1);
    instance._maybeDeactivate();
    expect(instance._isDeactivated).to.be.false;

    instance.delta = new Coordinate(0, Pointer.DRAG_THRESHOLD);
    instance._maybeDeactivate();
    expect(instance._isDeactivated).to.be.false;

    instance.delta = new Coordinate(0, Pointer.DRAG_THRESHOLD + 1);
    instance._maybeDeactivate();
    expect(instance._isDeactivated).to.be.true;

    instance.delta = new Coordinate(0, Pointer.DRAG_THRESHOLD - 1);
    instance._maybeDeactivate();
    expect(instance._isDeactivated).to.be.true;
  });

  it('should be able to start drags sometimes', () => {
    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });
    const mouseEvent = getFakeMouseEvent(20, 10);
    expect(instance._canStartDrag(mouseEvent)).to.be.true;

    mouseEvent.button = 2;
    expect(instance._canStartDrag(mouseEvent)).to.be.false;

    mouseEvent.button = 0;
    instance.isEnabled = false;
    expect(instance._canStartDrag(mouseEvent)).to.be.false;

    // Touch events don't have a `button` property.
    const touchEvent = getFakeTouchEvent(20, 10);
    expect(instance._canStartDrag(touchEvent)).to.be.false;

    instance.isEnabled = true;
    expect(instance._canStartDrag(touchEvent)).to.be.true;

    // Pointer events.
    const pointerEvent = getFakePointerEvent(20, 10);
    expect(instance._canStartDrag(pointerEvent)).to.be.true;

    instance.isEnabled = false;
    expect(instance._canStartDrag(pointerEvent)).to.be.false;

    // Abort drag start when disabled
    instance.isEnabled = false;
    instance._handleDragStart(pointerEvent);

    instance.dispose();
  });

  it('should be able to move drags sometimes', () => {
    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });

    expect(instance._canContinueDrag()).to.be.true;
    instance.isEnabled = false;
    expect(instance._canContinueDrag()).to.be.false;
    instance.isEnabled = true;
    instance._isDeactivated = true;
    expect(instance._canContinueDrag()).to.be.false;
    instance._isDeactivated = false;
    expect(instance._canContinueDrag()).to.be.true;

    // Abort drag move when disabled.
    instance.isEnabled = false;
    instance._handleDragMove(getFakeTouchEvent(10, 10));

    instance.dispose();
  });

  it('can do a drag sequence', () => {
    const clock = sinon.useFakeTimers();

    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });

    const start = getFakeMouseEvent(400, 200, 'mousedown');
    instance._handleDragStart(start);

    const move = getFakeMouseEvent(405, 201, 'mousemove');
    instance._handleDragMove(move);
    expect(instance.hasDragged).to.be.true;
    clock.tick(16);

    const end = getFakeMouseEvent(405, 201, 'mouseup');
    instance._handleDragEnd(end);
    expect(instance.deltaTime).to.be.above(0);
    expect(instance.hasDragged).to.be.false;
    expect(instance._isDeactivated).to.be.false;
    expect(instance._isLocked).to.be.false;
    instance.dispose();
    clock.restore();
  });

  it('can set friction', () => {
    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });
    instance._handleDragStart(getFakeMouseEvent(0, 0, 'mousedown'));
    instance._handleDragMove(getFakeMouseEvent(100, 0, 'mousemove'));

    instance.friction = 0.5;
    expect(instance.friction).to.equal(0.5);
    expect(instance._friction).to.equal(0.5);

    expect(instance.delta.x).to.equal(100);

    instance._handleDragMove(getFakeMouseEvent(150, 0, 'mousemove'));

    expect(instance.delta.x).to.equal(125);

    instance.dispose();
  });

  it('can determine if the movement has enough velocity to be considered a swipe', () => {
    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });
    expect(instance.hasVelocity({
      x: Pointer.SWIPE_VELOCITY + 0.1,
      y: 0,
    })).to.be.true;

    expect(instance.hasVelocity({
      x: Pointer.SWIPE_VELOCITY - 0.1,
      y: 0,
    })).to.be.false;

    expect(instance.hasVelocity({
      x: 5,
      y: 0,
    }, 4)).to.be.true;

    expect(instance.hasVelocity({
      x: 5,
      y: 0,
    }, 6)).to.be.false;

    instance.axis = Pointer.Axis.Y;

    expect(instance.hasVelocity({
      x: 0,
      y: Pointer.SWIPE_VELOCITY + 0.1,
    })).to.be.true;

    expect(instance.hasVelocity({
      x: 0,
      y: Pointer.SWIPE_VELOCITY - 0.1,
    })).to.be.false;

    instance.axis = Pointer.Axis.BOTH;

    expect(instance.hasVelocity({
      x: Pointer.SWIPE_VELOCITY - 0.1,
      y: Pointer.SWIPE_VELOCITY + 0.1,
    })).to.be.true;

    expect(instance.hasVelocity({
      x: Pointer.SWIPE_VELOCITY + 0.1,
      y: Pointer.SWIPE_VELOCITY - 0.1,
    })).to.be.true;

    instance.dispose();
  });

  it('can calculate the current velocity', () => {
    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });
    expect(instance.velocity).to.deep.equal(new Coordinate());

    // Trigger drag end to calc velocity.
    instance._hasTrackedVelocity = false;
    instance.startTime = Date.now() - 50;
    instance._lastTime = Date.now() - 50;
    instance.page = new Coordinate(10, 10);
    instance._lastPosition = new Coordinate(5, 5);

    const tracker = sinon.spy(instance, '_trackVelocity');

    instance._handleDragEnd(getFakeMouseEvent(10, 10, 'mouseup'));
    expect(tracker.callCount).to.equal(1);

    // Javascript floats...
    const range = 0.015;
    expect(instance.velocity.x).to.be.within(5 / 50 - range, 5 / 50 + range);
    expect(instance.velocity.y).to.be.within(5 / 50 - range, 5 / 50 + range);

    instance._hasTrackedVelocity = true;
    instance.startTime = Date.now() - Pointer.VELOCITY_INTERVAL - 1;
    instance._handleDragEnd(getFakeMouseEvent(10, 10, 'mouseup'));
    expect(tracker.callCount).to.equal(1);
  });

  it('will prevent event default when dragging is locked', () => {
    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });

    sinon.stub(instance, '_maybeLock');
    sinon.stub(instance, '_maybeDeactivate');

    const endEvent = getFakePointerEvent(10, 10, 'pointerup');
    instance._isLocked = true;

    instance._finishDragMove(endEvent);

    expect(endEvent.preventDefault.callCount).to.equal(1);
  });

  it('will reset velocity when dragging is deactivated', () => {
    instance = new Pointer(document.body, {
      axis: Pointer.Axis.X,
    });

    sinon.stub(instance, '_maybeLock');
    sinon.stub(instance, '_maybeDeactivate');

    const endEvent = getFakePointerEvent(10, 10, 'pointerup');
    instance._isDeactivated = true;

    instance.velocity = new Coordinate(1, 1);
    instance._finishDragMove(endEvent);
    expect(instance.velocity.x).to.equal(0);
    expect(instance.velocity.y).to.equal(0);
  });

  it('will preventDefault on the original end event if the custom event is prevented', () => {
    const instance = new Pointer(document.body);
    const event = getFakeMouseEvent(25, 25, 'mouseup');

    // Prevent the next "move" event from pointer.
    instance.once(Pointer.EventType.END, (evt) => {
      evt.preventDefault();
    });

    instance._handleDragEnd(event);
    expect(event.preventDefault.callCount).to.equal(1);

    instance.dispose();
  });

  it('static _preventDefault method will call prevent default', () => {
    const event = { preventDefault: sinon.spy() };
    Pointer._preventDefault(event);
    expect(event.preventDefault.callCount).to.equal(1);
  });

  describe('a browser with touch action support', () => {
    const propertyName = Pointer.TouchActionSupport[Pointer.Axis.BOTH];
    const propertyValue = Pointer.TouchAction[Pointer.Axis.BOTH];
    let instance;

    beforeEach(() => {
      // color:red is used because setting a property which the browser doesn't
      // support won't stick: it'll be reset.
      Pointer.TouchActionSupport[Pointer.Axis.BOTH] = 'color';
      Pointer.TouchAction[Pointer.Axis.BOTH] = 'red';
      instance = new Pointer(document.body);
    });

    afterEach(() => {
      instance.dispose();
      instance = null;
      Pointer.TouchActionSupport[Pointer.Axis.BOTH] = propertyName;
      Pointer.TouchAction[Pointer.Axis.BOTH] = propertyValue;
    });

    it('will set the style inline', () => {
      expect(instance.element.style.color).to.equal('red');
    });

    it('will not try to lock or disable dragging', () => {
      const spy = sinon.spy(instance, '_finishDragMove');
      const event = getFakeMouseEvent(10, 20, 'mousemove');

      instance._handleDragMove(event);

      expect(spy.called).to.be.false;
    });
  });

  describe('a browser without touch event support', () => {
    const HAS_TOUCH_EVENTS = OdoDevice.HAS_TOUCH_EVENTS;
    const POINTERDOWN_EVENT = EventType.POINTERDOWN;
    let instance;

    beforeEach(() => {
      OdoDevice.HAS_TOUCH_EVENTS = false;
      EventType.POINTERDOWN = 'foo';
    });

    afterEach(() => {
      OdoDevice.HAS_TOUCH_EVENTS = HAS_TOUCH_EVENTS;
      EventType.POINTERDOWN = POINTERDOWN_EVENT;
    });

    it('will not add touch events', () => {
      const stub = sinon.stub(document.body, 'addEventListener');
      instance = new Pointer(document.body);

      expect(stub.calledWith(EventType.MOUSEDOWN)).to.be.true;
      expect(stub.calledWith(EventType.TOUCHSTART)).to.be.false;
      expect(stub.calledWith(EventType.POINTERDOWN)).to.be.false;

      instance.dispose();
      stub.restore();
    });
  });

  describe('a browser with pointer event support', () => {
    const HAS_POINTER_EVENTS = OdoDevice.HAS_POINTER_EVENTS;
    const POINTERDOWN_EVENT = EventType.POINTERDOWN;
    let instance;

    beforeEach(() => {
      OdoDevice.HAS_POINTER_EVENTS = true;
      EventType.POINTERDOWN = 'foo';
    });

    afterEach(() => {
      OdoDevice.HAS_POINTER_EVENTS = HAS_POINTER_EVENTS;
      EventType.POINTERDOWN = POINTERDOWN_EVENT;
    });

    it('will add pointer listener', () => {
      const stub = sinon.stub(document.body, 'addEventListener');
      instance = new Pointer(document.body);

      expect(stub.calledWith(EventType.MOUSEDOWN)).to.be.false;
      expect(stub.calledWith(EventType.TOUCHSTART)).to.be.false;
      expect(stub.calledWith(EventType.POINTERDOWN)).to.be.true;

      instance.dispose();
      stub.restore();
    });
  });

  describe('pointer event', () => {
    let instance;

    beforeEach(() => {
      instance = new Pointer(document.body, {
        axis: Pointer.Axis.X,
      });
    });

    afterEach(() => {
      instance.dispose();
    });

    it('can make a start event', () => {
      instance.deltaTime = 0;
      const event = new Pointer.Event({
        type: Pointer.EventType.START,
        target: instance.element,
        axis: instance.axis,
        deltaTime: instance.deltaTime,
        start: new Coordinate(10, 10),
        end: new Coordinate(10, 10),
        delta: new Coordinate(0, 0),
      });
      expect(event.type).to.equal(Pointer.EventType.START);
      expect(event.target).to.equal(instance.element);
      expect(event.delta.x).to.equal(0);
      expect(event.delta.y).to.equal(0);
      expect(event.deltaTime).to.equal(0);
      expect(event.velocity).to.deep.equal(new Coordinate(0, 0));
      expect(event.distance).to.equal(0);
      expect(event.direction).to.equal(Pointer.Direction.NONE);
    });

    it('can make an end event', () => {
      instance.deltaTime = 380;
      const event = new Pointer.Event({
        type: Pointer.EventType.END,
        target: instance.element,
        axis: instance.axis,
        deltaTime: instance.deltaTime,
        start: new Coordinate(10, 10),
        end: new Coordinate(-108, 18),
        delta: new Coordinate(-118, 8),
      });
      expect(event.type).to.equal(Pointer.EventType.END);
      expect(event.target).to.equal(instance.element);
      expect(event.delta.x).to.equal(-118);
      expect(event.delta.y).to.equal(8);
      expect(event.deltaTime).to.equal(380);
      expect(event.velocity).to.deep.equal(new Coordinate(-118 / 380, 8 / 380));
      expect(event.distance).to.equal(
        Coordinate.distance(new Coordinate(), new Coordinate(-118, 8)));
      expect(event.direction).to.equal(Pointer.Direction.LEFT);
      expect(event.isDirectionOnAxis).to.be.true;
      expect(event.didMoveOnAxis).to.be.true;
      expect(event.axisDirection).to.equal(Pointer.Direction.LEFT);
    });

    it('can go right', () => {
      const event = new Pointer.Event({
        type: Pointer.EventType.END,
        target: instance.element,
        axis: instance.axis,
        deltaTime: instance.deltaTime,
        start: new Coordinate(10, 10),
        end: new Coordinate(130, 10),
        delta: new Coordinate(120, 0),
      });
      expect(event.direction).to.equal(Pointer.Direction.RIGHT);
      expect(event.isDirectionOnAxis).to.be.true;
      expect(event.didMoveOnAxis).to.be.true;
      expect(event.axisDirection).to.equal(Pointer.Direction.RIGHT);
    });

    it('can go up on the X axis and get the axis direction', () => {
      const event = new Pointer.Event({
        type: Pointer.EventType.END,
        target: instance.element,
        axis: instance.axis,
        deltaTime: instance.deltaTime,
        start: new Coordinate(10, 10),
        end: new Coordinate(30, -90),
        delta: new Coordinate(20, -100),
      });
      expect(event.direction).to.equal(Pointer.Direction.UP);
      expect(event.isDirectionOnAxis).to.be.false;
      expect(event.didMoveOnAxis).to.be.true;
      expect(event.axisDirection).to.equal(Pointer.Direction.RIGHT);
    });
  });

  describe('y axis instance', () => {
    let instance;

    beforeEach(() => {
      instance = new Pointer(document.body, {
        axis: Pointer.Axis.Y,
        preventEventDefault: true,
      });
    });

    afterEach(() => {
      instance.dispose();
    });

    it('will lock when past the threshold', () => {
      instance.delta = new Coordinate(1000, Pointer.LOCK_THRESHOLD - 1);
      instance._maybeLock();
      expect(instance._isLocked).to.be.false;

      instance.delta = new Coordinate(1000, Pointer.LOCK_THRESHOLD);
      instance._maybeLock();
      expect(instance._isLocked).to.be.false;

      instance.delta = new Coordinate(1000, Pointer.LOCK_THRESHOLD + 1);
      instance._maybeLock();
      expect(instance._isLocked).to.be.true;

      instance.delta = new Coordinate(1000, Pointer.LOCK_THRESHOLD - 1);
      instance._maybeLock();
      expect(instance._isLocked).to.be.true;

      // It will now never deactivate because it has been locked.
      instance._maybeDeactivate();
      expect(instance._isDeactivated).to.be.false;
    });

    it('will deactivate when past the threshold', () => {
      instance.delta = new Coordinate(Pointer.DRAG_THRESHOLD - 1, 0);
      instance._maybeDeactivate();
      expect(instance._isDeactivated).to.be.false;

      instance.delta = new Coordinate(Pointer.DRAG_THRESHOLD, 0);
      instance._maybeDeactivate();
      expect(instance._isDeactivated).to.be.false;

      instance.delta = new Coordinate(Pointer.DRAG_THRESHOLD + 1, 0);
      instance._maybeDeactivate();
      expect(instance._isDeactivated).to.be.true;

      instance.delta = new Coordinate(Pointer.DRAG_THRESHOLD - 1, 0);
      instance._maybeDeactivate();
      expect(instance._isDeactivated).to.be.true;
    });

    describe('pointer event', () => {
      it('can go up', () => {
        const event = new Pointer.Event({
          type: Pointer.EventType.END,
          target: instance.element,
          axis: instance.axis,
          deltaTime: instance.deltaTime,
          start: new Coordinate(10, 10),
          end: new Coordinate(30, -90),
          delta: new Coordinate(20, -100),
        });
        expect(event.direction).to.equal(Pointer.Direction.UP);
        expect(event.isDirectionOnAxis).to.be.true;
        expect(event.didMoveOnAxis).to.be.true;
        expect(event.axisDirection).to.equal(Pointer.Direction.UP);
      });

      it('can go down', () => {
        const event = new Pointer.Event({
          type: Pointer.EventType.END,
          target: instance.element,
          axis: instance.axis,
          deltaTime: instance.deltaTime,
          start: new Coordinate(50, 50),
          end: new Coordinate(70, 150),
          delta: new Coordinate(20, 100),
        });
        expect(event.direction).to.equal(Pointer.Direction.DOWN);
        expect(event.isDirectionOnAxis).to.be.true;
        expect(event.didMoveOnAxis).to.be.true;
        expect(event.axisDirection).to.equal(Pointer.Direction.DOWN);
      });

      it('can go left on the Y axis and get the axis direction', () => {
        const event = new Pointer.Event({
          type: Pointer.EventType.END,
          target: instance.element,
          axis: instance.axis,
          deltaTime: instance.deltaTime,
          start: new Coordinate(100, 100),
          end: new Coordinate(0, 120),
          delta: new Coordinate(-100, 20),
        });
        expect(event.direction).to.equal(Pointer.Direction.LEFT);
        expect(event.isDirectionOnAxis).to.be.false;
        expect(event.didMoveOnAxis).to.be.true;
        expect(event.axisDirection).to.equal(Pointer.Direction.DOWN);
      });
    });
  });

  describe('Both axis instance', () => {
    let instance;

    beforeEach(() => {
      instance = new Pointer(document.body, {
        axis: 'xy',
        preventEventDefault: true,
      });
    });

    afterEach(() => {
      instance.dispose();
    });

    describe('pointer event', () => {
      it('can go a direction', () => {
        const event = new Pointer.Event({
          type: Pointer.EventType.END,
          target: instance.element,
          axis: instance.axis,
          deltaTime: instance.deltaTime,
          start: new Coordinate(10, 10),
          end: new Coordinate(60, -10),
          delta: new Coordinate(50, -20),
        });
        expect(event.direction).to.equal(Pointer.Direction.RIGHT);
        expect(event.isDirectionOnAxis).to.be.true;
        expect(event.didMoveOnAxis).to.be.true;
        expect(event.axisDirection).to.equal(Pointer.Direction.RIGHT);
      });
    });
  });
});
