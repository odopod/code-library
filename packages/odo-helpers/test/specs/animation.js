/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

// Create new stylesheet.
const style = document.createElement('style');
style.type = 'text/css';
document.getElementsByTagName('head')[0].appendChild(style);
const sheet = style.sheet || style.styleSheet;
const prefix = {
  WebkitAnimation: '-webkit-',
  animation: '',
}[window.OdoDevice.Dom.ANIMATION];

function insertKeyframeAnimation(name, rules) {
  let str = `@${prefix}keyframes ${name}{`;
  Object.keys(rules).forEach((key) => {
    str += ` ${key} {${rules[key]}}`;
  });

  str += ' }';
  sheet.insertRule(str, 0);
}

describe('The animation helpers', () => {
  const expect = window.chai.expect;
  const OdoDevice = window.OdoDevice;
  const animation = window.OdoHelpers.animation;
  const sinon = window.sinon;

  describe('#onTransitionEnd', () => {
    let element;
    beforeEach(() => {
      element = document.createElement('div');
      element.style.cssText = 'position:relative;left:2px;top:0;width:200px;height:200px;';
      element.style[OdoDevice.Dom.TRANSITION] = 'all 80ms ease';

      document.body.appendChild(element);

      // Relayout.
      element.offsetWidth;
    });

    afterEach(() => {
      document.body.removeChild(element);
      element = null;
    });

    it('can tell me when the transition is done and keep context', (done) => {
      element.style.left = '50px';

      const context = {
        tacos: 'delicious',
      };

      animation.onTransitionEnd(element, function callback() {
        expect(this.tacos).to.equal('delicious');
        done();
      }, context);
    });

    it('can tell me when the transition is done for a given property', (done) => {
      element.style[OdoDevice.Dom.TRANSITION_PROPERTY] = 'left, top';
      element.style[OdoDevice.Dom.TRANSITION_DELAY] = '0, 50ms';

      element.style.top = '50px';
      element.style.left = '200px';

      animation.onTransitionEnd(element, (evt) => {
        expect(evt.propertyName).to.equal('top');
        done();
      }, null, 'top');
    });

    it('should use the transition end event when it happens with a timeout provided', (done) => {
      element.style.left = '200px';

      animation.onTransitionEnd(element, (evt) => {
        expect(evt.fake).not.to.be.true;
        expect(evt.propertyName).to.equal('left');
        done();
      }, null, null, 200);
    });

    it('will set a fallback timer if a timeout is provided', (done) => {
      animation.onTransitionEnd(element, (evt) => {
        expect(evt.fake).to.be.true;
        done();
      }, null, null, 200);
    });

    describe('without native transitions', () => {
      const hasTransitions = OdoDevice.HAS_TRANSITIONS;

      beforeEach(() => {
        OdoDevice.HAS_TRANSITIONS = false;
        element.style.webkitTransitionDuration = '0s';
        element.style.transitionDuration = '0s';
      });

      afterEach(() => {
        OdoDevice.HAS_TRANSITIONS = hasTransitions;
      });

      it('should happen async but immediately', (done) => {
        element.style.left = '200px';

        animation.onTransitionEnd(element, () => {
          expect(window.getComputedStyle(element).left).to.equal('200px');
          done();
        });
      });
    });

    it('will work with a jQuery wrapped element', (done) => {
      const $element = {
        0: element,
        context: element,
        length: 1,
        jquery: '2.2.2',
      };

      element.style.left = '50px';

      animation.onTransitionEnd($element, () => {
        done();
      });
    });

    it('should throw if using a jQuery collection with more than one element', () => {
      const element2 = document.createElement('div');
      const $collection = {
        0: element,
        1: element2,
        context: element,
        length: 2,
        jquery: '2.2.2',
      };

      const fn = animation.onTransitionEnd.bind(null, $collection);

      expect(fn).to.throw(TypeError);
    });
  });

  describe('#cancelTransitionEnd', () => {
    let element;
    beforeEach(() => {
      element = document.createElement('div');
      element.style.cssText = 'position:relative;left:2px;top:0;width:200px;height:200px;';
      element.style[OdoDevice.Dom.TRANSITION] = 'all 100ms ease';

      document.body.appendChild(element);

      // Relayout.
      element.offsetWidth;
    });

    afterEach(() => {
      document.body.removeChild(element);
      element = null;
    });

    it('can cancel a transition end callback', (done) => {
      element.style.left = '50px';

      const callback = sinon.spy();

      const id = animation.onTransitionEnd(element, callback);
      expect(Object.keys(animation._transitions)).to.have.length(1);

      animation.cancelTransitionEnd(id);
      expect(Object.keys(animation._transitions)).to.have.length(0);

      // Cancel one which doesn't exist.
      expect(() => {
        animation.cancelTransitionEnd('foo');
      }).not.to.throw(Error);

      setTimeout(() => {
        expect(callback.callCount).to.equal(0);
        done();
      }, 120);
    });

    it('can cancel multiple transition callbacks', () => {
      element.style.left = '50px';

      const callback1 = sinon.spy();
      const callback2 = sinon.spy();
      const callback3 = sinon.spy();

      const id1 = animation.onTransitionEnd(element, callback1);
      const id2 = animation.onTransitionEnd(element, callback2);
      const id3 = animation.onTransitionEnd(element, callback3);
      expect(Object.keys(animation._transitions)).to.have.length(3);

      animation.cancelTransitionEnd(id1);
      animation.cancelTransitionEnd(id2);
      animation.cancelTransitionEnd(id3);
      expect(Object.keys(animation._transitions)).to.have.length(0);

      expect(callback1.callCount).to.equal(0);
      expect(callback2.callCount).to.equal(0);
      expect(callback3.callCount).to.equal(0);
    });

    describe('without native transitions', () => {
      const hasTransitions = OdoDevice.HAS_TRANSITIONS;

      beforeEach(() => {
        OdoDevice.HAS_TRANSITIONS = false;
        element.style.webkitTransitionDuration = '0s';
        element.style.transitionDuration = '0s';
      });

      afterEach(() => {
        OdoDevice.HAS_TRANSITIONS = hasTransitions;
      });

      it('will cancel the fallback timer', (done) => {
        element.style.left = '200px';

        const callback = sinon.spy();

        const id = animation.onTransitionEnd(element, callback);
        expect(Object.keys(animation._transitions)).to.have.length(1);

        animation.cancelTransitionEnd(id);
        expect(Object.keys(animation._transitions)).to.have.length(0);

        setTimeout(() => {
          expect(callback.callCount).to.equal(0);
          done();
        }, 20);
      });
    });
  });

  describe('#fadeElement', () => {
    let element;
    let clock;

    beforeEach(() => {
      element = document.createElement('div');
      element.style.cssText = 'position:relative;left:2px;top:0;width:200px;height:200px;';
      element.style[OdoDevice.Dom.TRANSITION] = 'all 100ms ease';

      document.body.appendChild(element);

      // Relayout.
      element.offsetWidth;

      clock = sinon.useFakeTimers();

      // Stub ontransitionend to execute the callback on a zero timeout.
      sinon.stub(animation, 'onTransitionEnd').callsFake((el, fn, context) => {
        setTimeout(() => {
          fn.call(context, {
            target: el,
            currentTarget: el,
          });
        }, 0);

        return 'foo';
      });
    });

    afterEach(() => {
      document.body.removeChild(element);
      element = null;
      animation.onTransitionEnd.restore();
      clock.restore();
    });

    it('will create a fake event and call the callback when a transition would not happen (1)', () => {
      const spy = sinon.spy();

      // Fade in when .fade and .in classes are not on the element.
      const ret = animation.fadeInElement(element, spy);
      expect(ret).to.equal(0);
      expect(spy.callCount).to.equal(0);
      clock.tick(1);
      expect(spy.callCount).to.equal(1);
    });

    it('will create a fake event and call the callback when a transition would not happen (2)', () => {
      const spy = sinon.spy();

      // Fade in when .fade and .in classes are already on the element.
      element.className = 'fade in';
      element.offsetWidth;

      animation.fadeInElement(element, spy);
      expect(spy.callCount).to.equal(0);
      clock.tick(1);
      expect(spy.callCount).to.equal(1);
    });

    it('will create a fake event and call the callback when a transition would not happen (3)', () => {
      const spy = sinon.spy();

      // Fade out when .fade is already on the element.
      element.className = 'fade';
      element.offsetWidth;

      animation.fadeOutElement(element, spy);
      expect(spy.callCount).to.equal(0);
      clock.tick(1);
    });

    it('can be used without a callback', () => {
      animation.fadeOutElement(element);

      expect(element.classList.contains('in')).to.be.false;
      expect(element.classList.contains('fade')).to.be.true;

      clock.tick(1);
    });

    it('can use `isOut` default value', () => {
      animation.fadeElement(element);

      expect(element.classList.contains('in')).to.be.false;
      expect(element.classList.contains('fade')).to.be.true;

      clock.tick(1);
    });

    it('will return a transition id and does not need a callback', () => {
      element.className = 'fade';
      element.offsetWidth;

      const transitionId = animation.fadeInElement(element);

      clock.tick(1);

      expect(transitionId).to.equal('foo');
    });

    it('can set the invisible class after the element fades out', () => {
      let called = false;
      animation.fadeOutElement(element, () => {
        called = true;
        expect(element.classList.contains('invisible')).to.be.true;
      }, null, true);

      clock.tick(1);
      expect(called).to.be.true;
    });

    it('will remove the invisible class when fading in an element', () => {
      element.className = 'fade invisible';
      element.offsetWidth;

      animation.fadeInElement(element, undefined, null, true);
      clock.tick(1);

      expect(element.classList.contains('invisible')).to.be.false;
    });
  });

  describe('#onAnimationEnd', () => {
    let element;

    // Create @keyframes rule.
    insertKeyframeAnimation('onanimationendtest', {
      '0%': 'left:0px;',
      '100%': 'left:100px;',
    });

    beforeEach(() => {
      element = document.createElement('div');
      element.style.cssText = 'position:relative;left:0px;top:0px;width:200px;height:200px;';

      document.body.appendChild(element);

      // Relayout.
      element.offsetWidth;
    });

    afterEach(() => {
      document.body.removeChild(element);
      element = null;
    });

    it('can tell me when the animation is done and keep context', (done) => {
      element.style[OdoDevice.Dom.ANIMATION] = 'onanimationendtest 100ms ease 0ms 1 forwards';

      const context = {
        tacos: 'delicious',
      };

      animation.onAnimationEnd(element, function callback() {
        expect(this.tacos).to.equal('delicious');
        done();
      }, context);
    });

    describe('without css animations support', () => {
      const hasAnimations = OdoDevice.HAS_CSS_ANIMATIONS;

      beforeEach(() => {
        OdoDevice.HAS_CSS_ANIMATIONS = false;
      });

      afterEach(() => {
        OdoDevice.HAS_CSS_ANIMATIONS = hasAnimations;
      });

      it('should finish async', (done) => {
        animation.onAnimationEnd(element, () => {
          done();
        });
      });
    });
  });

  // Heads up! Currently, Karma/Phantomjs is unable to set the scroll position.
  // These tests only verify the callback function is invoked.
  // http://stackoverflow.com/q/19507878/373422
  // https://github.com/karma-runner/karma/issues/345
  describe('#scrollTo', () => {
    let clock;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
      sinon.stub(animation, 'Stepper').callsFake(function Stepper(options) {
        this.options = options;
        this.onfinish = () => {};
        this.options.step(options.start);
        this.options.step(options.end);
        setTimeout(() => {
          this.onfinish();
        }, 0);
      });
    });

    afterEach(() => {
      animation.Stepper.restore();
      clock.restore();
    });

    it('can call scrollToTop', () => {
      const scrollTo = sinon.spy(window, 'scrollTo');
      animation.scrollToTop();
      clock.tick(1);
      expect(scrollTo.callCount).to.equal(2);
    });

    it('can get a callback', () => {
      const spy = sinon.spy();
      const dur = 50;
      const dest = 100;
      const easing = k => k;
      animation.scrollTo(dest, dur, spy, easing);
      clock.tick(1);
      expect(spy.callCount).to.equal(1);
    });
  });
});
