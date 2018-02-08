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
  const { expect } = window.chai;
  const { OdoDevice, OdoHelpers, sinon } = window;

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

      OdoHelpers.onTransitionEnd(element, function callback() {
        expect(this.tacos).to.equal('delicious');
        done();
      }, context);
    });

    it('can tell me when the transition is done for a given property', (done) => {
      element.style[OdoDevice.Dom.TRANSITION_PROPERTY] = 'left, top';
      element.style[OdoDevice.Dom.TRANSITION_DELAY] = '0, 50ms';

      element.style.top = '50px';
      element.style.left = '200px';

      OdoHelpers.onTransitionEnd(element, (evt) => {
        expect(evt.propertyName).to.equal('top');
        done();
      }, null, 'top');
    });

    it('should use the transition end event when it happens with a timeout provided', (done) => {
      element.style.left = '200px';

      OdoHelpers.onTransitionEnd(element, (evt) => {
        expect(evt.fake).not.to.be.true;
        expect(evt.propertyName).to.equal('left');
        done();
      }, null, null, 200);
    });

    it('will set a fallback timer if a timeout is provided', (done) => {
      OdoHelpers.onTransitionEnd(element, (evt) => {
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

        OdoHelpers.onTransitionEnd(element, () => {
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

      OdoHelpers.onTransitionEnd($element, () => {
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

      const fn = OdoHelpers.onTransitionEnd.bind(null, $collection);

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

      const id = OdoHelpers.onTransitionEnd(element, callback);
      expect(Object.keys(OdoHelpers.getTransitions())).to.have.length(1);

      OdoHelpers.cancelTransitionEnd(id);
      expect(Object.keys(OdoHelpers.getTransitions())).to.have.length(0);

      // Cancel one which doesn't exist.
      expect(() => {
        OdoHelpers.cancelTransitionEnd('foo');
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

      const id1 = OdoHelpers.onTransitionEnd(element, callback1);
      const id2 = OdoHelpers.onTransitionEnd(element, callback2);
      const id3 = OdoHelpers.onTransitionEnd(element, callback3);
      expect(Object.keys(OdoHelpers.getTransitions())).to.have.length(3);

      OdoHelpers.cancelTransitionEnd(id1);
      OdoHelpers.cancelTransitionEnd(id2);
      OdoHelpers.cancelTransitionEnd(id3);
      expect(Object.keys(OdoHelpers.getTransitions())).to.have.length(0);

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

        const id = OdoHelpers.onTransitionEnd(element, callback);
        expect(Object.keys(OdoHelpers.getTransitions())).to.have.length(1);

        OdoHelpers.cancelTransitionEnd(id);
        expect(Object.keys(OdoHelpers.getTransitions())).to.have.length(0);

        setTimeout(() => {
          expect(callback.callCount).to.equal(0);
          done();
        }, 20);
      });
    });
  });

  describe('#fadeElement', () => {
    let element;

    beforeEach(() => {
      element = document.createElement('div');
      element.style.cssText = 'position:relative;left:2px;top:0;width:200px;height:200px;';
      element.style[OdoDevice.Dom.TRANSITION] = 'all 20ms ease';

      document.body.appendChild(element);

      // Relayout.
      element.offsetWidth;
    });

    afterEach(() => {
      document.body.removeChild(element);
      element = null;
    });

    it('will create a fake event and call the callback when a transition would not happen (1)', (done) => {
      const cb = () => {
        done();
      };

      // Fade in when .fade and .in classes are not on the element.
      const ret = OdoHelpers.fadeInElement(element, cb);
      expect(ret).to.equal(0);
    });

    it('will create a fake event and call the callback when a transition would not happen (2)', (done) => {
      const cb = () => {
        done();
      };

      // Fade in when .fade and .in classes are already on the element.
      element.className = 'fade in';
      element.offsetWidth;

      OdoHelpers.fadeInElement(element, cb);
    });

    it('will create a fake event and call the callback when a transition would not happen (3)', (done) => {
      const cb = () => {
        done();
      };

      // Fade out when .fade is already on the element.
      element.className = 'fade';
      element.offsetWidth;

      OdoHelpers.fadeOutElement(element, cb);
    });

    it('can be used without a callback', (done) => {
      OdoHelpers.fadeOutElement(element);

      expect(element.classList.contains('in')).to.be.false;
      expect(element.classList.contains('fade')).to.be.true;

      setTimeout(() => {
        done();
      }, 30);
    });

    it('will return a transition id and does not need a callback', (done) => {
      element.className = 'fade';
      element.offsetWidth;

      const transitionId = OdoHelpers.fadeInElement(element);

      expect(transitionId).to.be.a('number');

      setTimeout(() => {
        done();
      }, 30);
    });

    it('can set the invisible class after the element fades out', (done) => {
      OdoHelpers.fadeOutElement(element, () => {
        expect(element.classList.contains('invisible')).to.be.true;
        done();
      }, null, true);
    });

    it('will remove the invisible class when fading in an element', (done) => {
      element.className = 'fade invisible';
      element.offsetWidth;

      OdoHelpers.fadeInElement(element, () => {
        expect(element.classList.contains('invisible')).to.be.false;
        done();
      }, null, true);
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

      OdoHelpers.onAnimationEnd(element, function callback() {
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
        OdoHelpers.onAnimationEnd(element, () => {
          done();
        });
      });
    });
  });

  describe('#scrollTo', () => {
    it('can call scrollToTop', (done) => {
      const scrollTo = sinon.spy(window, 'scrollTo');
      const stepper = OdoHelpers.scrollToTop();
      stepper.options.duration = 0;
      requestAnimationFrame(() => {
        expect(scrollTo.callCount).to.equal(1);
        done();
      });
    });

    it('can get a callback', (done) => {
      const spy = sinon.spy();
      const dur = 0;
      const dest = 100;
      const easing = k => k;
      OdoHelpers.scrollTo(dest, dur, spy, easing);

      requestAnimationFrame(() => {
        expect(spy.callCount).to.equal(1);
        done();
      });
    });
  });
});
