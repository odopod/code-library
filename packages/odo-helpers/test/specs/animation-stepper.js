/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

describe('Animation Stepper', () => {
  const expect = window.chai.expect;
  const animation = window.OdoHelpers.animation;
  const sinon = window.sinon;
  let el;
  let instance;

  function createFixture() {
    const outside = document.createElement('div');
    outside.innerHTML = '<div style="position:absolute;top:0;left:0;width:50px;height:30px;background-color:black;"></div>';
    el = outside.firstChild;
    document.body.appendChild(el);
  }

  function removeFixture() {
    instance.dispose();
    document.body.removeChild(el);
    el = null;
    instance = null;
  }

  afterEach(removeFixture);

  it('can animate a left value', (done) => {
    createFixture('stepper');

    const div = el;

    const step = (position) => {
      div.style.left = `${position}px`;
    };

    instance = new animation.Stepper({
      start: 0,
      end: 500,
      duration: 50,
      step,
    });

    instance.onfinish = () => {
      const left = parseInt(div.style.left, 10);
      expect(left).to.equal(500);
      done();
    };
  });

  it('will work without a step method', (done) => {
    createFixture('stepper');

    instance = new animation.Stepper({
      start: 0,
      end: 10,
      duration: 30,
    });

    instance.onfinish = done;
  });

  it('allows duration to be zero', (done) => {
    createFixture('stepper');

    const spy = sinon.spy();

    instance = new animation.Stepper({
      start: 0,
      end: 10,
      step: spy,
      duration: 0,
    });

    instance.onfinish = () => {
      expect(spy.callCount).to.equal(1);
      done();
    };
  });

  it('can use a context for the callbacks', (done) => {
    createFixture('stepper');
    const div = el;
    div.style.backgroundColor = 'mediumseagreen';

    const step = function step(position) {
      div.style.top = `${position}px`;
      expect(this.foo).to.equal('bar');
    };

    instance = new animation.Stepper({
      start: 0,
      end: 450,
      duration: 50,
      step,
      context: {
        foo: 'bar',
      },
    });

    instance.onfinish = function onfinish() {
      const top = parseInt(div.style.top, 10);
      expect(top).to.equal(450);
      expect(this.foo).to.equal('bar');
      done();
    };
  });

  it('can have custom easing function', (done) => {
    createFixture('stepper');
    const div = el;
    div.style.backgroundColor = 'rgba(0, 0, 255, 0.3)';

    const step = (position, percent) => {
      div.style.width = `${percent * 100}%`;
    };

    instance = new animation.Stepper({
      start: 5,
      end: 100,
      step,
      easing(k) {
        return -k * (k - 2);
      },
    });

    instance.onfinish = done;
  });

  it('can be canceled', (done) => {
    createFixture('stepper');
    const div = el;
    div.style.backgroundColor = 'transparent';
    const spy = sinon.spy();

    instance = new animation.Stepper({
      start: 0,
      end: 100,
      duration: 50,
      step(position) {
        div.style.top = `${position}px`;

        // Cancel after the first step.
        instance.cancel();
      },
    });

    instance.onfinish = spy;

    setTimeout(() => {
      expect(spy.callCount).to.equal(0);
      done();
    }, 100);
  });
});
