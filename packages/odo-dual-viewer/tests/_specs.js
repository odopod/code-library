/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const OdoDualViewer = window.OdoDualViewer;

describe('The dual viewer component', function dualViewer() {
  this.timeout(2000);

  let element;
  let instance;

  function createFixture(id, options) {
    element = document.getElementById(id).cloneNode(true).firstElementChild;
    document.body.appendChild(element);

    instance = new OdoDualViewer(element, options);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    document.body.removeChild(element);
    element = null;
    instance = null;
  }

  function getDragEvent(xPosition) {
    return {
      position: {
        percent: {
          x: xPosition,
          y: 0,
        },
      },
    };
  }

  describe('horizontal dual viewers', () => {
    beforeEach(() => {
      createFixture('basic-fixture', {});
    });

    afterEach(removeFixture);

    it('will initialize properly', () => {
      expect(instance._isVertical).to.be.false;
      expect(instance._scrubberEl).to.not.be.null;
      expect(instance._overlayEl).to.not.be.null;
      expect(instance._underlayEl).to.not.be.null;
      expect(instance._overlayObjectEl).to.not.be.null;
      expect(instance._dragAxis).to.equal('x');
      expect(instance._dimensionAttr).to.equal('width');
    });

    it('should be centered after initialization', () => {
      expect(instance.getPosition()).to.equal(OdoDualViewer.Position.CENTER);
      expect(Math.round(instance._draggable.getPosition(true).x)).to.equal(50);
      expect(instance._overlayEl.style[instance._dimensionAttr]).to.equal('50%');
      expect(instance._overlayObjectEl.style[instance._dimensionAttr]).to.equal('200%');
    });

    it('can reveal panes', () => {
      instance._reveal(0.25);
      expect(instance._overlayEl.style[instance._dimensionAttr]).to.equal('25%');
      expect(instance._overlayObjectEl.style[instance._dimensionAttr]).to.equal('400%');

      instance._reveal(0.8);
      expect(instance._overlayEl.style[instance._dimensionAttr]).to.equal('80%');
      expect(instance._overlayObjectEl.style[instance._dimensionAttr]).to.equal('125%');
    });

    it('will add state classes after it comes to rest', () => {
      instance._position = OdoDualViewer.Position.START;

      instance._didComeToRest();

      expect(instance._isResting).to.be.true;
      expect(instance.element.classList.contains(OdoDualViewer.ClassName.START)).to.be.true;
      expect(instance.element.classList.contains(OdoDualViewer.ClassName.CENTERED)).to.be.false;
      expect(instance.element.classList.contains(OdoDualViewer.ClassName.END)).to.be.false;

      instance._position = OdoDualViewer.Position.CENTER;
      instance._didComeToRest();
      expect(instance.element.classList.contains(OdoDualViewer.ClassName.START)).to.be.false;
      expect(instance.element.classList.contains(OdoDualViewer.ClassName.CENTERED)).to.be.true;
      expect(instance.element.classList.contains(OdoDualViewer.ClassName.END)).to.be.false;

      instance._position = OdoDualViewer.Position.END;
      instance._didComeToRest();
      expect(instance.element.classList.contains(OdoDualViewer.ClassName.START)).to.be.false;
      expect(instance.element.classList.contains(OdoDualViewer.ClassName.CENTERED)).to.be.false;
      expect(instance.element.classList.contains(OdoDualViewer.ClassName.END)).to.be.true;
    });

    it('will emit an event when it comes to rest', () => {
      const handler = sinon.spy((e) => {
        expect(e.position).to.equal(OdoDualViewer.Position.CENTER);
      });

      instance.once(OdoDualViewer.EventType.CAME_TO_REST, handler);

      instance._didComeToRest();
      expect(handler.callCount).to.equal(1);
    });

    it('will clean up upon disposal', () => {
      instance.dispose();
      expect(instance.element).to.be.null;
      expect(instance._scrubberEl).to.be.null;
      expect(instance._overlayEl).to.be.null;
      expect(instance._overlayObjectEl).to.be.null;
      expect(instance._underlayEl).to.be.null;
      expect(element.classList.contains(OdoDualViewer.ClassName.CENTERED)).to.be.false;
      expect(instance._draggable.element).to.be.null;
    });

    it('will animate after drag ends, depending on zones', () => {
      const animateStub = sinon.stub(instance, 'animateTo');

      expect(instance.options.zones).to.deep.equal([0.33, 0.33, 0.66, 0.66]);

      instance._handleDragEnd(getDragEvent(30));

      expect(instance._position).to.equal(OdoDualViewer.Position.START);
      expect(animateStub.callCount).to.equal(1);
      expect(animateStub.calledWith(0)).to.be.true;

      // Overlapping, middle wins.
      instance._handleDragEnd(getDragEvent(33));

      expect(instance._position).to.equal(OdoDualViewer.Position.CENTER);
      expect(animateStub.callCount).to.equal(2);
      expect(animateStub.calledWith(0.5)).to.be.true;

      // End
      instance._handleDragEnd(getDragEvent(67));

      expect(instance._position).to.equal(OdoDualViewer.Position.END);
      expect(animateStub.callCount).to.equal(3);
      expect(animateStub.calledWith(1)).to.be.true;

      instance.options.zones = [0.2, 0.45, 0.55, 0.8];

      // Between zones
      instance._handleDragEnd(getDragEvent(60));
      instance._handleDragEnd(getDragEvent(30));

      expect(instance._position).to.equal(OdoDualViewer.Position.BETWEEN);
      expect(animateStub.callCount).to.equal(3);

      // No zones
      instance.options.hasZones = false;
      instance._handleDragEnd(getDragEvent(15));
      expect(animateStub.callCount).to.equal(3);
    });

    it('will limit percent to scrubber limits', () => {
      instance._scrubberLimits = {
        left: 20,
        width: 100,
      };

      instance._containerWidth = 200;

      expect(instance._getLimitedPercent(0)).to.equal(20 / 200);
      expect(instance._getLimitedPercent(0.4)).to.equal(0.4);
      expect(instance._getLimitedPercent(1)).to.equal((20 + 100) / 200);
    });

    it('can animate to a position', () => {
      const _getZone = sinon.spy(instance, '_getZone');
      const Stepper = sinon.stub(window.OdoHelpers.animation, 'Stepper').callsFake(function Stepper() {
        this.onfinish = 'foo';
      });

      instance._previousPercent = 0.4;
      instance.animateTo(0.4);
      expect(_getZone.callCount).to.equal(0);

      instance.animateTo(0.2);
      expect(_getZone.callCount).to.equal(1);
      Stepper.restore();
    });

    it('can set the position for draggable on each animation step', () => {
      const spy = sinon.spy(instance, '_reveal');
      instance._animateStep(0.4);
      expect(spy.calledWith(0.4));
    });

    it('will reveal/cover the elements on drag move', () => {
      const _reveal = sinon.spy(instance, '_reveal');
      const _removeStateClasses = sinon.spy(instance, '_removeStateClasses');
      instance._previousPercent = 0.5;
      instance._handleDragMove(getDragEvent(15));

      expect(instance._previousPercent).to.equal(0.15);
      expect(_removeStateClasses.callCount).to.equal(1);
      expect(_reveal.calledWith(0.15));

      instance._handleDragMove(getDragEvent(16));
      expect(instance._previousPercent).to.equal(0.16);
      expect(_reveal.calledWith(0.16));
      expect(_removeStateClasses.callCount).to.equal(1);
    });

    it('will recalculate dimensions on `reset`', () => {
      const _saveContainerSize = sinon.spy(instance, '_saveContainerSize');
      const _reveal = sinon.spy(instance, '_reveal');
      instance.reset();
      expect(_saveContainerSize.callCount).to.equal(1);
      expect(_reveal.callCount).to.equal(1);
    });
  });

  describe('vertical dual viewers', () => {
    beforeEach(() => {
      createFixture('basic-fixture', {
        isVertical: true,
      });
    });

    afterEach(removeFixture);

    it('will initialize properly', () => {
      expect(instance._isVertical).to.be.true;
      expect(instance._dragAxis).to.equal('y');
      expect(instance._dimensionAttr).to.equal('height');
    });

    it('should be centered after initialization', () => {
      expect(instance.getPosition()).to.equal(OdoDualViewer.Position.CENTER);
      expect(instance._draggable.getPosition(true).y).to.equal(50);
      expect(instance._overlayEl.style[instance._dimensionAttr]).to.equal('50%');
      expect(instance._overlayObjectEl.style[instance._dimensionAttr]).to.equal('200%');
    });

    it('can reveal panes', () => {
      instance._reveal(0.25);
      expect(instance._overlayEl.style[instance._dimensionAttr]).to.equal('25%');
      expect(instance._overlayObjectEl.style[instance._dimensionAttr]).to.equal('400%');

      instance._reveal(0.8);
      expect(instance._overlayEl.style[instance._dimensionAttr]).to.equal('80%');
      expect(instance._overlayObjectEl.style[instance._dimensionAttr]).to.equal('125%');
    });

    it('will limit percent to scrubber limits', () => {
      instance._scrubberLimits = {
        top: 20,
        height: 100,
      };

      instance._containerHeight = 200;

      expect(instance._getLimitedPercent(0)).to.equal(20 / 200);
      expect(instance._getLimitedPercent(0.4)).to.equal(0.4);
      expect(instance._getLimitedPercent(1)).to.equal((20 + 100) / 200);
    });
  });
});
