/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const {
  sinon, fixture, OdoExpandable, OdoWindowEvents, OdoHelpers,
} = window;

const expect = window.chai.expect;

fixture.setBase('fixtures');

describe('the OdoExpandable Component', function expandable() {
  this.timeout(4000);

  let instance;

  const noop = () => {};

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id, options) {
    fixture.load(`${id}.html`);

    const instances = OdoExpandable.initializeAll();
    [instance] = instances;
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    instance = null;
    fixture.cleanup();
  }

  describe('Basic Odo Expandable', () => {
    beforeEach(() => {
      createFixture('basic');
    });

    afterEach(removeFixture);

    it('has a trigger', () => {
      expect(instance.trigger).to.not.equal(null);
    });

    it('has a target', () => {
      expect(instance.target).to.not.equal(null);
    });

    it('has an id', () => {
      expect(instance.id).to.not.equal(null);
    });

    it('can open the target and apply the right class to it', () => {
      instance.open();
      expect(instance.target.classList.contains(OdoExpandable.Settings.ClassName.TARGET_OPEN)).to.equal(true);
      expect(instance.trigger.classList.contains(OdoExpandable.Settings.ClassName.TRIGGER_OPEN)).to.equal(true);
    });

    it('can close the target and apply the right class to it', () => {
      instance.close();
      expect(instance.target.classList.contains(OdoExpandable.Settings.ClassName.TARGET_OPEN)).to.equal(false);
      expect(instance.trigger.classList.contains(OdoExpandable.Settings.ClassName.TRIGGER_OPEN)).to.equal(false);
    });

    it('will set the proper ARIA attributes on the elements', () => {
      const elementId = `expandable-${instance.id}`;
      expect(instance.trigger.getAttribute('aria-describedby')).to.equal(elementId);
      expect(instance.target.getAttribute('id')).to.equal(elementId);
      expect(instance.trigger.getAttribute('aria-expanded')).to.equal('false');
      expect(instance.trigger.getAttribute('aria-controls')).to.equal(elementId);
      expect(instance.target.getAttribute('aria-labelledby')).to.equal(elementId);
      expect(instance.target.getAttribute('aria-hidden')).to.equal('true');
    });

    it('will properly change the ARIA attribute on open/close', () => {
      instance.open();
      expect(instance.trigger.getAttribute('aria-expanded')).to.equal('true');
      instance.close();
      expect(instance.trigger.getAttribute('aria-expanded')).to.equal('false');
    });

    it('will properly show and hide the expandable on click', () => {
      expect(instance.isOpen).to.equal(false);

      const evt = {
        target: instance.trigger,
        preventDefault() { return false; },
      };
      instance._triggerClickHandler(evt);

      expect(instance.isOpen).to.equal(true);
    });

    it('clicks on non triggers won\'t open anything', () => {
      expect(instance.isOpen).to.equal(false);

      const evt = {
        target: instance.target,
        preventDefault() { return false; },
      };
      instance._triggerClickHandler(evt);

      expect(instance.isOpen).to.equal(false);
    });

    it('can toggle itself to the inverse state properly', () => {
      instance.open();
      expect(instance.target.classList.contains(OdoExpandable.Settings.ClassName.TARGET_OPEN)).to.equal(true);
      expect(instance.isOpen).to.equal(true);

      instance.toggle();
      expect(instance.target.classList.contains(OdoExpandable.Settings.ClassName.TARGET_OPEN)).to.equal(false);
      expect(instance.isOpen).to.equal(false);

      instance.close();
      instance.toggle();
      expect(instance.target.classList.contains(OdoExpandable.Settings.ClassName.TARGET_OPEN)).to.equal(true);
      expect(instance.isOpen).to.equal(true);
    });

    it('will properly remove all ARIA attributes on dispose', () => {
      instance.dispose();
      expect(instance.trigger.getAttribute('aria-describedby')).to.equal(null);
      expect(instance.target.getAttribute('id')).to.equal(null);
      expect(instance.trigger.getAttribute('expanded')).to.equal(null);
      expect(instance.target.getAttribute('aria-hidden')).to.equal(null);
      expect(instance.target.getAttribute('aria-labelledby')).to.equal(null);
    });
  });

  describe('Grouped Odo Expandable', () => {
    beforeEach(() => {
      createFixture('grouped');
    });

    afterEach(removeFixture);

    it('has the proper elements', () => {
      expect(instance._elements).to.not.equal(null);
    });

    it('has the correct number of Expandables in a group', () => {
      expect(instance._expandables.length).to.equal(3);
    });

    it('correctly instantiates the Expandables object', () => {
      expect(typeof instance._expandables[0]).to.equal('object');
    });

    it('will collapse the open element when it is the last open', () => {
      expect(instance._expandables[0].isOpen).to.equal(true);
      expect(instance._expandables[1].isOpen).to.equal(false);
      expect(instance._expandables[2].isOpen).to.equal(false);

      const evt = {
        target: document.querySelector('#open-target'),
        preventDefault() { return false; },
      };
      instance._onClickHandler(evt);

      expect(instance._expandables[0].isOpen).to.equal(false);
      expect(instance._expandables[1].isOpen).to.equal(false);
      expect(instance._expandables[2].isOpen).to.equal(false);
    });

    it('will not change the group state when a non-trigger is clicked', () => {
      expect(instance._expandables[0].isOpen).to.equal(true);
      expect(instance._expandables[1].isOpen).to.equal(false);
      expect(instance._expandables[2].isOpen).to.equal(false);

      const evt = {
        target: document.querySelector('body'),
        preventDefault() { return false; },
      };
      instance._onClickHandler(evt);

      expect(instance._expandables[0].isOpen).to.equal(true);
      expect(instance._expandables[1].isOpen).to.equal(false);
      expect(instance._expandables[2].isOpen).to.equal(false);
    });

    it('will properly toggle the visibility when an unopened trigger is clicked', () => {
      expect(instance._expandables[0].isOpen).to.equal(true);
      expect(instance._expandables[1].isOpen).to.equal(false);
      expect(instance._expandables[2].isOpen).to.equal(false);

      const evt = {
        target: document.querySelector('#closed-target'),
        preventDefault() { return false; },
      };
      instance._onClickHandler(evt);

      expect(instance._expandables[0].isOpen).to.equal(false);
      expect(instance._expandables[1].isOpen).to.equal(true);
      expect(instance._expandables[2].isOpen).to.equal(false);
    });

    it('will properly dispose all children', () => {
      const dispose = sinon.spy(instance._expandables[0], 'dispose');

      instance.dispose();

      expect(dispose.callCount).to.equal(1);
    });
  });

  describe('Animated Odo Expandable', () => {
    beforeEach(() => {
      createFixture('animated');
    });

    afterEach(removeFixture);

    it('can properly instantiate itself and its subcomponents', () => {
      expect(instance._elements).to.not.equal(null);
      expect(instance._expandables).to.not.equal(null);
    });

    it('will properly set the heights of its components', () => {
      expect(instance._expandables[0].target.style.height).to.not.equal('0px');
      expect(instance._expandables[1].target.style.height).to.equal('0px');
      expect(instance._expandables[2].target.style.height).to.equal('0px');
    });

    it('will properly reset the heights when a new one is selected', () => {
      expect(instance._expandables[0].target.style.height).to.not.equal('0px');
      expect(instance._expandables[1].target.style.height).to.equal('0px');
      expect(instance._expandables[2].target.style.height).to.equal('0px');

      const animateHeight = sinon.spy(instance, '_animateHeight');

      instance.toggleVisibility('demo-expand-10');

      expect(instance._expandables[0].target.style.height).to.equal('0px');
      expect(instance._expandables[1].target.style.height).to.not.equal('0px');
      expect(instance._expandables[2].target.style.height).to.equal('0px');

      expect(animateHeight.callCount).to.equal(3);
    });

    it('will update heights for each expandable on resize', () => {
      const setHeight = sinon.spy(instance, '_setHeight');

      instance._handleResize();

      expect(setHeight.callCount).to.equal(instance._expandables.length);
    });

    it('will scroll the viewport into view if needed', () => {
      window.pageYOffset = 0;
      window.innerHeight = 10;

      const scrollTo = sinon.spy(OdoHelpers, 'scrollTo');

      instance._scrollToSelected('demo-expand-10');

      expect(scrollTo.callCount).to.equal(1);
    });

    it('will properly dispose itself and remove it\'s window listener', () => {
      const dispose = sinon.spy(instance, 'dispose');
      const removeWindowEvents = sinon.spy(OdoWindowEvents, 'remove');
      instance.dispose();
      expect(dispose.callCount).to.equal(1);
      expect(removeWindowEvents.callCount).to.equal(1);
    });
  });
});
