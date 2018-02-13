/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const { expect } = window.chai;
const {
  sinon,
  fixture,
  OdoResponsiveClasses,
  OdoBaseComponent,
} = window;

fixture.setBase('fixtures');

const getCurrentBreakpoint = sinon.stub(OdoBaseComponent, 'getCurrentBreakpoint')
  .returns('sm');

describe('The OdoResponsiveClasses Component', () => {
  describe('basic fixture', () => {
    beforeEach(() => {
      fixture.load('basic.html');
      OdoResponsiveClasses.initializeAll();
    });

    afterEach(() => {
      OdoResponsiveClasses.disposeAll(document.body);
      fixture.cleanup();
    });

    it('will find all responsive class elements on the page upon load', () => {
      expect(OdoResponsiveClasses.items).to.have.lengthOf(1);
    });

    it('will call `process` when a media query changes', () => {
      const processSpy = sinon.spy(OdoResponsiveClasses, 'process');
      OdoResponsiveClasses.onMediaQueryChange();
      expect(processSpy.callCount).to.equal(1);
      processSpy.restore();
    });

    describe('with new content after page load', () => {
      let div;
      let newContent;

      beforeEach(() => {
        div = `
          <div id="new-content">
            <div class="odo-responsive-classes" data-class.xs="foo"></div>
            <div class="odo-responsive-classes" data-class.sm="bar"></div>
          </div>`;

        document.body.insertAdjacentHTML('beforeend', div);
        newContent = document.getElementById('new-content');
      });

      afterEach(() => {
        document.body.removeChild(newContent);
      });

      it('can add elements', () => {
        const processSpy = sinon.spy(OdoResponsiveClasses, 'process');
        OdoResponsiveClasses.initializeAll(newContent);
        expect(OdoResponsiveClasses.items).to.have.lengthOf(3);
        expect(processSpy.callCount).to.equal(1);
        expect(OdoResponsiveClasses.items[1].element).to.equal(newContent.children[0]);
        expect(OdoResponsiveClasses.items[2].element).to.equal(newContent.children[1]);
        OdoResponsiveClasses.removeAll([...newContent.children]);

        processSpy.restore();
      });

      it('can dispose of elements', () => {
        OdoResponsiveClasses.initializeAll(newContent);
        OdoResponsiveClasses.disposeAll(newContent);
        expect(OdoResponsiveClasses.items).to.have.lengthOf(1);
      });
    });
  });

  describe('fixture without xs attribute', () => {
    getCurrentBreakpoint.reset();
    getCurrentBreakpoint.returns('xs');

    beforeEach(() => {
      fixture.load('no-xs.html');
      OdoResponsiveClasses.initializeAll();
    });

    afterEach(() => {
      OdoResponsiveClasses.disposeAll(document.body);
      fixture.cleanup();
    });

    it('can have an optional data-class.xs attribute', () => {
      expect(OdoResponsiveClasses.items).to.have.lengthOf(1);
      const { element } = OdoResponsiveClasses.items[0];
      expect(element.classList.contains('text-center')).to.equal(false);
    });
  });
});
