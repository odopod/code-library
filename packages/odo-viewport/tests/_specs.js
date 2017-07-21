/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const OdoViewport = window.OdoViewport;

describe('The viewport factory', function d() {
  this.timeout(5000);

  let element;
  let element2;

  beforeEach((done) => {
    element = document.createElement('div');
    element.style.cssText = 'width:100%;height:150px;';
    element.id = 'element1';
    document.body.appendChild(element);

    element2 = document.createElement('div');
    element2.style.cssText = 'width:100%;height:150px;';
    element2.id = 'element2';
    document.body.appendChild(element2);

    // Create viewport instance. And wait for it's rAF to happen before
    // telling the tests that it's ready.
    OdoViewport.getInstance();
    requestAnimationFrame(() => {
      done();
    });
  });

  afterEach(() => {
    OdoViewport.flush();
    element.parentNode.removeChild(element);
    element2.parentNode.removeChild(element2);
    element = null;
    element2 = null;
  });

  it('should have an empty list and stuffs', () => {
    const instance = OdoViewport.getInstance();
    expect(instance.items.size).to.equal(0);
    expect(instance.viewportTop).to.equal(0);
    expect(instance.viewportHeight).to.be.above(0);
    expect(instance.viewportWidth).to.be.above(0);
    expect(instance.hasActiveHandlers).to.be.false;
  });

  it('should throw if no enter function is provided', () => {
    const fn = () => {
      OdoViewport.add({
        element,
      });
    };

    expect(fn).to.throw(TypeError);
  });

  it('should add the viewport item to the list', () => {
    const id = OdoViewport.add({
      element,
      enter() {},
    });

    const instance = OdoViewport.getInstance();
    expect(instance.items.size).to.equal(1);
    expect(instance.hasActiveHandlers).to.be.true;

    // Shouldn't unbind if there are still viewport items to watch.
    instance.unbindEvents();
    expect(instance.hasActiveHandlers).to.be.true;

    OdoViewport.remove(id);
  });

  it('should fail silently when removing a viewport item which does not exist', () => {
    const wontthrow = () => {
      OdoViewport.remove('foo');
    };

    expect(wontthrow).to.not.throw(Error);
  });

  it('can add items with different thresholds', () => {
    const ids = OdoViewport.add([
      {
        element,
        threshold: '40%',
        enter() {},
      }, {
        element: element2,
        threshold: 50,
        enter() {},
      }, {
        element,
        threshold: 0.5,
        enter() {},
      },
    ]);

    const id1 = ids[0];
    const id2 = ids[1];
    const id3 = ids[2];

    // Add the fourth afterwards so that the instance has an `addId` and cancels
    // the animation frame.
    const id4 = OdoViewport.add({
      element: element2,
      threshold: '30',
      enter() {},
    });

    const instance = OdoViewport.getInstance();
    expect(instance.items.size).to.equal(4);
    expect(instance.hasActiveHandlers).to.be.true;
    expect(instance.items.get(id1).threshold).to.equal(0.4);
    expect(instance.items.get(id1).isThresholdPercentage).to.true;
    expect(instance.items.get(id2).threshold).to.equal(50);
    expect(instance.items.get(id3).threshold).to.equal(0.5);
    expect(instance.items.get(id3).isThresholdPercentage).to.true;
    expect(instance.items.get(id4).threshold).to.equal(30);
  });

  describe('viewport management', () => {
    let instance;
    let id;
    let item;

    beforeEach(() => {
      instance = OdoViewport.getInstance();
      instance.viewportHeight = 100;

      id = OdoViewport.add({
        element,
        threshold: 50,
        enter() {},
      });

      item = instance.items.get(id);
    });

    afterEach(() => {
      instance.viewportTop = 0;
      OdoViewport.remove(id);
    });

    it('can determine when the sides are in view', () => {
      instance.viewportWidth = 1000;

      // out left
      expect(instance.isSideInViewport({
        width: 400,
        left: -500,
        right: -500 + 400,
      })).to.equal(false);

      // exactly aligned left
      expect(instance.isSideInViewport({
        width: 400,
        left: -400,
        right: -400 + 400,
      })).to.equal(true);

      // showing 1 px left
      expect(instance.isSideInViewport({
        width: 400,
        left: -399,
        right: -399 + 400,
      })).to.equal(true);

      // in the middle
      expect(instance.isSideInViewport({
        width: 400,
        left: 200,
        right: 200 + 400,
      })).to.equal(true);

      // showing on the right
      expect(instance.isSideInViewport({
        width: 400,
        left: 900,
        right: 900 + 400,
      })).to.equal(true);

      // Aligned right
      expect(instance.isSideInViewport({
        width: 400,
        left: 1000,
        right: 1000 + 400,
      })).to.equal(true);

      // Off right
      expect(instance.isSideInViewport({
        width: 400,
        left: 1001,
        right: 1001 + 400,
      })).to.equal(false);

      // Spans viewport - off right and left
      expect(instance.isSideInViewport({
        width: 1100,
        left: -50,
        right: -50 + 1100,
      })).to.equal(true);

      // Greater than the viewport, but left past the right edge.
      expect(instance.isSideInViewport({
        width: 1100,
        left: 1050,
        right: 1050 + 1100,
      })).to.equal(false);
    });

    it('can determine when the top is in view', () => {
      function expectThem() {
        instance.viewportTop = item.top - 1 - instance.viewportHeight + item.offset;
        expect(instance.isTopInViewport(item)).to.equal(false);
        instance.viewportTop = item.top - instance.viewportHeight + item.offset;
        expect(instance.isTopInViewport(item)).to.equal(true);
        instance.viewportTop = item.top + item.offset;
        expect(instance.isTopInViewport(item)).to.equal(true);
        instance.viewportTop = item.top + 1 + item.offset;
        expect(instance.isTopInViewport(item)).to.equal(false);
      }

      // Without a threshold
      item.height = 60;
      item.top = 45;
      item.bottom = 45 + 60;
      item.threshold = 0;
      expectThem();

      // With a threshold
      item.threshold = 100;
      expectThem();

      // With a negative threshold
      item.threshold = -100;
      expectThem();

      // With a percentage
      item.isThresholdPercentage = true;
      item.threshold = 0.3;
      expectThem();
    });

    it('can determine when the bottom is in view', () => {
      item.height = 60;
      item.top = 45;
      item.bottom = 45 + 60;

      instance.viewportTop = item.bottom - 1 - instance.viewportHeight;
      expect(instance.isBottomInViewport(item)).to.equal(false);
      instance.viewportTop = item.bottom - instance.viewportHeight;
      expect(instance.isBottomInViewport(item)).to.equal(true);
      instance.viewportTop = item.bottom;
      expect(instance.isBottomInViewport(item)).to.equal(true);
      instance.viewportTop = item.bottom + 1;
      expect(instance.isBottomInViewport(item)).to.equal(false);
    });

    it('can determine when the top is past view', () => {
      item.height = 60;
      item.top = 45;
      item.bottom = 45 + 60;
      instance.viewportTop = item.top;
      expect(instance.isTopPastViewport(item)).to.equal(false);
      instance.viewportTop = item.top + 1;
      expect(instance.isTopPastViewport(item)).to.equal(true);
    });

    it('can determine when the bottom is past view', () => {
      item.height = 60;
      item.top = 45;
      item.bottom = 45 + 60;
      instance.viewportTop = item.bottom - 1;
      expect(instance.isViewportPastBottom(item)).to.equal(false);
      instance.viewportTop = item.bottom;
      expect(instance.isViewportPastBottom(item)).to.equal(true);
    });

    it('can determine when the item spans the entire viewport top to bottom', () => {
      item.height = 60;
      item.top = 45;
      item.bottom = 45 + 60;
      instance.viewportTop = item.top + 1 + item.threshold;
      expect(instance.doesSpanViewport(item)).to.equal(false);

      item.height = 200;
      item.bottom = 45 + 200;

      // Exactly in of view.
      instance.viewportTop = item.top + item.threshold;
      expect(instance.doesSpanViewport(item)).to.equal(false);

      // 1 pixel off the top
      instance.viewportTop = item.top + 1 + item.threshold;
      expect(instance.doesSpanViewport(item)).to.equal(true);
    });

    it('will know when an element is in view', () => {
      item.height = 60;
      item.top = 40;
      item.bottom = 40 + 60;

      const top = sinon.stub(instance, 'isTopInViewport').returns(false);
      const bottom = sinon.stub(instance, 'isBottomInViewport').returns(false);
      const pastBottom = sinon.stub(instance, 'isViewportPastBottom').returns(false);
      const spans = sinon.stub(instance, 'doesSpanViewport').returns(false);
      const side = sinon.stub(instance, 'isSideInViewport').returns(true);

      // Scenario 0: only sides in view.
      expect(instance.isInViewport(item)).to.equal(false);

      // Scenario 1: Only the top of the element is in view
      top.returns(true);
      expect(instance.isInViewport(item)).to.equal(true);

      // Scenario 2: The top hasn't passed the threshold, but the bottom is now in view.
      item.triggered = false;
      top.returns(false);
      bottom.returns(true);
      expect(instance.isInViewport(item)).to.equal(false);

      // Scenario 3: The top hasn't passed the threshold, but the bottom is now
      // in view, however, the threshold is negative.
      item.threshold = -350;
      item.triggered = false;
      top.returns(false);
      bottom.returns(true);
      expect(instance.isInViewport(item)).to.equal(true);

      // Scenario 4: Top and bottom in view.
      item.threshold = 50;
      item.triggered = true;
      top.returns(true);
      bottom.returns(true);
      expect(instance.isInViewport(item)).to.equal(true);

      // Scenario 5: Top is past the viewport, but its threshold is still thinking
      // that its in view.
      item.triggered = true;
      top.returns(true);
      bottom.returns(false);
      pastBottom.returns(true);
      expect(instance.isInViewport(item)).to.equal(false);

      // Scenario 6: Top and bottom are out of view, but the element spans the
      // entire viewport.
      item.triggered = true;
      top.returns(false);
      bottom.returns(false);
      pastBottom.returns(false);
      spans.returns(true);
      expect(instance.isInViewport(item)).to.equal(true);

      // Scenario 7: A parent element of the watched item is display:none, so
      // getBoundingClientRect returns all zeros.
      item.width = 0;
      item.height = 0;
      item.left = 0;
      item.right = 0;
      item.top = 0;
      item.bottom = 0;
      expect(instance.isVisible(item)).to.equal(false);
      item.width = 20;
      expect(instance.isVisible(item)).to.equal(true);
      item.width = 0;
      item.height = 20;
      expect(instance.isVisible(item)).to.equal(true);
      item.width = 20;
      expect(instance.isVisible(item)).to.equal(true);

      top.restore();
      bottom.restore();
      pastBottom.restore();
      spans.restore();
      side.restore();
    });
  });

  it('can process multiple viewport items', (done) => {
    const enter1 = sinon.spy();
    const enter2 = sinon.spy();
    OdoViewport.add([
      {
        element,
        threshold: 0,
        enter: enter1,
      }, {
        element: element2,
        threshold: '10%',
        enter: enter2,
      },
    ]);

    const instance = OdoViewport.getInstance();
    expect(instance.items.size).to.equal(2);

    // Ensure phantomjs thinks the second element is in view.
    const viewportHeight = instance.viewportHeight;
    instance.viewportHeight = 1000;

    instance.handleScroll();
    expect(instance.items.size).to.equal(0);

    setTimeout(() => {
      expect(enter1.calledOnce).to.be.true;
      expect(enter2.calledOnce).to.be.true;

      // Resize and scroll handlers have been removed, no further calls will happen.
      expect(instance.hasActiveHandlers).to.be.false;

      // Reset height.
      instance.viewportHeight = viewportHeight;

      done();
    }, 30);
  });

  it('can call enter and exit functions', () => {
    const enter = sinon.spy();
    const exit = sinon.spy();

    OdoViewport.update();

    const id = OdoViewport.add({
      element,
      threshold: 0,
      enter,
      exit,
    });

    const instance = OdoViewport.getInstance();
    instance.items.get(id).top = 0;
    instance.handleScroll();
    expect(instance.items.get(id).triggered).to.equal(true);

    expect(enter.callCount).to.equal(1);
    expect(instance.hasActiveHandlers).to.equal(true);

    // Make it think the element has been scrolled out of view.
    instance.viewportTop = 5000;
    instance.process();
    expect(instance.items.get(id).triggered).to.equal(false);

    expect(exit.callCount).to.equal(1);
  });

  it('will call update dimensions on resize', () => {
    const instance = OdoViewport.getInstance();
    const saveDimensions = sinon.spy(instance, 'saveDimensions');
    OdoViewport.add({
      element,
      enter() {},
    });

    instance.update();
    expect(saveDimensions.calledOnce).to.be.true;
    saveDimensions.restore();
  });

  it('can be updated on demand', () => {
    const instance = OdoViewport.getInstance();
    const saveDimensions = sinon.spy(instance, 'saveDimensions');
    const process_ = sinon.spy(instance, 'process');
    expect(process_.calledOnce).to.be.false;
    expect(saveDimensions.calledOnce).to.be.false;
    OdoViewport.update();
    expect(process_.calledOnce).to.be.true;
    expect(saveDimensions.calledOnce).to.be.true;
    saveDimensions.restore();
    process_.restore();
  });
});
