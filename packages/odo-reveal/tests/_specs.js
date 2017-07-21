/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;

const OdoReveal = window.OdoReveal;

sinon.stub(window.OdoViewport, 'add').callsFake(() => 'foo');

sinon.stub(window.OdoHelpers.animation, 'onTransitionEnd').callsFake((element, callback, context) => {
  setTimeout(() => {
    callback.call(context, {
      target: element,
      currentTarget: element,
    });
  }, 0);
});

describe('The OdoReveal Component', function d() {
  this.timeout(4000);

  let element;
  let instance;

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id) {
    element = document.getElementById(id).cloneNode(true).firstElementChild;
    document.body.appendChild(element);

    instance = new OdoReveal(element);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    document.body.removeChild(element);
    element = null;
    instance = null;
  }

  it('can initialize all odo reveals already on the page', () => {
    const instances = OdoReveal.initializeAll();
    expect(instances).to.have.lengthOf(3);
    instances.forEach((instance) => {
      instance.dispose();
    });
  });

  describe('basic fixture', () => {
    beforeEach(() => {
      createFixture('fixture');
    });

    afterEach(removeFixture);

    it('should not find any images', () => {
      expect(instance.images).to.have.lengthOf(0);
    });
  });

  describe('without scroll animation', () => {
    const original = OdoReveal.HAS_SCROLL_ANIMATION;

    beforeEach(() => {
      OdoReveal.HAS_SCROLL_ANIMATION = false;
      createFixture('fixture');
    });

    afterEach(() => {
      OdoReveal.HAS_SCROLL_ANIMATION = original;
      removeFixture();
    });

    it('will call show immediately', (done) => {
      expect(instance.id).to.not.exist;
      setTimeout(done, 0);
    });
  });

  describe('images fixture', () => {
    beforeEach(() => {
      createFixture('images-fixture');
    });

    afterEach(removeFixture);

    it('should find 2 images', () => {
      expect(instance.images).to.have.lengthOf(2);
    });

    it('will resolve the promise once all images have finished', (done) => {
      const show = sinon.stub(instance, '_show');

      // 2 images
      instance._imageComplete();
      instance._imageComplete();

      expect(show.callCount).to.equal(0);

      instance._enteredView();
      instance._ready.then(() => {
        expect(show.callCount).to.equal(1);
        done();
      });
    });
  });

  describe('ignore fixture', () => {
    beforeEach(() => {
      createFixture('ignore-fixture');
    });

    afterEach(removeFixture);

    it('should find only 1 image', () => {
      expect(instance.images).to.have.lengthOf(1);
      expect(instance._getDependentImages()).to.have.lengthOf(1);
    });
  });

  describe('the initialize all method', () => {
    let main;

    beforeEach(() => {
      main = document.getElementById('fixture').cloneNode(true).firstElementChild;
      element = document.createElement('div');
      element.appendChild(main);
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    it('will initialize all reveal elements within it', () => {
      const instances = OdoReveal.initializeAll(element);
      expect(instances).to.have.lengthOf(1);

      const instance = instances[0];
      expect(instance.element).to.equal(main);
      instance.dispose();
    });
  });
});
