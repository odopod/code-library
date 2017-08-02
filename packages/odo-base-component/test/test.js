/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const fixture = window.fixture;
const OdoBaseComponent = window.OdoBaseComponent;

fixture.setBase('fixtures');

describe('The Base Component', function baseComponent() {
  this.timeout(4000);

  let element;
  let instance;

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id, listenToMedia) {
    fixture.load(`${id}.html`);
    element = fixture.el;

    instance = new OdoBaseComponent(element, listenToMedia);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    element = null;
    instance = null;
    fixture.cleanup();
  }

  it('will throw an error without an element', () => {
    const noBase = () => new OdoBaseComponent();
    expect(noBase).to.throw(TypeError);
  });

  describe('regular fixture', () => {
    beforeEach(() => {
      createFixture('base');
    });

    afterEach(removeFixture);

    it('won\'t detect window viewport changes', () => {
      expect(instance._onMediaChange).to.equal(undefined);
    });

    it('getElementByClass will return first matching element within DOM collection', () => {
      let element = instance.getElementByClass('getElementByTest');
      expect(element.nodeName).to.exist;

      // if there's no match within the document, it should return null
      element = instance.getElementByClass('nope');
      expect(element).to.equal(null);
    });

    it('getElementsByClass will retreive an array of elements', () => {
      expect(Array.isArray(instance.getElementsByClass('context-test')));
      expect(instance.getElementsByClass('context-test')).to.have.lengthOf(2);
    });

    it('getElementsBySelector will retrieve an array of elements', () => {
      const foos = instance.getElementsBySelector('[data-foo]');
      expect(Array.isArray(foos)).to.equal(true);
      expect(foos).to.have.lengthOf(2);

      const bars = instance.getElementsBySelector('div.bar');
      expect(Array.isArray(bars)).to.equal(true);
      expect(bars).to.have.lengthOf(0);
    });

    it('can have a context for DOM queries', () => {
      expect(instance.getElementsBySelector('.context-test')).to.have.lengthOf(2);
      expect(instance.getElementsBySelector(
        '.context-test',
        instance.getElementByClass('the-context'),
      )).to.have.lengthOf(1);
    });

    it('will remove custom events', () => {
      let b = 0;
      const testFunction = () => {
        b += 1;
      };

      // establish that we can create custom events
      instance.on('trigger', testFunction);
      instance.emit('trigger');
      expect(b).to.equal(1);

      // establish that the off function removes listeners
      instance.off('trigger', testFunction);
      instance.emit('trigger');
      expect(b).to.equal(1);
    });
  });

  describe('base component fixture with media queries', () => {
    const mockQuery = matches => ({ matches });

    beforeEach(() => {
      createFixture('base', true);
    });

    afterEach(() => {
      removeFixture();
    });

    it('will call the onMediaQueryChange method on breakpoint change', () => {
      expect(instance._onMediaChange).to.be.a('function');
      expect(instance.onMediaQueryChange).to.be.a('function');
      expect(instance.onMediaQueryChange()).to.be.undefined;
    });

    it('will return mobile media query check boolean', () => {
      const ref = OdoBaseComponent.queries.xs;
      OdoBaseComponent.queries.xs = mockQuery(false);
      expect(OdoBaseComponent.breakpoint.matches('xs')).to.be.false;
      expect(instance.breakpoint.matches('xs')).to.be.false;

      OdoBaseComponent.queries.xs = mockQuery(true);
      expect(OdoBaseComponent.breakpoint.matches('xs')).to.be.true;
      expect(instance.breakpoint.matches('xs')).to.be.true;

      OdoBaseComponent.queries.xs = ref;
    });

    it('will return tablet portrait media query check boolean', () => {
      const ref = OdoBaseComponent.queries.sm;
      OdoBaseComponent.queries.sm = mockQuery(true);
      expect(OdoBaseComponent.breakpoint.matches('sm')).to.be.true;
      expect(instance.breakpoint.matches('sm')).to.be.true;

      OdoBaseComponent.queries.sm = ref;
    });

    it('will return tablet landscape media query check boolean', () => {
      const ref = OdoBaseComponent.queries.md;
      OdoBaseComponent.queries.md = mockQuery(false);
      expect(OdoBaseComponent.breakpoint.matches('md')).to.be.false;
      expect(instance.breakpoint.matches('md')).to.be.false;

      OdoBaseComponent.queries.md = ref;
    });

    it('will return desktop media query check boolean', () => {
      const ref = OdoBaseComponent.queries.lg;
      OdoBaseComponent.queries.lg = mockQuery(true);
      expect(OdoBaseComponent.breakpoint.matches('lg')).to.be.true;
      expect(instance.breakpoint.matches('lg')).to.be.true;

      OdoBaseComponent.queries.lg = ref;
    });

    it('can get the current breakpoint', () => {
      const ref = OdoBaseComponent.queries;
      OdoBaseComponent.queries = {};
      OdoBaseComponent.queries.xs = mockQuery(true);

      expect(OdoBaseComponent.getCurrentBreakpoint()).to.equal('xs');
      expect(OdoBaseComponent.breakpoint.current).to.equal('xs');

      OdoBaseComponent.queries.xs = mockQuery(false);
      OdoBaseComponent.queries.sm = mockQuery(true);
      expect(OdoBaseComponent.getCurrentBreakpoint()).to.equal('sm');

      OdoBaseComponent.queries.sm = mockQuery(false);
      expect(OdoBaseComponent.getCurrentBreakpoint()).to.equal(null);

      OdoBaseComponent.queries = ref;
    });

    it('will throw with an unrecognized breakpoint key', () => {
      expect(() => {
        OdoBaseComponent.breakpoint.matches('foo');
      }).to.throw(Error);
    });
  });
});
