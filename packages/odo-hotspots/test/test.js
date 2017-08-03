/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const fixture = window.fixture;
const sinon = window.sinon;
const OdoHotspots = window.OdoHotspots;

fixture.setBase('fixtures');

describe('Odo hotspots', () => {
  let el;
  let instance;

  function createFixture(id, parent) {
    fixture.load(`${id}.html`);
    el = fixture.el.firstElementChild;

    if (parent) {
      parent.appendChild(el);
    } else {
      document.body.appendChild(el);
    }

    instance = new OdoHotspots(el);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    el.parentNode.removeChild(el);
    el = null;
    instance = null;
    fixture.cleanup();
  }

  describe('basic fixture', () => {
    beforeEach(() => {
      createFixture('basic');
    });

    afterEach(removeFixture);

    it('will initialize properly', () => {
      expect(instance.hotspots).to.have.length(4);
      expect(instance._noopElement).to.equal(instance.element);
      expect(instance._activeHotspot).to.be.null;
      expect(instance.element.classList.contains(OdoHotspots.ClassName.LOADED)).to.be.true;
      expect(instance._noop()).to.equal(undefined);
    });

    it('will not overwrite an id which already exists on an element', () => {
      const id = instance.hotspots[0].content.id;
      expect(id).to.exist;
      instance.dispose();
      instance = new OdoHotspots(el);
      expect(instance.hotspots[0].content.id).to.equal(id);
    });

    it('will set hotspot wrapper positions', () => {
      expect(instance.hotspots[0].percentPosition).to.deep.equal({
        x: 15,
        y: 0,
      });
      expect(instance.hotspots[1].percentPosition).to.deep.equal({
        x: 55,
        y: 75,
      });
      expect(instance.hotspots[2].percentPosition).to.deep.equal({
        x: 10,
        y: 56,
      });
      expect(instance.hotspots[3].percentPosition).to.deep.equal({
        x: 80,
        y: 11,
      });

      // Container size = 1000x500
      expect(instance.hotspots[0].position).to.deep.equal({
        left: 150,
        top: 0,
        right: 182,
        bottom: 32,
      });
      expect(instance.hotspots[1].position).to.deep.equal({
        left: 550,
        top: 375,
        right: 582,
        bottom: 407,
      });
      expect(instance.hotspots[2].position).to.deep.equal({
        left: 100,
        top: 280,
        right: 132,
        bottom: 312,
      });
      expect(instance.hotspots[3].position).to.deep.equal({
        left: 800,
        top: 55,
        right: 832,
        bottom: 87,
      });
    });

    it('can get optimal sides', () => {
      instance.size = {
        width: 1000,
        height: 500,
      };
      const hotspot = instance.hotspots[0];
      hotspot.percentPosition = {
        x: 10,
        y: 10,
      };
      hotspot.position = {
        left: 100,
        right: 132,
        top: 50,
        bottom: 82,
      };
      hotspot.size = {
        width: 200,
        height: 200,
      };

      // Fits only right
      expect(hotspot._getOptimalSide()).to.equal(OdoHotspots.ClassName.HOTSPOT_RIGHT);

      // Fits neither left nor right, but the hotspot is on the left.
      instance.size.width = 100;
      expect(hotspot._getOptimalSide()).to.equal(OdoHotspots.ClassName.HOTSPOT_RIGHT);

      // Fits both, but it's on the left.
      hotspot.size.width = 10;
      instance.size.width = 1000;
      expect(hotspot._getOptimalSide()).to.equal(OdoHotspots.ClassName.HOTSPOT_RIGHT);

      // Fits both, but it's on the right.
      hotspot.percentPosition.x = 90;
      hotspot.position.left = 900;
      hotspot.position.right = 932;
      expect(hotspot._getOptimalSide()).to.equal(OdoHotspots.ClassName.HOTSPOT_LEFT);

      // Fits only left
      hotspot.size.width = 200;
      expect(hotspot._getOptimalSide()).to.equal(OdoHotspots.ClassName.HOTSPOT_LEFT);
    });

    it('can get optimal anchors', () => {
      instance.size = {
        width: 1000,
        height: 500,
      };
      const hotspot = instance.hotspots[0];
      hotspot.percentPosition = {
        x: 10,
        y: 10,
      };
      hotspot.position = {
        left: 100,
        right: 132,
        top: 50,
        bottom: 82,
      };
      hotspot.size = {
        width: 200,
        height: 200,
      };

      // Fits only top
      expect(hotspot._getOptimalAnchor()).to.equal(OdoHotspots.ClassName.HOTSPOT_BOTTOM);

      // Fits neither bottom nor top, but the hotspot is on the top.
      instance.size.height = 100;
      expect(hotspot._getOptimalAnchor()).to.equal(OdoHotspots.ClassName.HOTSPOT_BOTTOM);

      // Fits both, but it's on the left.
      hotspot.size.height = 10;
      instance.size.height = 1000;
      expect(hotspot._getOptimalAnchor()).to.equal(OdoHotspots.ClassName.HOTSPOT_BOTTOM);

      // Fits both, but it's on the top.
      hotspot.percentPosition.y = 90;
      hotspot.position.top = 900;
      hotspot.position.bottom = 932;
      expect(hotspot._getOptimalAnchor()).to.equal(OdoHotspots.ClassName.HOTSPOT_TOP);

      // Fits only left
      hotspot.size.height = 200;
      expect(hotspot._getOptimalAnchor()).to.equal(OdoHotspots.ClassName.HOTSPOT_TOP);
    });

    it('will set sides and anchors for hotspots without them', () => {
      expect(instance.hotspots[0].side).to.be.null;
      expect(instance.hotspots[0].anchor).to.be.null;
      expect(instance.hotspots[1].side).to.be.null;
      expect(instance.hotspots[1].anchor).to.be.null;
      expect(instance.hotspots[2].side).to.be.null;
      expect(instance.hotspots[2].anchor).to.be.null;
      expect(instance.hotspots[3].side).to.equal(OdoHotspots.ClassName.HOTSPOT_LEFT);
      expect(instance.hotspots[3].anchor).to.equal(OdoHotspots.ClassName.HOTSPOT_BOTTOM);

      instance.hotspots[3].wrapper.classList.remove(OdoHotspots.ClassName.HOTSPOT_LEFT);
      instance.hotspots[3].wrapper.classList.remove(OdoHotspots.ClassName.HOTSPOT_BOTTOM);
      instance.hotspots[3].wrapper.classList.add(OdoHotspots.ClassName.HOTSPOT_RIGHT);
      instance.hotspots[3].wrapper.classList.add(OdoHotspots.ClassName.HOTSPOT_TOP);
      instance.hotspots = instance._getHotspots();
      expect(instance.hotspots[3].side).to.equal(OdoHotspots.ClassName.HOTSPOT_RIGHT);
      expect(instance.hotspots[3].anchor).to.equal(OdoHotspots.ClassName.HOTSPOT_TOP);
    });

    it('will not open which is opened or close one which is closed', (done) => {
      const closeAll = sinon.spy(instance, 'closeAllHotspots');
      const setActiveHotspot = sinon.spy(instance, 'setActiveHotspot');

      const h1 = instance.hotspots[0];
      instance.toggleHotspot(h1);

      // Open is async
      setTimeout(() => {
        expect(setActiveHotspot.callCount).to.equal(1);
        expect(closeAll.callCount).to.equal(1);
        expect(h1.isOpen).to.be.true;

        // Should not open one that is already open.
        instance.openHotspot(h1);
        expect(closeAll.callCount).to.equal(1);
        expect(setActiveHotspot.callCount).to.equal(1);

        instance.toggleHotspot(h1);
        expect(setActiveHotspot.callCount).to.equal(2);
        expect(h1.isOpen).to.be.false;

        instance.closeHotspot(h1);
        expect(setActiveHotspot.callCount).to.equal(2);
        done();
      }, 0);
    });

    it('can be prevented from opening or closing a hotspot', () => {
      const setActiveHotspot = sinon.spy(instance, 'setActiveHotspot');

      const h1 = instance.hotspots[0];

      function listener(event) {
        const hotspot = event.hotspot;
        expect(hotspot.element).to.equal(h1.element);
        event.preventDefault();
      }

      instance.on(OdoHotspots.EventType.WILL_OPEN, listener, false);
      instance.on(OdoHotspots.EventType.WILL_CLOSE, listener, false);

      instance.openHotspot(h1);
      expect(setActiveHotspot.callCount).to.equal(0);

      instance.closeHotspot(h1);
      expect(setActiveHotspot.callCount).to.equal(0);
    });

    it('will toggle a hotspot on its button click', () => {
      const button = instance.hotspots[1].button;
      const toggle = sinon.stub(instance, 'toggleHotspot');
      instance._handleHotspotClick({
        currentTarget: button,
        target: button,
        preventDefault() {},
      });
      expect(toggle.calledWith(instance.hotspots[1])).to.be.true;
    });

    it('will close a hotspot when clicked outside of it', (done) => {
      const h3 = instance.hotspots[2];
      instance.openHotspot(h3);

      const closeHotspot = sinon.spy(instance, 'closeHotspot');

      setTimeout(() => {
        // A child of the content
        instance._handleOuterClick({
          target: h3.wrapper.querySelector('figcaption'),
        });

        expect(closeHotspot.callCount).to.equal(0);

        // The content
        instance._handleOuterClick({
          target: h3.content,
        });

        expect(closeHotspot.callCount).to.equal(0);

        // Outside the content
        instance._handleOuterClick({
          target: instance.hotspots[0].wrapper,
        });

        expect(closeHotspot.callCount).to.equal(1);

        done();
      }, 0);
    });

    it('will call refresh on window resize and page load', (done) => {
      const refresh = sinon.spy(instance, 'refresh');
      instance._handleResize();
      expect(refresh.callCount).to.equal(1);
      instance._handleLoad();
      expect(refresh.callCount).to.equal(2);
      requestAnimationFrame(() => {
        done();
      });
    });

    it('will return null if there is not a hotspot with the given wrapper', () => {
      expect(instance._getHotspotByWrapper(document.body)).to.equal(null);
    });
  });

  describe('a nested fixture', () => {
    let parent;

    beforeEach(() => {
      parent = document.createElement('div');
      parent.id = 'asdf';
      document.body.appendChild(parent);
      createFixture('basic', parent);
    });

    afterEach(() => {
      removeFixture();

      if (document.body.contains(parent)) {
        document.body.removeChild(parent);
      }
    });

    it('can get the first child of the body which is a parent of the main element', () => {
      expect(instance._getFirstBodyDescendant()).to.equal(parent);
    });

    it('will not find the first child of the body if it is disconnected', () => {
      document.body.removeChild(parent);
      expect(instance._getFirstBodyDescendant()).to.be.null;
    });
  });
});
