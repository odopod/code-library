/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const OdoWindowEvents = window.OdoWindowEvents;

function noop() {}

describe('The Odo Window Events service', function d() {
  this.timeout(5000);

  beforeEach(() => {
    OdoWindowEvents._scrollCallbacks = {};
    OdoWindowEvents._fastScrollCallbacks = {};
    OdoWindowEvents._resizeCallbacks = {};
    OdoWindowEvents._leadingResizeCallbacks = {};
  });

  it('can cache a callback function for the scroll event', () => {
    const bindingID = OdoWindowEvents.onScroll(noop);
    expect(OdoWindowEvents._scrollCallbacks[bindingID]).to.be.defined;
  });

  it('can cache a fast callback function for the scroll event', () => {
    const bindingID = OdoWindowEvents.onScroll(noop);
    expect(OdoWindowEvents._fastScrollCallbacks[bindingID]).to.be.defined;
  });

  it('can cache a callback function for the resize event', () => {
    const bindingID = OdoWindowEvents.onResize(noop);
    expect(OdoWindowEvents._resizeCallbacks[bindingID]).to.be.defined;
  });

  it('can cache a callback function for the leading resize event', () => {
    const bindingID = OdoWindowEvents.onResize(noop);
    expect(OdoWindowEvents._leadingResizeCallbacks[bindingID]).to.be.defined;
  });

  it('can remove a callback for either the scroll or resize event', () => {
    const scrollBindingID = OdoWindowEvents.onScroll(noop);
    const fastScrollBindingID = OdoWindowEvents.onFastScroll(noop);
    const resizeBindingID = OdoWindowEvents.onResize(noop);
    const leadingResizeBindingID = OdoWindowEvents.onLeadingResize(noop);

    expect(OdoWindowEvents._scrollCallbacks).to.have.property(scrollBindingID);
    expect(OdoWindowEvents._fastScrollCallbacks).to.have.property(fastScrollBindingID);
    expect(OdoWindowEvents._resizeCallbacks).to.have.property(resizeBindingID);
    expect(OdoWindowEvents._leadingResizeCallbacks).to.have.property(leadingResizeBindingID);

    OdoWindowEvents.remove(scrollBindingID);
    OdoWindowEvents.remove(fastScrollBindingID);
    OdoWindowEvents.remove(resizeBindingID);
    OdoWindowEvents.remove(leadingResizeBindingID);

    expect(OdoWindowEvents._scrollCallbacks).to.not.have.property(scrollBindingID);
    expect(OdoWindowEvents._fastScrollCallbacks).to.not.have.property(fastScrollBindingID);
    expect(OdoWindowEvents._resizeCallbacks).to.not.have.property(resizeBindingID);
    expect(OdoWindowEvents._leadingResizeCallbacks).to.not.have.property(leadingResizeBindingID);
  });

  it('calls scroll callbacks when scroll is triggered on window, in the order defined.', () => {
    sinon.stub(OdoWindowEvents, '_scrollCallback').callsFake(() => {
      OdoWindowEvents._callbacks.scroll();
      OdoWindowEvents._callbacks.fastScroll();
    });

    const spyA = sinon.spy();
    const spyB = sinon.spy();
    const spyC = sinon.spy();
    const spyD = sinon.spy();
    const spyE = sinon.spy();
    const spyF = sinon.spy();

    const scrollTop = window.pageYOffset;

    OdoWindowEvents.onScroll(spyA);
    OdoWindowEvents.onScroll(spyB);
    OdoWindowEvents.onScroll(spyC);

    OdoWindowEvents.onFastScroll(spyD);
    OdoWindowEvents.onFastScroll(spyE);
    OdoWindowEvents.onFastScroll(spyF);

    OdoWindowEvents._scrollCallback();

    expect(spyA.calledOnce).to.be.true;
    expect(spyB.calledOnce).to.be.true;
    expect(spyC.calledOnce).to.be.true;

    expect(spyA.calledBefore(spyB)).to.be.true;
    expect(spyB.calledBefore(spyC)).to.be.true;

    expect(spyD.calledOnce).to.be.true;
    expect(spyE.calledOnce).to.be.true;
    expect(spyF.calledOnce).to.be.true;

    expect(spyC.calledBefore(spyD)).to.be.true;
    expect(spyD.calledBefore(spyF)).to.be.true;

    expect(spyA.calledWith(scrollTop)).to.be.true;
    expect(spyB.calledWith(scrollTop)).to.be.true;
    expect(spyC.calledWith(scrollTop)).to.be.true;
    expect(spyD.calledWith(scrollTop)).to.be.true;
    expect(spyE.calledWith(scrollTop)).to.be.true;
    expect(spyF.calledWith(scrollTop)).to.be.true;

    OdoWindowEvents._scrollCallback.restore();
  });

  it('calls resize callbacks when resize is triggered on window, in the order defined.', () => {
    // Stub the resize and scroll callbacks to avoid throttle and debounces.
    sinon.stub(OdoWindowEvents, '_resizeCallback').callsFake(() => {
      OdoWindowEvents._callbacks.leadingResize();
      OdoWindowEvents._callbacks.resize();
    });

    const spyA = sinon.spy();
    const spyB = sinon.spy();
    const spyC = sinon.spy();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    OdoWindowEvents.onResize(spyA);
    OdoWindowEvents.onResize(spyB);
    OdoWindowEvents.onResize(spyC);

    OdoWindowEvents._resizeCallback();

    expect(spyA.callCount).to.equal(1);
    expect(spyB.callCount).to.equal(1);
    expect(spyC.callCount).to.equal(1);

    expect(spyA.calledBefore(spyB)).to.be.true;
    expect(spyB.calledBefore(spyC)).to.be.true;

    expect(spyA.calledWith(viewportWidth, viewportHeight)).to.be.true;
    expect(spyB.calledWith(viewportWidth, viewportHeight)).to.be.true;
    expect(spyC.calledWith(viewportWidth, viewportHeight)).to.be.true;

    OdoWindowEvents._resizeCallback.restore();
  });

  it('can use the callbacks with throttling and debouncing', () => {
    const clock = sinon.useFakeTimers();

    const spy = sinon.spy();
    OdoWindowEvents.onScroll(spy);

    OdoWindowEvents._scrollCallback();
    OdoWindowEvents._resizeCallback();

    clock.tick(1000);

    expect(spy.callCount).to.equal(1);

    clock.restore();
  });

  it('can bind a context to a callback', () => {
    const obj = { hello: true, called: false };

    function callback() {
      obj.called = true;
      expect(obj.hello).to.equal(true);
    }

    const id = OdoWindowEvents.onScroll(callback.bind(obj));

    OdoWindowEvents._callbacks.scroll();
    expect(obj.called).to.equal(true);

    OdoWindowEvents.remove(id);
  });
});
