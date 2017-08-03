/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const sinon = window.sinon;
const OdoScrollAnimation = window.OdoScrollAnimation;

let scrollElement;

describe('Odo Scroll Animation', () => {
  beforeEach(() => {
    scrollElement = document.createElement('div');
    document.body.appendChild(scrollElement);
  });

  afterEach(() => {
    document.body.removeChild(scrollElement);
  });

  it('can omit the target parameter', () => {
    const callback = sinon.spy();
    const id = OdoScrollAnimation.add(callback);

    expect(OdoScrollAnimation._listeners.get(id).target).to.equal(window);
    expect(OdoScrollAnimation._listeners.get(id).fn).to.equal(callback);

    OdoScrollAnimation.remove(id);
  });

  it('can add the target parameter', () => {
    const callback = sinon.spy();
    const id = OdoScrollAnimation.add(scrollElement, callback);

    expect(OdoScrollAnimation._listeners.get(id).target).to.equal(scrollElement);
    expect(OdoScrollAnimation._listeners.get(id).fn).to.equal(callback);

    OdoScrollAnimation.remove(id);
  });

  it('will not throw when trying to remove an id which does not exist', () => {
    const doit = () => {
      OdoScrollAnimation.remove('foo');
    };

    expect(doit).to.not.throw;
  });

  it('will only bind one listener per target', () => {
    const id1 = OdoScrollAnimation.add(sinon.spy());
    const id2 = OdoScrollAnimation.add(sinon.spy());
    const id3 = OdoScrollAnimation.add(scrollElement, sinon.spy());
    const id4 = OdoScrollAnimation.add(scrollElement, sinon.spy());

    expect(OdoScrollAnimation._listeners.size).to.equal(4);
    expect(OdoScrollAnimation._targets.size).to.equal(2);

    OdoScrollAnimation.remove(id1);
    OdoScrollAnimation.remove(id2);
    OdoScrollAnimation.remove(id3);
    OdoScrollAnimation.remove(id4);

    expect(OdoScrollAnimation._listeners.size).to.equal(0);
    expect(OdoScrollAnimation._targets.size).to.equal(0);
  });

  it('can get listeners by a target', () => {
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();
    const callback3 = sinon.spy();
    const callback4 = sinon.spy();
    const id1 = OdoScrollAnimation.add(callback1);
    const id2 = OdoScrollAnimation.add(callback2);
    const id3 = OdoScrollAnimation.add(scrollElement, callback3);
    const id4 = OdoScrollAnimation.add(scrollElement, callback4);

    const windowListeners = OdoScrollAnimation._getListenersForTarget(window);
    expect(windowListeners[0]).to.equal(callback1);
    expect(windowListeners[1]).to.equal(callback2);

    const scrollElementListeners = OdoScrollAnimation._getListenersForTarget(scrollElement);
    expect(scrollElementListeners[0]).to.equal(callback3);
    expect(scrollElementListeners[1]).to.equal(callback4);

    OdoScrollAnimation.remove(id1);
    OdoScrollAnimation.remove(id2);
    OdoScrollAnimation.remove(id3);
    OdoScrollAnimation.remove(id4);
  });

  it('will cancel animation frames if the called again before the last one executed', () => {
    const cAF = sinon.stub(window, 'cancelAnimationFrame');
    const rAF = sinon.stub(window, 'requestAnimationFrame');
    rAF.returns(3);

    const event = {
      currentTarget: scrollElement,
    };

    const id = OdoScrollAnimation.add(scrollElement, sinon.spy());

    OdoScrollAnimation._handleTargetScrolled(event);

    expect(OdoScrollAnimation._targets.get(scrollElement)).to.equal(3);
    expect(rAF.callCount).to.equal(1);
    expect(cAF.callCount).to.equal(0);

    OdoScrollAnimation._handleTargetScrolled(event);
    expect(rAF.callCount).to.equal(2);
    expect(cAF.callCount).to.equal(1);
    expect(cAF.calledWith(3)).to.be.true;

    OdoScrollAnimation.remove(id);
    cAF.restore();
    rAF.restore();
  });

  it('will call each lister for a target on update', () => {
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();
    const id1 = OdoScrollAnimation.add(callback1);
    const id2 = OdoScrollAnimation.add(callback2);

    OdoScrollAnimation._callListeners(window);
    expect(callback1.calledOnce).to.be.true;
    expect(callback2.calledOnce).to.be.true;
    expect(OdoScrollAnimation._targets.get(window)).to.equal(null);

    OdoScrollAnimation.remove(id1);
    OdoScrollAnimation.remove(id2);
  });

  it('will throw if there is no scroll target given', () => {
    const noop = sinon.spy();

    expect(() => {
      OdoScrollAnimation.add('foo', noop);
    }).to.throw(TypeError);

    expect(() => {
      OdoScrollAnimation.add(null, noop);
    }).to.throw(TypeError);

    expect(() => {
      OdoScrollAnimation.add(undefined, noop);
    }).to.throw(TypeError);

    expect(() => {
      OdoScrollAnimation.add({}, noop);
    }).to.throw(TypeError);
  });

  it('will throw if there is no callback', () => {
    expect(() => {
      OdoScrollAnimation.add();
    }).to.throw(TypeError);

    expect(() => {
      OdoScrollAnimation.add(window);
    }).to.throw(TypeError);

    expect(() => {
      OdoScrollAnimation.add(document, 'foo');
    }).to.throw(TypeError);

    expect(() => {
      OdoScrollAnimation.add(document, {});
    }).to.throw(TypeError);
  });

  it('will add the scroll listener to the window if the document is given', () => {
    const callback = sinon.spy();
    const id = OdoScrollAnimation.add(document, callback);

    expect(OdoScrollAnimation._listeners.get(id).target).to.equal(window);
    expect(OdoScrollAnimation._listeners.get(id).fn).to.equal(callback);
  });

  it('will not throw when trying to remove an id which does not exist', () => {
    const fn = () => {
      OdoScrollAnimation.remove('asdf');
    };

    expect(fn).not.to.throw(Error);
  });

  it('can get the scroll position of regular elements', () => {
    const element = {
      scrollTop: 0,
      scrollLeft: 0,
      nodeType: 1,
    };

    expect(OdoScrollAnimation._getScrollPosition(element)).to.deep.equal({
      top: 0,
      left: 0,
    });

    element.scrollTop = 10;
    element.scrollLeft = 40;

    expect(OdoScrollAnimation._getScrollPosition(element)).to.deep.equal({
      top: 10,
      left: 40,
    });
  });
});
