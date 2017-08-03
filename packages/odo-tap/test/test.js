/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const sinon = window.sinon;
const Coordinate = window.OdoHelpers.Coordinate;

const OdoTap = window.OdoTap;

describe('The tap service', () => {
  it('cleans up references', () => {
    const id = OdoTap.addListener(document.body, sinon.spy());

    const instance = OdoTap._listeners.get(id);
    OdoTap.remove(id);

    expect(instance.element).to.not.exist;
    expect(instance.fn).to.not.exist;

    OdoTap.remove(id);
  });

  it('resets has dragged on drag start', () => {
    const id = OdoTap.addListener(document.body, sinon.spy());

    const instance = OdoTap._listeners.get(id);

    expect(instance.hasDragged).to.not.exist;
    instance._handlePointerStart();
    expect(instance.hasDragged).to.be.false;

    OdoTap.remove(id);
  });

  it('can determine when the max movement threshold is passed', () => {
    const id = OdoTap.addListener(document.body, sinon.spy());

    const instance = OdoTap._listeners.get(id);

    instance.pointer.pageStart = new Coordinate(100, 100);
    instance.pointer.page = new Coordinate(100, 100);

    instance.hasDragged = true;
    instance._handlePointerMove();
    expect(instance.hasDragged).to.be.true;

    instance.hasDragged = false;

    instance.pointer.pageStart = new Coordinate(100, 100);
    instance.pointer.page = new Coordinate(111, 100);
    instance._handlePointerMove();
    expect(instance.hasDragged).to.be.true;

    OdoTap.remove(id);
  });

  it('will not call the callback if the tap took too long', () => {
    const spy = sinon.spy();
    const id = OdoTap.addListener(document.body, spy);
    const instance = OdoTap._listeners.get(id);

    instance.pointer.deltaTime = 251;

    instance._handlePointerEnd({
      isCancelEvent: false,
      preventDefault: sinon.spy(),
    });

    expect(spy.called).to.be.false;

    OdoTap.remove(id);
  });

  it('will not call the callback if it was a cancel event', () => {
    const spy = sinon.spy();
    const id = OdoTap.addListener(document.body, spy);
    const instance = OdoTap._listeners.get(id);

    instance.pointer.deltaTime = 10;

    instance._handlePointerEnd({
      isCancelEvent: true,
      preventDefault: sinon.spy(),
    });

    expect(spy.called).to.be.false;

    OdoTap.remove(id);
  });

  it('will call the callback if conditions are met', () => {
    const spy = sinon.spy();
    const id = OdoTap.addListener(document.body, spy);
    const instance = OdoTap._listeners.get(id);

    instance.pointer.deltaTime = 10;

    instance._handlePointerEnd({
      isCancelEvent: false,
      preventDefault: sinon.spy(),
    });

    expect(spy.callCount).to.equal(1);

    OdoTap.remove(id);
  });

  it('can prevent click event behavior', () => {
    function testClick(evt) {
      expect(evt.defaultPrevented).to.be.true;
    }

    // Fixture in the DOM.
    const button = document.createElement('button');
    document.body.appendChild(button);

    const id = OdoTap.addListener(button, sinon.spy(), true);
    const instance = OdoTap._listeners.get(id);

    button.addEventListener('click', testClick);
    instance.element.click();

    button.removeEventListener('click', testClick);
    OdoTap.remove(id);
    document.body.removeChild(button);
  });

  it('can allow the default not to be prevented on mouseup/touchend', () => {
    const stub = sinon.stub().returns(true);
    const pd = sinon.spy();
    const id = OdoTap.addListener(document.body, stub);
    const instance = OdoTap._listeners.get(id);

    instance.pointer.deltaTime = 10;

    instance._handlePointerEnd({
      isCancelEvent: false,
      preventDefault: pd,
    });

    expect(pd.callCount).to.equal(0);

    OdoTap.remove(id);
  });

  it('will callback when space bar or enter are pressed', () => {
    const callback = sinon.spy();
    const preventDefault = sinon.spy();
    const id = OdoTap.addListener(document.body, callback);
    const instance = OdoTap._listeners.get(id);

    instance._handleKeyUp({
      which: 13,
      preventDefault,
    });

    expect(callback.callCount).to.equal(1);
    expect(preventDefault.callCount).to.equal(1);

    instance._handleKeyUp({
      which: 32,
      preventDefault,
    });

    expect(callback.callCount).to.equal(2);
    expect(preventDefault.callCount).to.equal(2);

    instance._handleKeyUp({
      which: 39,
      preventDefault,
    });

    expect(callback.callCount).to.equal(2);
    expect(preventDefault.callCount).to.equal(2);

    OdoTap.remove(id);
  });
});
