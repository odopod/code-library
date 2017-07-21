/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions, no-use-before-define */

const sinon = window.sinon;

const OdoDevice = window.OdoDevice;
const OdoCarousel = window.OdoCarousel;
const OdoPointer = window.OdoPointer;
const AnimationHelpers = window.OdoHelpers.animation;

describe('The Templater', () => {
  it('will use the original value if none is found to replace it', () => {
    expect(OdoCarousel.template('<div class="{{ foo }}">', {})).to.equal('<div class="foo">');
  });

  it('can have whitespace before or after the replacee', () => {
    expect(OdoCarousel.template('<div class="{{ foo }}">', {
      foo: 'bar',
    })).to.equal('<div class="bar">');

    expect(OdoCarousel.template('<div class="{{ foo}}">', {
      foo: 'bar',
    })).to.equal('<div class="bar">');

    expect(OdoCarousel.template('<div class="{{foo }}">', {
      foo: 'bar',
    })).to.equal('<div class="bar">');

    expect(OdoCarousel.template('<div class="{{foo}}">', {
      foo: 'bar',
    })).to.equal('<div class="bar">');
  });

  it('can use a function to replace the replacee', () => {
    expect(OdoCarousel.template('<div class="{{ foo }}">', {
      component: 'carousel',
      foo() {
        return this.component;
      },
    })).to.equal('<div class="carousel">');
  });

  it('can nest objects', () => {
    expect(OdoCarousel.template('<div class="{{ nest1.nest2.nest3 }}">', {
      nest1: {
        nest2: {
          nest3: 'I am third',
        },
      },
    })).to.equal('<div class="I am third">');

    expect(OdoCarousel.template('<div class="{{ nest1.nest2.nest3 }}">', {
      nest1: {
        nest2: 'I am second',
      },
    })).to.equal('<div class="nest1.nest2.nest3">');
  });

  it('can do it all at once', () => {
    expect(OdoCarousel.template('<a href="{{href}}" three="{{nest1.nest2.nest3}}" class="{{person.name}}">{{ mycalling}}</a>', {
      href: '#',
      person: {
        age: 24,
        name: 'Glen',
      },
      nest1: {
        nest2: {
          nest3: 'I am third',
        },
      },
      mycalling() {
        return 'cool';
      },
    })).to.equal('<a href="#" three="I am third" class="Glen">cool</a>');
  });
});

describe('The carousel component', function d() {
  this.timeout(2000);

  beforeEach(() => {
    // Make onTransitionEnd a zero timeout every time.
    sinon.stub(AnimationHelpers, 'onTransitionEnd').callsFake((elem, fn, context) => {
      setTimeout(() => {
        fn.call(context, {
          target: elem,
          currentTarget: elem,
        });
      }, 0);
    });
  });

  afterEach(() => {
    AnimationHelpers.onTransitionEnd.restore();
  });

  let element;
  let instance;

  function createFixture(id, options) {
    element = document.getElementById(id).cloneNode(true).firstElementChild;
    document.body.appendChild(element);
    instance = new OdoCarousel(element, options);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    document.body.removeChild(element);
    element = null;
    instance = null;
  }

  // Regular non-looped carousels
  describe('for regular carousels', () => {
    beforeEach(() => {
      createFixture('carousel-basic-fixture');
      instance.animationSpeed = 100;
    });

    afterEach(removeFixture);

    it('will throw a TypeError if initialized without an element', () => {
      expect(() => {
        new OdoCarousel({}); // eslint-disable-line no-new
      }).to.throw(TypeError);

      expect(() => {
        new OdoCarousel(null); // eslint-disable-line no-new
      }).to.throw(TypeError);

      expect(() => {
        new OdoCarousel(undefined); // eslint-disable-line no-new
      }).to.throw(TypeError);

      expect(() => {
        const fakejQuery = { 0: document.createElement('div'), length: 1, jquery: 'foo' };
        new OdoCarousel(fakejQuery); // eslint-disable-line no-new
      }).to.throw(TypeError);
    });

    it('can initialize correctly.', () => {
      expect(instance.getSelectedIndex()).to.equal(0);
      expect(instance.domIndex).to.equal(0);
      expect(instance.lastDomIndex).to.equal(0);
      expect(instance._isJumped).to.equal(false);
      expect(instance._offsetPosition).to.equal('offsetLeft');
      expect(instance._dimensionAttr).to.equal('width');
      expect(instance.hasDragged).to.equal(false);
      expect(instance._isBidirectional).to.equal(false);
      expect(instance.isFirstSlide()).to.be.true;
      expect(instance.getSlides()).to.have.lengthOf(4);
      expect(instance.options.template.paddles).to.equal(OdoCarousel.Defaults.template.paddles);
    });

    it('can determine safe indices', () => {
      expect(instance._getSafeIndex(0)).to.equal(0);
      expect(instance._getSafeIndex(1)).to.equal(1);
      expect(instance._getSafeIndex(4)).to.equal(3);
      expect(instance._getSafeIndex(100)).to.equal(3);
      expect(instance._getSafeIndex(-1)).to.equal(0);
      expect(instance._getSafeIndex(-50)).to.equal(0);
    });

    it('should fail silently for non-looped carousels at the end', (done) => {
      function afterGoToLastSlide() {
        // Go to "4", which doesn't exist on this non-looped carousel.
        instance.goToNextSlide();
        expect(instance.getSelectedIndex()).to.equal(instance.getSlides().length - 1);

        // Done.
        done();
      }

      // Go to -1. Synchronus because the carousel doesn't move.
      instance.goToPreviousSlide();
      expect(instance.getSelectedIndex()).to.equal(0);

      // Listen for when the scope has gotten to the last slide.
      instance.once(OdoCarousel.EventType.SLIDE_END, () => {
        afterGoToLastSlide();
      });

      // Go to the last slide, which is index 3.
      instance.setSelectedIndex(instance.getSlides().length - 1);
    });

    it('can tell when it moves towards an edge', (done) => {
      function first() {
        expect(instance._isMovingTowardsEdge(-10, -10)).to.be.true;
        expect(instance._isMovingTowardsEdge(10, 10)).to.be.false;
        done();
      }

      expect(instance._isMovingTowardsEdge(-10, -10)).to.be.false;
      expect(instance._isMovingTowardsEdge(10, 10)).to.be.true;

      instance.once(OdoCarousel.EventType.SLIDE_END, first);
      instance.setSelectedIndex(instance.getSlides().length - 1);
    });

    it('can navigate after drags', () => {
      const closest = sinon.spy(instance, 'goToNearestSlide');
      sinon.stub(instance, 'setSelectedIndex');
      instance.hasDragged = true;

      // Has velocity and swipe left. Should go next.
      instance.navigateAfterDrag({
        x: 0.9,
        y: 0.9,
      }, 'left', false);

      expect(closest.calledWith(true)).to.be.true;
      expect(closest.neverCalledWith(false)).to.be.true;
      expect(closest.neverCalledWith(undefined)).to.be.true;
      expect(closest.callCount).to.equal(1);

      // Restore the stub and go to the second slide without animation to
      // keep everything sync.
      instance.setSelectedIndex.restore();
      instance.setSelectedIndex(1, true);
      sinon.stub(instance, 'setSelectedIndex');

      // Has velocity and swipe right. Should go previous.
      instance.navigateAfterDrag({
        x: 0.9,
        y: 0.9,
      }, 'right', false);

      expect(closest.calledWith(false)).to.be.true;
      expect(closest.callCount).to.equal(2);

      instance.hasDragged = false;

      // No velocity, but it did move on the axis.
      instance.navigateAfterDrag({
        x: 0,
        y: 0,
      }, 'does not matter', true);

      expect(closest.callCount).to.equal(3);

      // No movement on axis (just a tap). This won't call anything.
      instance.navigateAfterDrag({
        x: 0,
        y: 0,
      }, 'no_movement', false);

      expect(closest.callCount).to.equal(3);
    });

    it('can add a slide', () => {
      const newSlide = '<div class="' + OdoCarousel.Classes.SLIDE +
        ' the-new-slide"></div>';
      instance.addSlide(newSlide);
      expect(instance.getSlides()).to.have.lengthOf(5);
      expect(instance.getSlideIndices()).to.deep.equal([0, 1, 2, 3, 4]);
      expect(instance.getSlide(4).classList.contains('the-new-slide')).to.be.true;
    });

    it('can find the nearest slide', () => {
      const positions = sinon.stub(instance, '_getPositions');
      const setSelected = sinon.stub(instance, 'setSelectedIndex');
      const getSelected = sinon.stub(instance, 'getSelectedIndex');

      getSelected.returns(0);
      positions.returns([-1, 100, 200, 300]);

      instance.goToNearestSlide();
      expect(setSelected.calledWith(0)).to.be.true;
      setSelected.reset();

      instance.goToNearestSlide(true);
      expect(setSelected.calledWith(1)).to.be.true;
      setSelected.reset();

      instance.goToNearestSlide(false);
      expect(setSelected.calledWith(0)).to.be.true;
      setSelected.reset();

      // Go to the end
      getSelected.returns(3);
      positions.returns([-300, -200, -100, 0]);

      // Go next, it should clamp.
      instance.goToNearestSlide(true);
      expect(setSelected.calledWith(3)).to.be.true;
      setSelected.reset();

      // Go prev, it should go back one.
      instance.goToNearestSlide(false);
      expect(setSelected.calledWith(2)).to.be.true;
      setSelected.reset();
    });

    it('will not navigate when disabled', () => {
      expect(instance.isEnabled).to.equal(true);

      // Disable.
      instance.isEnabled = false;
      expect(instance.isEnabled).to.equal(false);

      // Navigate.
      expect(instance.setSelectedIndex(1)).to.equal(false);
    });

    it('can be prevented from navigating', () => {
      instance.once(OdoCarousel.EventType.WILL_NAVIGATE, (event) => {
        event.preventDefault();
      });

      expect(instance.goToNextSlide()).to.be.false;
    });

    it('can disable draggability', () => {
      instance.setDraggable(false);
      expect(instance._isDraggable).to.be.false;
      expect(instance.draggable.isEnabled).to.be.false;
    });

    it('will pause a slideshow when dragging starts', () => {
      const stub = sinon.stub(instance, 'pauseSlideshow');
      instance._handleDragStart();
      expect(stub.callCount).to.equal(1);
    });

    it('will cancel the pending transition end on drag start for non-looped carousels', () => {
      expect(instance.isTransitioning).to.be.false;
      instance.isTransitioning = true;
      expect(instance.isTransitioning).to.be.true;
      instance._cancelMovement();
      expect(instance.isTransitioning).to.be.false;
    });

    it('will set friction on drag move when moving towards an edge', () => {
      const stub = sinon.stub(instance, '_isMovingTowardsEdge').returns(true);
      expect(instance.draggable.friction).to.equal(1);

      instance._handleDragMove({
        delta: { x: 10, y: 0 },
      });

      expect(instance.draggable.friction).to.equal(0.4);
      expect(stub.callCount).to.equal(1);

      stub.returns(false);
      instance._handleDragMove({
        delta: { x: 10, y: 0 },
      });

      expect(instance.draggable.friction).to.equal(1);
      expect(stub.callCount).to.equal(2);

      instance.options.isLooped = true;
      instance._handleDragMove({
        delta: { x: 10, y: 0 },
      });
      expect(stub.callCount).to.equal(2);
    });

    // Chrome on windows bug where clicking on the carousel caused a mousemove event,
    // which triggered hasDragged to be true when it shouldn't be.
    it('will not assume drag move events mean the carousel has dragged', () => {
      const stub = sinon.stub(instance, '_isMovingTowardsEdge').returns(false);
      expect(instance.hasDragged).to.be.false;

      instance._handleDragMove({
        delta: { x: 10, y: 0 },
      });
      expect(instance.hasDragged).to.be.true;

      instance._handleDragMove({
        delta: { x: 0, y: -10 },
      });
      expect(instance.hasDragged).to.be.false;

      instance.isVertical = true;
      instance._handleDragMove({
        delta: { x: 0, y: -10 },
      });
      expect(instance.hasDragged).to.be.true;

      instance._handleDragMove({
        delta: { x: 0, y: 0 },
      });
      expect(instance.hasDragged).to.be.false;

      stub.restore();
    });

    it('will call navigate after drag on drag end', () => {
      const stub = sinon.stub(instance, 'navigateAfterDrag');
      instance._handleDragEnd({
        velocity: 'foo',
        axisDirection: 'bar',
        didMoveOnAxis: true,
      });
      expect(stub.callCount).to.equal(1);
      expect(stub.calledWith('foo', 'bar', true)).to.be.true;
    });

    it('will navigate if going to the same slide with animation if dragging occurred', () => {
      instance.domIndex = 1;
      instance.hasDragged = false;
      expect(instance._canNavigate(1)).be.false;

      instance.hasDragged = true;
      expect(instance._canNavigate(1)).be.true;
    });
  });

  describe('a carousel with a starting index', () => {
    beforeEach(() => {
      createFixture('carousel-basic-fixture', {
        startIndex: 1,
        pagination: true,
        animationSpeed: 100,
      });
    });

    afterEach(removeFixture);

    it('will start on the given index', () => {
      expect(instance.getSelectedIndex()).to.equal(1);
    });

    it('can reset the carousel and keep the same slide index', (done) => {
      instance.once(OdoCarousel.EventType.SLIDE_END, () => {
        expect(instance.getSelectedIndex()).to.equal(2);

        instance.reset();

        expect(instance.getSelectedIndex()).to.equal(2);

        done();
      });

      instance.goToNextSlide();
    });

    it('can determine what was clicked on with the delegated click listener', () => {
      const setSelected = sinon.stub(instance, 'setSelectedIndex');
      const previous = sinon.stub(instance, 'goToPreviousSlide');
      const next = sinon.stub(instance, 'goToNextSlide');

      const event = {
        target: instance._paginationDots[2].dot,
        preventDefault: sinon.spy(),
      };

      instance._handleClick(event);

      expect(setSelected.calledWith(2)).to.be.true;
      expect(event.preventDefault.callCount).to.equal(1);

      event.target = instance._paddleNext;
      instance._handleClick(event);
      expect(next.callCount).to.equal(1);

      event.target = instance._paddlePrevious;
      instance._handleClick(event);
      expect(previous.callCount).to.equal(1);

      event.target = instance.element;
      instance._handleClick(event);
      expect(event.preventDefault.callCount).to.equal(3);

      // Will prevent default when click events occur while transitioning.
      instance.isTransitioning = true;
      instance._handleClick(event);
      expect(event.preventDefault.callCount).to.equal(4);
    });
  });

  describe('custom paddle and pagination controls', () => {
    beforeEach(() => {
      createFixture('carousel-basic-fixture', {
        pagination: true,
        getNavPaddleHtml() {
          return '';
        },

        getPaginationHtml(carousel) {
          const totalSlides = carousel.getSlides().length;

          let dotsHtml = '';
          for (let i = 0; i < totalSlides; i++) {
            dotsHtml += OdoCarousel.template(carousel.options.template.paginationDot, {
              index: i,
            });
          }

          const open = '<nav class="' + OdoCarousel.Classes.PAGINATION + '">';
          const close = '</nav>';

          return open + dotsHtml + close;
        },
      });
    });

    afterEach(removeFixture);

    it('will start on the given index', () => {
      expect(instance._paginationDots).to.have.lengthOf(4);
    });
  });

  // Regular slideshow
  describe('regular slideshows', () => {
    beforeEach(() => {
      createFixture('carousel-basic-fixture', {
        animationSpeed: 100,
        slideshowSpeed: 150,
      });
    });

    afterEach(removeFixture);

    it('should pause at the last slide', (done) => {
      function finishedAnimating() {
        if (instance.isLastSlide()) {
          setTimeout(() => {
            expect(instance._isSlideshowPlaying()).to.be.false;
            expect(instance._timer.isTicking).to.be.false;
            instance.off(OdoCarousel.EventType.SLIDE_END, finishedAnimating);
            done();
          }, instance.options.slideshowSpeed + 20);
        }
      }

      instance.on(OdoCarousel.EventType.SLIDE_END, finishedAnimating);

      instance.startSlideshow();
    });

    it('can handle calling pause when it is already paused', () => {
      instance.pauseSlideshow();
      instance.pauseSlideshow();
      expect(instance._isSlideshowPlaying()).to.be.false;
    });

    it('can handle calling start when it is already started', () => {
      instance.startSlideshow();
      instance.startSlideshow();
      expect(instance._isSlideshowPlaying()).to.be.true;
    });
  });

  describe('looped carousel with 4 slides', () => {
    beforeEach(() => {
      createFixture('carousel-looped-4-slides-fixture', {
        isLooped: true,
        animationSpeed: 100,
      });
    });

    afterEach(removeFixture);

    it('can determine safe indices', () => {
      expect(instance._getSafeIndex(0)).to.equal(0);
      expect(instance._getSafeIndex(1)).to.equal(1);
      expect(instance._getSafeIndex(4)).to.equal(0);
      expect(instance._getSafeIndex(7)).to.equal(3);
      expect(instance._getSafeIndex(-1)).to.equal(3);
      expect(instance._getSafeIndex(-8)).to.equal(0);
    });

    it('can emit events with correct indices', (done) => {
      // At the second slide.
      function t1(evt) {
        expect(evt.from).to.equal(0);
        expect(evt.to).to.equal(1);
      }

      function afterFirst() {
        instance.once(OdoCarousel.EventType.SLIDE_START, t2);
        instance.once(OdoCarousel.EventType.SLIDE_END, afterSecond);
        instance.setSelectedIndex(3);
      }

      // At the last (fourth) slide.
      function t2(evt) {
        expect(evt.from).to.equal(1);
        expect(evt.to).to.equal(3);
      }

      function afterSecond() {
        instance.once(OdoCarousel.EventType.SLIDE_START, t3);
        instance.once(OdoCarousel.EventType.SLIDE_END, afterThird);
        instance.goToNextSlide();
      }

      // At the first slide.
      function t3(evt) {
        expect(evt.from).to.equal(3);
        expect(evt.to).to.equal(0);
      }

      function afterThird() {
        instance.once(OdoCarousel.EventType.SLIDE_START, t4);
        instance.once(OdoCarousel.EventType.SLIDE_END, afterFourth);
        instance.goToPreviousSlide();
      }

      // At the last (fourth) slide.
      function t4(evt) {
        expect(evt.from).to.equal(0);
        expect(evt.to).to.equal(3);
      }

      function afterFourth(evt) {
        t4(evt);
        done();
      }

      // First slide start.
      instance.once(OdoCarousel.EventType.SLIDE_START, t1);
      instance.once(OdoCarousel.EventType.SLIDE_END, afterFirst);

      // Trigger transition.
      instance.goToNextSlide();
    });

    it('can calculate the offset of the carousel relative to the current slide', () => {
      instance.element.style.width = '1200px';
      instance._moveToPosition('-500px', true);
      expect(instance._getCarouselOffset()).to.equal(700);

      instance._selectedIndex = 1;
      expect(instance._getCarouselOffset()).to.equal(1900);
    });
  });

  describe('looped carousel with 3 slides', () => {
    beforeEach(() => {
      createFixture('carousel-looped-3-slides-fixture', {
        isLooped: true,
        animationSpeed: 100,
      });
    });

    afterEach(removeFixture);

    it('should work as expected', (done) => {
      function second() {
        instance.once(OdoCarousel.EventType.SLIDE_END, third);
        expect(instance.getSelectedIndex()).to.equal(1);
        instance.goToNextSlide();
      }

      function third() {
        instance.once(OdoCarousel.EventType.SLIDE_END, backToStart);
        expect(instance.getSelectedIndex()).to.equal(2);
        instance.goToNextSlide();
      }

      function backToStart() {
        expect(instance.getSelectedIndex()).to.equal(0);
        done();
      }

      instance.once(OdoCarousel.EventType.SLIDE_END, second);
      instance.goToNextSlide();
    });
  });

  describe('bidirectional carousel with 2 slides', () => {
    beforeEach(() => {
      createFixture('carousel-bidirectional-2-slides-fixture', {
        isLooped: true,
        animationSpeed: 100,
        pagination: true,
      });
    });

    afterEach(removeFixture);

    it('should render four slides', (done) => {
      expect(instance.getSlides().length).to.equal(4);
      done();
    });

    it('will remove the cloned slides when destroyed', () => {
      instance.dispose();
      const slides = Array.from(element.querySelectorAll('.' + OdoCarousel.Classes.SLIDE));
      expect(slides).to.have.lengthOf(2);
    });

    it('should activate secondary pagination dots', (done) => {
      expect(instance._paginationDots[0].dot.classList.contains('is-selected')).to.be.true;
      expect(instance._paginationDots[2].dot.classList.contains('is-selected')).to.be.true;

      function second() {
        instance.once(OdoCarousel.EventType.SLIDE_END, third);
        expect(instance._paginationDots[1].dot.classList.contains('is-selected')).to.be.true;
        expect(instance._paginationDots[3].dot.classList.contains('is-selected')).to.be.true;
        instance.goToNextSlide();
      }

      function third() {
        instance.once(OdoCarousel.EventType.SLIDE_END, fourth);
        expect(instance._paginationDots[0].dot.classList.contains('is-selected')).to.be.true;
        expect(instance._paginationDots[2].dot.classList.contains('is-selected')).to.be.true;
        instance.goToNextSlide();
      }

      function fourth() {
        instance.once(OdoCarousel.EventType.SLIDE_END, backToStart);
        expect(instance._paginationDots[1].dot.classList.contains('is-selected')).to.be.true;
        expect(instance._paginationDots[3].dot.classList.contains('is-selected')).to.be.true;
        instance.goToNextSlide();
      }

      function backToStart() {
        expect(instance._paginationDots[0].dot.classList.contains('is-selected')).to.be.true;
        expect(instance._paginationDots[2].dot.classList.contains('is-selected')).to.be.true;
        done();
      }

      instance.once(OdoCarousel.EventType.SLIDE_END, second);
      instance.goToNextSlide();
    });
  });

  // Looped (aka infinite) carousels.
  describe('looped carousels', () => {
    beforeEach(() => {
      createFixture('carousel-looped-fixture', {
        isLooped: true,
        animationSpeed: 100,
        neighborCount: 4,
      });
    });

    afterEach(removeFixture);

    it('should loop', (done) => {
      // At end.
      function one() {
        instance.once(OdoCarousel.EventType.SLIDE_END, two);
        expect(instance.getSelectedIndex()).to.equal(instance.getSlides().length - 1);
        instance.goToNextSlide();
      }

      // End to 0.

      function two() {
        // Loop around to zero.
        instance.once(OdoCarousel.EventType.SLIDE_END, three);
        expect(instance.getSelectedIndex()).to.equal(0);
        instance.goToNextSlide();
      }

      // 0 to 1.

      function three() {
        // Loop around to zero.
        instance.once(OdoCarousel.EventType.SLIDE_END, four);
        expect(instance.getSelectedIndex()).to.equal(1);
        instance.goToPreviousSlide();
      }

      // 1 to 0

      function four() {
        // Loop around to zero.
        instance.once(OdoCarousel.EventType.SLIDE_END, five);
        expect(instance.getSelectedIndex()).to.equal(0);
        instance.goToPreviousSlide();
      }

      // 0 to end

      function five() {
        expect(instance.getSelectedIndex()).to.equal(instance.getSlides().length - 1);
        done();
      }

      instance.once(OdoCarousel.EventType.SLIDE_END, one);

      // Go to the last slide.
      instance.setSelectedIndex(instance.getSlides().length - 1);
    });

    it('can maintain the correct order with more neighbors', (done) => {
      let order = [6, 7, 8, 9, 0, 1, 2, 3, 4, 5];

      function getSlideIndicesFromDom() {
        const slides = Array.from(element.querySelectorAll('.' + OdoCarousel.Classes.SLIDE));
        return slides.map(slide => parseInt(slide.getAttribute('data-slide-index'), 10));
      }

      function first() {
        // Order should not change.
        expect(instance.getSlideIndices()).to.deep.equal(order);
        expect(getSlideIndicesFromDom()).to.deep.equal(order);
        instance.once(OdoCarousel.EventType.SLIDE_END, second);
        instance.goToNextSlide();
      }

      function second() {
        order = [7, 8, 9, 0, 1, 2, 3, 4, 5, 6];
        expect(instance.getSlideIndices()).to.deep.equal(order);
        expect(getSlideIndicesFromDom()).to.deep.equal(order);
        instance.once(OdoCarousel.EventType.SLIDE_END, third);
        instance.setSelectedIndex(6);
      }

      function third() {
        order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        expect(instance.getSlideIndices()).to.deep.equal(order);
        expect(getSlideIndicesFromDom()).to.deep.equal(order);
        instance.once(OdoCarousel.EventType.SLIDE_END, fourth);
        instance.setSelectedIndex(2);
      }

      function fourth() {
        order = [8, 9, 0, 1, 2, 3, 4, 5, 6, 7];
        expect(instance.getSlideIndices()).to.deep.equal(order);
        expect(getSlideIndicesFromDom()).to.deep.equal(order);
        instance.once(OdoCarousel.EventType.SLIDE_END, fifth);
        instance.goToPreviousSlide();
      }

      function fifth() {
        order = [7, 8, 9, 0, 1, 2, 3, 4, 5, 6];
        expect(instance.getSlideIndices()).to.deep.equal(order);
        expect(getSlideIndicesFromDom()).to.deep.equal(order);
        instance.once(OdoCarousel.EventType.SLIDE_END, sixth);
        instance.setSelectedIndex(9);
      }

      function sixth() {
        order = [5, 6, 7, 8, 9, 0, 1, 2, 3, 4];
        expect(instance.getSlideIndices()).to.deep.equal(order);
        expect(getSlideIndicesFromDom()).to.deep.equal(order);
        done();
      }

      expect(instance.getSlideIndices()).to.deep.equal(order);
      expect(getSlideIndicesFromDom()).to.deep.equal(order);

      instance.once(OdoCarousel.EventType.SLIDE_END, first);

      instance.goToNextSlide();
    });

    it('can add a slide', () => {
      const newSlide = '<div class="' + OdoCarousel.Classes.SLIDE +
        ' the-new-slide"></div>';
      instance.addSlide(newSlide);
      expect(instance.getSlides()).to.have.lengthOf(11);
      expect(instance.getSlideIndices()).to.deep.equal([7, 8, 9, 10, 0, 1, 2, 3, 4, 5, 6]);
      expect(instance.getSlide(10).classList.contains('the-new-slide')).to.be.true;
    });
  });

  describe('does not need to use transforms', () => {
    const canDoIt = OdoDevice.CAN_TRANSITION_TRANSFORMS;

    beforeEach(() => {
      OdoDevice.CAN_TRANSITION_TRANSFORMS = false;
      createFixture('carousel-looped-fixture', {
        isLooped: true,
        animationSpeed: 100,
        neighborCount: 4,
      });
    });

    afterEach(() => {
      removeFixture();
      OdoDevice.CAN_TRANSITION_TRANSFORMS = canDoIt;
    });

    it('can use top/left relative position.', (done) => {
      instance.goToNextSlide();
      instance.once(OdoCarousel.EventType.SLIDE_END, () => {
        expect(instance.getSelectedIndex()).to.equal(1);
        done();
      });
    });
  });

  // Jumped.
  describe('for jumped carousels', () => {
    beforeEach(() => {
      createFixture('carousel-basic-fixture', {
        isLooped: true,
        isJumped: true,
        pagination: true,
        animationSpeed: 100,
      });
    });

    afterEach(removeFixture);

    it('should be at zero with a neighbor', () => {
      const firstSlide = instance.getCarouselElement().firstElementChild;
      expect(firstSlide.classList.contains('odo-carousel__slide--previous')).to.be.true;
    });

    it('can reset slides correctly', (done) => {
      function moved() {
        expect(instance.getSlideIndices()).to.deep.equal([0, 1, 2, 3]);

        instance.once(OdoCarousel.EventType.SLIDE_END, movedAgain);
        instance.setSelectedIndex(0);
      }

      function movedAgain() {
        expect(instance.getSlideIndices()).to.deep.equal([3, 0, 1, 2]);
        done();
      }

      instance.once(OdoCarousel.EventType.SLIDE_END, moved);
      instance.setSelectedIndex(2);
    });

    it('will cancel the transition end and reset the carousel position', () => {
      instance.isTransitioning = true;
      instance._isJumped = true;
      const spy = sinon.spy(instance, '_cancelMovement');
      const spy2 = sinon.spy(instance, '_setSlidesToLogicalOrder');

      instance._cancelMovement();
      expect(spy.called).to.be.true;
      expect(spy2.called).to.be.true;
    });
  });

  // Vertical
  describe('for vertical carousels', () => {
    beforeEach(() => {
      createFixture('carousel-basic-fixture', {
        isVertical: true,
        animationSpeed: 100,
      });
    });

    afterEach(removeFixture);

    it('should navigate.', (done) => {
      instance.goToNextSlide();
      instance.once(OdoCarousel.EventType.SLIDE_END, () => {
        expect(instance.getSelectedIndex()).to.equal(1);
        done();
      });
    });

    it('can tell when it moves towards an edge', (done) => {
      function first() {
        expect(instance._isMovingTowardsEdge(-10, -10)).to.be.true;
        expect(instance._isMovingTowardsEdge(10, 10)).to.be.false;
        done();
      }

      expect(instance._isMovingTowardsEdge(-10, -10)).to.be.false;
      expect(instance._isMovingTowardsEdge(10, 10)).to.be.true;

      instance.once(OdoCarousel.EventType.SLIDE_END, first);
      instance.setSelectedIndex(instance.getSlides().length - 1);
    });

    it('can navigate after drags', () => {
      const closest = sinon.spy(instance, 'goToNearestSlide');
      sinon.stub(instance, 'setSelectedIndex');
      instance.hasDragged = true;

      // Has velocity and swipe left. Should go next.
      instance.navigateAfterDrag({
        x: 0.9,
        y: 0.9,
      }, 'up', false);

      expect(closest.calledWith(true)).to.be.true;
      expect(closest.callCount).to.equal(1);

      // Restore the stub and go to the second slide without animation to
      // keep everything sync.
      instance.setSelectedIndex.restore();
      instance.setSelectedIndex(1, true);
      sinon.stub(instance, 'setSelectedIndex');

      // Has velocity and swipe right. Should go previous.
      instance.navigateAfterDrag({
        x: 0.9,
        y: 0.9,
      }, 'down', false);

      expect(closest.calledWith(false)).to.be.true;
      expect(closest.callCount).to.equal(2);
    });
  });

  describe('for slide children carousels', () => {
    beforeEach(() => {
      createFixture('carousel-slide-children-fixture');
    });

    afterEach(removeFixture);

    it('can find all slide children', () => {
      const children = instance._getSlideChildren();
      expect(children).to.have.lengthOf(7);
    });

    it('can find slide children for a single slide', () => {
      const children = instance._getSlideChildren(instance.getSlide(2));
      expect(children).to.have.lengthOf(1);
    });

    it('can calculate where to position the carousel', () => {
      instance.element.style.width = '1000px';
      instance.setSelectedIndex(1, true);
      sinon.stub(instance, 'isLastSlide').returns(true);

      // 333.333 :: children sum
      // 1000 :: slide size
      // 1333 = 2000 - (1000 - 333) :: new position
      // 0.06665 = 1333 / 20,000 :: percentage (carousel is 2000% width).
      const position = instance._getNewPosition(instance.getSlide(2));
      expect(position).to.equal(0.06665);
    });
  });

  describe('fading carousels', () => {
    beforeEach(() => {
      createFixture('carousel-fade-fixture', {
        isFade: true,
        animationSpeed: 200,
      });
    });

    afterEach(removeFixture);

    it('should add transitions to each slide', () => {
      expect(instance.options.isFade).to.be.true;
      instance.getSlides().forEach((slide) => {
        expect(slide.style[OdoDevice.Dom.TRANSITION]).to.exist;
      });
    });

    it('will calculate the crossfade timeout', () => {
      // 200 - (200 * 0.875)
      expect(instance._crossfadeTimeout).to.equal(25);
    });

    it('will emit slide end event', (done) => {
      instance.once(OdoCarousel.EventType.SLIDE_END, () => {
        expect(instance.getSlide(1).classList.contains(OdoCarousel.Classes.VISIBLE)).to.be.true;
        expect(instance.getSlide(0).classList.contains(OdoCarousel.Classes.BEHIND)).to.be.false;
        done();
      });

      instance._crossfadeTimeout = 0;
      instance.setSelectedIndex(1);
    });

    it('will not navigate when disabled', () => {
      expect(instance.isEnabled).to.equal(true);

      // Disable.
      instance.isEnabled = false;
      expect(instance.isEnabled).to.equal(false);

      // Navigate.
      expect(instance.setSelectedIndex(1)).to.equal(false);
    });

    it('will cancel the transition end event', () => {
      const spy = sinon.spy(instance, '_getCarouselOffset');
      instance.isTransitioning = true;
      instance._cancelMovement();
      expect(instance.isTransitioning).to.be.false;
      expect(spy.called).to.be.false;
    });

    it('will navigate upon swipes', () => {
      expect(instance.pointer).to.exist;

      const previous = sinon.stub(instance, 'goToPreviousSlide');
      const next = sinon.stub(instance, 'goToNextSlide');

      instance._handlePointerEnd({
        velocity: {
          x: OdoPointer.SWIPE_VELOCITY - 0.1,
          y: 0,
        },
        direction: OdoPointer.Direction.LEFT,
      });

      expect(previous.callCount).to.equal(0);
      expect(next.callCount).to.equal(0);

      instance._handlePointerEnd({
        velocity: {
          x: OdoPointer.SWIPE_VELOCITY + 0.1,
          y: 0,
        },
        direction: OdoPointer.Direction.LEFT,
      });

      expect(previous.callCount).to.equal(0);
      expect(next.callCount).to.equal(1);

      instance._handlePointerEnd({
        velocity: {
          x: OdoPointer.SWIPE_VELOCITY + 0.1,
          y: 0,
        },
        direction: OdoPointer.Direction.RIGHT,
      });

      expect(previous.callCount).to.equal(1);
      expect(next.callCount).to.equal(1);

      instance._handlePointerEnd({
        velocity: {
          x: OdoPointer.SWIPE_VELOCITY + 0.1,
          y: 0,
        },
        direction: OdoPointer.Direction.UP,
      });

      expect(previous.callCount).to.equal(1);
      expect(next.callCount).to.equal(1);
    });
  });

  describe('fading carousels without transitions', () => {
    const hasIt = OdoDevice.HAS_TRANSITIONS;

    beforeEach(() => {
      OdoDevice.HAS_TRANSITIONS = false;
      createFixture('carousel-fade-fixture', {
        isFade: true,
      });
    });

    afterEach(() => {
      removeFixture();
      OdoDevice.HAS_TRANSITIONS = hasIt;
    });

    it('still works', (done) => {
      instance.once(OdoCarousel.EventType.SLIDE_END, () => {
        expect(instance.getSlide(1).classList.contains(OdoCarousel.Classes.VISIBLE)).to.be.true;
        expect(instance.getSlide(0).classList.contains(OdoCarousel.Classes.BEHIND)).to.be.false;
        done();
      });

      instance.setSelectedIndex(1);
    });
  });

  describe('with `isCentered` option', () => {
    beforeEach(() => {
      createFixture('carousel-assorted-sizes-fixture', {
        animationSpeed: 40,
        isCentered: true,
      });
    });

    afterEach(removeFixture);

    it('will center the current slide within the wrapper', () => {
      expect(instance._startEdge).to.equal(100);
      instance.setSelectedIndex(1, true);
      expect(instance._startEdge).to.equal(300);
    });
  });
});
