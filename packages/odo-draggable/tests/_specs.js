/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const OdoDraggable = window.OdoDraggable;
const Coordinate = window.OdoHelpers.Coordinate;
const math = window.OdoHelpers.math;

describe('The Draggable component', () => {
  let fixtureWrapper;
  let element;
  let wrapper;
  let instance;

  function createFixture(id, options) {
    fixtureWrapper = document.getElementById(id).cloneNode(true).firstElementChild;
    document.body.appendChild(fixtureWrapper);

    element = fixtureWrapper.querySelector('.draggable-component');

    instance = new OdoDraggable(element, options);
    wrapper = instance._parentEl;
  }

  function removeFixture() {
    instance.dispose();
    document.body.removeChild(fixtureWrapper);
    element = null;
    instance = null;
    wrapper = null;
  }

  describe('basic fixture', () => {
    beforeEach(() => {
      createFixture('basic-fixture');
    });

    afterEach(removeFixture);

    it('should be at zero zero', () => {
      instance.update();
      expect(instance._relativeZero).to.deep.equal(new Coordinate(0, 0));
    });

    it('defaults to the x axis', () => {
      expect(instance.pointer.axis).to.equal('x');
    });

    it('can be enabled and disabled', () => {
      expect(instance.isEnabled).to.be.true;
      instance.isEnabled = false;
      expect(instance.isEnabled).to.be.false;
    });

    it('can set its position', () => {
      wrapper.style.width = '1000px';
      element.style.width = '200px';

      instance.setPosition(50, 50);

      expect(instance.getPosition().x).to.equal(500);
      expect(instance.getPosition().y).to.equal(0);

      expect(Math.round(instance.getPosition(true).x)).to.equal(50);
      expect(Math.round(instance.getPosition(true).y)).to.equal(0);
    });

    it('will not set a subpixel position', () => {
      wrapper.style.width = '100px';
      element.style.width = '20px';

      instance.setPosition(50.5, 50);

      expect(instance.getPosition().x).to.equal(51);
    });

    it('can use friction. pshhrerrrr', () => {
      instance.friction = 0.5;
      instance.setPosition(50, 50);

      expect(Math.round(instance.getPosition(true).x)).to.equal(25);
      expect(Math.round(instance.getPosition(true).y)).to.equal(0);
      expect(instance.friction).to.equal(0.5);
    });

    it('will throw when the parent does not have dimensions', () => {
      element.style.height = '0px';

      const fn = instance.setPosition.bind(instance, 50, 50);
      expect(fn).to.throw(Error);

      element.style.height = '';
      element.style.width = '0px';
      instance.element.offsetWidth;

      expect(fn).to.throw(Error);
    });

    it('will set current position on drag start', () => {
      instance._handleDragStart({
        target: instance.element,
      });

      expect(instance._currentPosition).to.exist;
      expect(instance._relativeZero).to.exist;
    });

    it('will set draggable element position on drag move', () => {
      const spy = sinon.spy(instance, '_applyPosition');
      instance._handleDragMove({
        target: instance.element,
      });

      expect(spy.callCount).to.equal(1);
    });

    it('will not set draggable element position on drag move if deactivated', () => {
      const spy = sinon.spy(instance, '_applyPosition');
      instance.pointer._isDeactivated = true;
      instance._handleDragMove({
        target: instance.element,
      });

      expect(spy.callCount).to.equal(0);
    });

    it('will dispatch a draggable end event on pointer up', () => {
      const spy = sinon.spy(instance, '_createEvent');
      instance._handleDragEnd({
        target: instance.element,
        currentVelocity: new Coordinate(),
        delta: new Coordinate(),
      });

      expect(spy.calledWith(OdoDraggable.EventType.END)).to.be.true;
    });

    it('can set limits', () => {
      const left = -50;
      const top = 0;
      const width = 400;
      const height = 150;
      const rect = new math.Rect(left, top, width, height);
      instance.setLimits(rect);

      instance.setPosition(-200, 0);
      expect(instance.getPosition()).to.deep.equal(new Coordinate(-50, 0));

      instance.setPosition(200, 0);
      expect(instance.getPosition()).to.deep.equal(new Coordinate(350, 0));
    });

    it('can get new limited positions from realtive zero and the delta', () => {
      instance.update();
      instance.setLimits(new math.Rect(0, 0, 15, 150));
      instance.pointer.delta = new Coordinate(20, 0);
      const currentPosition = instance._getNewLimitedPosition(instance.pointer.delta);
      expect(currentPosition).to.deep.equal(new Coordinate(15, 0));
    });

    it('events it emits will have the correct target and currentTarget', () => {
      const mouseStartElement = document.body.firstElementChild;

      const spy = sinon.spy();

      instance.once(OdoDraggable.EventType.MOVE, (evt) => {
        expect(evt.target).to.equal(mouseStartElement);
        expect(evt.currentTarget).to.equal(instance.element);
        spy();
      });

      instance._handleDragMove({
        target: mouseStartElement,
      });

      expect(spy.callCount).to.equal(1);
    });
  });

  describe('a draggable Y axis', () => {
    beforeEach(() => {
      createFixture('basic-fixture', {
        axis: 'y',
      });
    });

    afterEach(removeFixture);

    it('can set its position', () => {
      wrapper.style.width = '1000px';
      wrapper.style.height = '150px';
      element.style.width = '200px';
      element.style.height = '150px';

      instance.setPosition(50, 50);

      expect(instance.getPosition().x).to.equal(0);
      expect(instance.getPosition().y).to.equal(75);

      expect(Math.round(instance.getPosition(true).x)).to.equal(0);
      expect(Math.round(instance.getPosition(true).y)).to.equal(50);
    });
  });

  describe('a draggable on both axis', () => {
    beforeEach(() => {
      createFixture('basic-fixture', {
        axis: 'xy',
      });
    });

    afterEach(removeFixture);

    it('can set its position', () => {
      wrapper.style.width = '1000px';
      wrapper.style.height = '150px';
      element.style.width = '200px';
      element.style.height = '150px';

      instance.setPosition(50, 50);

      expect(instance.getPosition().x).to.equal(500);
      expect(instance.getPosition().y).to.equal(75);

      expect(Math.round(instance.getPosition(true).x)).to.equal(50);
      expect(Math.round(instance.getPosition(true).y)).to.equal(50);
    });
  });

  describe('a throwable', () => {
    beforeEach(() => {
      createFixture('basic-fixture', {
        axis: 'xy',
        isThrowable: true,
      });
    });

    afterEach(removeFixture);

    it('will throw if there is velocity on drag end', () => {
      const _throw = sinon.stub(instance, '_throw');
      instance._handleDragEnd({
        target: instance.element,
        currentVelocity: new Coordinate(),
        delta: new Coordinate(),
      });

      expect(_throw.callCount).to.equal(0);

      instance._handleDragEnd({
        target: instance.element,
        currentVelocity: new Coordinate(-1, 1),
        delta: new Coordinate(),
      });

      expect(_throw.callCount).to.equal(1);
    });

    it('can start a throw', (done) => {
      // Start at 0,0
      expect(instance._requestId).to.equal(0);
      expect(Coordinate.equals(new Coordinate(), instance._currentPosition)).to.be.true;

      // Throw with velocity and the whole drag took 10px in x and y.
      instance._throw(new Coordinate(0.5, 0.11), new Coordinate(10, 10));

      expect(Coordinate.equals(
        new Coordinate(10, 10),
        instance._currentPosition,
      )).to.be.true;

      // Has velocity, throw will rAF.
      requestAnimationFrame(() => {
        expect(instance._requestId).to.be.above(0);
        sinon.stub(instance.pointer, 'hasVelocity').returns(false);

        // No velocity, throw will not request another animation frame.
        function didSettle() {
          done();
        }

        instance.once(OdoDraggable.EventType.SETTLE, didSettle);
      });
    });
  });
});
