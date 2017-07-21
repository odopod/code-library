/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const Timer = window.OdoHelpers.Timer;

describe('The Timer class', function timerClass() {
  this.timeout(5000);

  let clock;
  let timer;
  let defaultCallback;

  beforeEach(() => {
    defaultCallback = sinon.spy();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('will not start immediately', () => {
    timer = new Timer(defaultCallback, 500);
    expect(timer.isTicking).to.be.false;
    expect(timer.isPaused).to.be.false;
    expect(timer.delay).to.equal(500);
    timer.dispose();
  });

  it('can start the timer', () => {
    timer = new Timer(defaultCallback, 500, false);
    expect(timer.timerId).not.to.exist;
    const remaining = timer.start();
    expect(timer.timerId).to.exist;
    expect(timer.isTicking).to.be.true;
    expect(remaining).to.equal(500);

    // Calling start while it's already running will return false.
    const startTime = timer.startTime;
    const ret = timer.start();
    expect(startTime).to.equal(timer.startTime);
    expect(ret).to.be.false;

    // Tick past the delay.
    clock.tick(510);
    expect(defaultCallback.callCount).to.equal(1);

    timer.dispose();
  });

  it('can pause the timer', () => {
    timer = new Timer(defaultCallback, 500, false);
    timer.start();
    clock.tick(200);
    const remaining = timer.pause();
    expect(remaining).to.equal(300);
    expect(timer.isPaused).to.be.true;
    expect(timer.isTicking).to.be.false;
    timer.dispose();
  });

  it('can be a continuous timer', () => {
    timer = new Timer(defaultCallback, 500, true);
    timer.start();

    clock.tick(510);
    expect(defaultCallback.callCount).to.equal(1);

    clock.tick(510);
    expect(defaultCallback.callCount).to.equal(2);

    clock.tick(510);
    expect(defaultCallback.callCount).to.equal(3);

    timer.dispose();
  });

  it('can stop a continuous timer', () => {
    const cb = sinon.spy(() => {
      timer.stop();
    });

    timer = new Timer(cb, 500, true);
    timer.start();

    clock.tick(510);
    expect(cb.callCount).to.equal(1);

    clock.tick(510);
    expect(cb.callCount).to.equal(1);

    timer.dispose();
  });
});
