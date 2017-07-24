/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const OdoResponsiveImages = window.OdoResponsiveImages;
OdoResponsiveImages.initialize();

describe('Odo Responsive Images', () => {
  let el;

  function getLastResponsiveImage() {
    const images = document.querySelectorAll('.' + OdoResponsiveImages.ClassName.IMAGE);
    const last = images[images.length - 1];
    return last.parentNode === document.body ? last : null;
  }

  function getFixtureClone(id) {
    return document.getElementById(id).cloneNode(true).firstElementChild;
  }

  function createFixture(id) {
    el = getFixtureClone(id);
    document.body.appendChild(el);

    OdoResponsiveImages.add(el);
  }

  function removeFixture() {
    const image = document.body.contains(el) ? el : getLastResponsiveImage();
    OdoResponsiveImages.remove(image);
    document.body.removeChild(image);
    el = null;
  }

  describe('basic fixture', () => {
    beforeEach(() => {
      createFixture('basic-fixture');
    });

    afterEach(removeFixture);

    it('should have found the fixtures on the page and the new one', () => {
      const numImages = document.querySelectorAll('.odo-responsive-img').length;
      expect(OdoResponsiveImages.images).to.have.length(numImages);
      OdoResponsiveImages.remove(el);
    });

    it('can add an array of images', () => {
      const image1 = getFixtureClone('basic-fixture');
      const image2 = image1.cloneNode(true);
      document.body.appendChild(image1);
      document.body.appendChild(image2);
      OdoResponsiveImages.add([image1, image2]);
      const numImages = document.querySelectorAll('.odo-responsive-img').length;
      expect(OdoResponsiveImages.images).to.have.length(numImages);
      expect(OdoResponsiveImages.images[numImages - 2].element).to.equal(image1);
      expect(OdoResponsiveImages.images[numImages - 1].element).to.equal(image2);
      OdoResponsiveImages.remove(el);
      OdoResponsiveImages.remove(image1);
      OdoResponsiveImages.remove(image2);
      document.body.removeChild(image1);
      document.body.removeChild(image2);
    });

    it('can clear all current images', () => {
      OdoResponsiveImages.flush();
      expect(OdoResponsiveImages.images).to.have.length(0);
    });

    it('will replace the placeholder element with a picture element', () => {
      OdoResponsiveImages._handleImageInView({
        element: el,
      });

      const replacement = getLastResponsiveImage();
      expect(replacement.classList.contains(OdoResponsiveImages.ClassName.IMAGE)).to.be.true;
      expect(replacement.nodeName.toLowerCase()).to.equal('picture');
      expect(document.body.contains(el)).to.be.false;
      expect(replacement.querySelector('img')).to.exist;
    });

    it('will fail silently when loading an empty array', () => {
      const spy = sinon.spy(OdoResponsiveImages, '_loadImage');

      OdoResponsiveImages.load([]);

      expect(spy.callCount).to.equal(0);
      spy.restore();
    });

    it('will fail silently when adding an empty array', () => {
      const spy = sinon.spy(OdoResponsiveImages, '_add');

      OdoResponsiveImages.add([]);

      expect(spy.callCount).to.equal(0);
      spy.restore();
    });

    it('will fail silently when adding an empty array-like object', () => {
      const spy = sinon.spy(OdoResponsiveImages, '_add');

      OdoResponsiveImages.add({ length: 0 });

      expect(spy.callCount).to.equal(0);
      spy.restore();
    });

    it('can load an array of images', () => {
      const spy = sinon.spy(OdoResponsiveImages, '_loadImage');

      OdoResponsiveImages.load([el]);

      expect(spy.callCount).to.equal(1);
      spy.restore();
    });

    it('will call the load handler if the image is already loaded', (done) => {
      const isLoaded = sinon.stub(OdoResponsiveImages, 'isImageLoaded').returns(true);
      let called = false;
      const handler = sinon.stub(OdoResponsiveImages, '_handleImageLoad').callsFake(() => {
        called = true;
      });

      expect(called).to.be.false;
      OdoResponsiveImages.load(el);
      expect(called).to.be.false;

      setTimeout(() => {
        expect(called).to.be.true;
        isLoaded.restore();
        handler.restore();
        done();
      }, 32);
    });

    it('will remove load handler when the image loads', (done) => {
      OdoResponsiveImages.load(el);
      const image = getLastResponsiveImage().querySelector('img');
      const spy = sinon.spy(image, 'removeEventListener');

      OdoResponsiveImages._imageLoadHandler({
        target: image,
      });

      // Removes `load` and `error` listeners.
      expect(spy.callCount).to.equal(2);

      requestAnimationFrame(() => {
        expect(image.parentNode.classList.contains(
          OdoResponsiveImages.ClassName.LOADED)).to.be.true;
        spy.restore();

        // Cover _update
        OdoResponsiveImages._update();
        done();
      });
    });

    it('will not throw an error when the image loads but no longer has a parentNode', () => {
      OdoResponsiveImages.load(el);
      const picture = getLastResponsiveImage();
      const image = picture.querySelector('img');
      picture.removeChild(image);

      const fn = () => {
        OdoResponsiveImages._imageLoadHandler({
          target: image,
        });
      };

      expect(fn).not.to.throw(Error);
    });

    it('will throw an error when attempting to load something that is not an element', () => {
      expect(() => {
        OdoResponsiveImages.load();
      }).to.throw(TypeError);

      expect(() => {
        OdoResponsiveImages.load(null);
      }).to.throw(TypeError);

      expect(() => {
        OdoResponsiveImages.load('foo');
      }).to.throw(TypeError);

      expect(() => {
        OdoResponsiveImages.load({});
      }).to.throw(TypeError);

      expect(() => {
        OdoResponsiveImages.load(document.documentElement);
      }).to.throw(TypeError);
    });

    it('will throw when it cannot find an <img> inside the placeholder', () => {
      function fn() {
        OdoResponsiveImages._loadImage(document.createElement('div'));
      }

      expect(fn).to.throw(Error);
    });

    it('will ignore added duplicate images', () => {
      expect(OdoResponsiveImages.images).to.have.length(1);
      const first = OdoResponsiveImages.images[0].element;
      OdoResponsiveImages.add(first);
      expect(OdoResponsiveImages.images).to.have.length(1);
    });

    it('can remove an array of images', () => {
      expect(OdoResponsiveImages.images).to.have.length(1);

      // Add 2 more images.
      const image1 = getFixtureClone('basic-fixture');
      const image2 = image1.cloneNode(true);
      document.body.appendChild(image1);
      document.body.appendChild(image2);
      OdoResponsiveImages.add([image1, image2]);
      expect(OdoResponsiveImages.images).to.have.length(3);

      OdoResponsiveImages.remove([image1, image2]);
      expect(OdoResponsiveImages.images).to.have.length(1);

      // Remove the 2 added images.
      document.body.removeChild(image1);
      document.body.removeChild(image2);
    });
  });

  describe('custom fixture', () => {
    let img;

    beforeEach(() => {
      el = document.getElementById('basic-fixture').cloneNode(true).firstElementChild;
      document.body.appendChild(el);
      img = el.querySelector('img');
      img.testProperty = 'foo';

      OdoResponsiveImages.add(el);
    });

    afterEach(() => {
      removeFixture();
      img = null;
    });

    it('should not break the reference to children', () => {
      expect(document.body.contains(img)).to.be.true;

      OdoResponsiveImages.load(el);

      const picture = getLastResponsiveImage();
      const image = picture.querySelector('img');

      expect(document.body.contains(img)).to.be.true;
      expect(image.testProperty).to.equal(img.testProperty);
    });
  });

  describe('background fixture', () => {
    beforeEach(() => {
      createFixture('background-fixture');
    });

    afterEach(removeFixture);

    it('will set the data-type attribute of the placeholder', () => {
      const spy = sinon.spy(OdoResponsiveImages, '_updateBackgroundImage');
      OdoResponsiveImages.load(el);
      const picture = getLastResponsiveImage();
      const image = picture.querySelector('img');
      expect(picture.style.backgroundImage).to.be.empty;

      OdoResponsiveImages._imageLoadHandler({
        target: image,
      });

      expect(picture.getAttribute('data-type')).to.equal('background');

      expect(spy.calledWith(image)).to.be.true;
      spy.restore();
    });

    it('will set the background image property of the placeholder', () => {
      const fakeElement = {
        currentSrc: 'foo.jpg',
        src: 'bar.jpg',
        parentNode: {
          style: {
            backgroundImage: '',
          },
        },
      };

      // Use currentSrc
      expect(fakeElement.parentNode.style.backgroundImage).to.be.empty;
      OdoResponsiveImages._updateBackgroundImage(fakeElement);
      expect(fakeElement.parentNode.style.backgroundImage).to.equal('url("foo.jpg")');

      // Use src
      delete fakeElement.currentSrc;
      OdoResponsiveImages._updateBackgroundImage(fakeElement);
      expect(fakeElement.parentNode.style.backgroundImage).to.equal('url("bar.jpg")');
    });
  });

  describe('srcset fixture', () => {
    beforeEach(() => {
      createFixture('srcset-fixture');
    });

    afterEach(removeFixture);

    it('will set the srcset attribute', () => {
      const image = el.querySelector('img');
      OdoResponsiveImages.load(el);

      OdoResponsiveImages._imageLoadHandler({
        target: image,
      });

      expect(image.getAttribute('data-srcset')).to.be.null;
      expect(document.body.contains(el)).to.be.true;
      expect(el.nodeName.toLowerCase()).to.equal('div');
    });
  });

  describe('srcset background fixture', () => {
    beforeEach(() => {
      createFixture('srcset-background-fixture');
    });

    afterEach(removeFixture);

    it('will set the background image property of the placeholder', () => {
      const spy = sinon.spy(OdoResponsiveImages, '_updateBackgroundImage');
      const image = el.querySelector('img');
      expect(el.style.backgroundImage).to.be.empty;
      OdoResponsiveImages.load(el);
      expect(el.style.backgroundImage).to.be.empty;

      OdoResponsiveImages._imageLoadHandler({
        target: image,
      });

      expect(el.style.backgroundImage).to.not.be.empty;
      expect(el.style.backgroundImage).to.have.string('url(');

      expect(spy.calledWith(image)).to.be.true;
      spy.restore();
    });
  });

  describe('threshold fixture', () => {
    beforeEach(() => {
      createFixture('threshold-fixture');
    });

    afterEach(removeFixture);

    it('can get custom viewport item options per image', () => {
      expect(OdoResponsiveImages._getViewportOptions(el)).to.deep.equal({
        element: el,
        threshold: '200',
        enter: OdoResponsiveImages._imageInViewHandler,
      });
    });
  });
});
