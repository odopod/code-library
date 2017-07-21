/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;

const OdoBaseComponent = window.OdoBaseComponent;
const OdoResponsiveAttributes = window.OdoResponsiveAttributes;

describe('The OdoResponsiveAttributes Component', function d() {
  this.timeout(4000);

  let element;
  let instance;

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id, attributeName) {
    element = document.getElementById(id).cloneNode(true).firstElementChild;
    document.body.appendChild(element);

    instance = new OdoResponsiveAttributes(element, attributeName);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    document.body.removeChild(element);
    element = null;
    instance = null;
  }

  sinon.stub(OdoBaseComponent, 'getCurrentBreakpoint').returns('sm');

  describe('basic fixture', () => {
    beforeEach(() => {
      createFixture('fixture');
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
      createFixture('custom-attribute-fixture', 'class-name');
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
      createFixture('all-breakpoints-fixture');
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
      createFixture('default-value-fixture');
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
      createFixture('delimiter-fixture');
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
