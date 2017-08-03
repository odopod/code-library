/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const sinon = window.sinon;
const fixture = window.fixture;

const OdoBaseComponent = window.OdoBaseComponent;
const OdoResponsiveAttributes = window.OdoResponsiveAttributes;

fixture.setBase('fixtures');

describe('The OdoResponsiveAttributes Component', function d() {
  this.timeout(4000);

  let element;
  let instance;

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id, attributeName) {
    fixture.load(`${id}.html`);
    element = fixture.el.firstElementChild;

    instance = new OdoResponsiveAttributes(element, attributeName);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    element = null;
    instance = null;
    fixture.cleanup();
  }

  sinon.stub(OdoBaseComponent, 'getCurrentBreakpoint').returns('sm');

  describe('basic fixture', () => {
    beforeEach(() => {
      createFixture('basic');
    });

    afterEach(removeFixture);

    it('will initialize correctly', () => {
      expect(instance.values).to.deep.equal({
        xs: null,
        sm: '2',
        md: '2',
        lg: '3',
      });

      expect(instance.currentValue).to.equal('2');
    });
  });

  describe('custom attribute fixture', () => {
    beforeEach(() => {
      createFixture('custom-attribute', 'class-name');
    });

    afterEach(removeFixture);

    it('will initialize correctly', () => {
      expect(instance.values).to.deep.equal({
        xs: 'container foo',
        sm: 'flexxy',
        md: 'flexxy',
        lg: 'flexxy',
      });

      expect(instance.currentValue).to.equal('flexxy');
    });
  });

  describe('all breakpoints fixture', () => {
    beforeEach(() => {
      createFixture('all-breakpoints');
    });

    afterEach(removeFixture);

    it('will initialize correctly', () => {
      expect(instance.values).to.deep.equal({
        xs: 'container foo',
        sm: 'container flexxy',
        md: 'row bar',
        lg: 'column',
      });

      expect(instance.currentValue).to.equal('container flexxy');
    });
  });

  describe('default value fixture', () => {
    beforeEach(() => {
      createFixture('default-value');
    });

    afterEach(removeFixture);

    it('will initialize correctly', () => {
      expect(instance.values).to.deep.equal({
        xs: 'foo',
        sm: 'foo',
        md: 'bar',
        lg: 'foo',
      });

      expect(instance.currentValue).to.equal('foo');
    });
  });

  describe('with a different delimiter', () => {
    const delimiter = OdoResponsiveAttributes.BREAKPOINT_DELIMITER;

    beforeEach(() => {
      OdoResponsiveAttributes.BREAKPOINT_DELIMITER = '@';
      createFixture('delimiter');
    });

    afterEach(() => {
      OdoResponsiveAttributes.BREAKPOINT_DELIMITER = delimiter;
      removeFixture();
    });

    it('will initialize correctly', () => {
      expect(instance.values).to.deep.equal({
        xs: null,
        sm: null,
        md: 'foo',
        lg: 'foo',
      });

      expect(instance.currentValue).to.equal(null);
    });
  });
});
