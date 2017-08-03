/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const expect = window.chai.expect;
const sinon = window.sinon;
const fixture = window.fixture;

const OdoTabs = window.OdoTabs;

fixture.setBase('fixtures');

describe('The tabs component', () => {
  let element;
  let instance;

  function createFixture(id, options) {
    fixture.load(`${id}.html`);
    const wrapper = fixture.el.firstElementChild;
    element = wrapper.querySelector('.tabs-list');

    instance = new OdoTabs(element, options);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    element = null;
    instance = null;
    fixture.cleanup();
  }

  describe('normal tabs', () => {
    beforeEach(() => {
      createFixture('basic');
    });

    afterEach(removeFixture);

    it('can instantiate', () => {
      expect(instance.tabs).to.have.lengthOf(4);
      expect(instance.anchors).to.have.lengthOf(4);
      expect(instance.panes).to.have.lengthOf(4);
      expect(instance.panesContainer).to.exist;
      expect(instance.hashes).to.deep.equal([null, null, null, null]);
      expect(instance.getSelectedIndex()).to.equal(0);
    });

    it('will set aria roles and states', () => {
      expect(instance.element.getAttribute('role')).to.equal('tablist');

      for (let i = 0, length = instance.anchors.length; i < length; i++) {
        const anchor = instance.anchors[i];
        const pane = instance.panes[i];
        const tab = instance.tabs[i];

        expect(anchor.id).to.exist;
        expect(pane.id).to.exist;
        expect(pane.getAttribute('aria-labelledby')).to.equal(anchor.id);
        expect(anchor.getAttribute('aria-controls')).to.equal(pane.id);

        expect(anchor.getAttribute('role')).to.equal('tab');
        expect(tab.getAttribute('role')).to.equal('presentation');
        expect(pane.getAttribute('role')).to.equal('tabpanel');
      }

      expect(instance.anchors[0].getAttribute('aria-selected')).to.equal('true');
      expect(instance.anchors[1].getAttribute('aria-selected')).to.equal('false');
      expect(instance.anchors[0].getAttribute('tabIndex')).to.equal('0');
      expect(instance.anchors[1].getAttribute('tabIndex')).to.equal('-1');

      expect(instance.panes[0].getAttribute('aria-hidden')).to.equal('false');
      expect(instance.panes[1].getAttribute('aria-hidden')).to.equal('true');
    });

    it('can dispose', () => {
      instance.dispose();
      expect(instance.element).to.be.null;
      expect(instance.anchors).to.be.null;
      expect(instance.panes).to.be.null;
      expect(instance.panesContainer).to.be.null;
      expect(instance.getSelectedIndex()).to.equal(-1);
      expect(element.getAttribute('role')).to.be.null;
    });

    it('can handle keyboard input', () => {
      const getFocused = sinon.stub(instance, '_getFocusedTabIndex');
      const setSelected = sinon.stub(instance, 'setSelectedIndex');
      const preventDefault = sinon.spy();
      const focusTab = sinon.spy(instance, '_focusTab');

      getFocused.returns(1);

      // Right
      instance._handleKeydown({
        which: 39,
        preventDefault,
      });

      expect(preventDefault.callCount).to.equal(1);
      expect(focusTab.callCount).to.equal(1);
      expect(focusTab.calledWith(2)).to.be.true;

      // Tab. Should return early.
      instance._handleKeydown({
        which: 9,
        preventDefault,
      });

      expect(preventDefault.callCount).to.equal(1);
      expect(focusTab.callCount).to.equal(1);

      // Left
      instance._handleKeydown({
        which: 37,
        preventDefault,
      });

      expect(preventDefault.callCount).to.equal(2);
      expect(focusTab.callCount).to.equal(2);
      expect(focusTab.calledWith(0)).to.be.true;

      // Spacebar
      instance._handleKeydown({
        which: 32,
        preventDefault,
      });

      expect(preventDefault.callCount).to.equal(3);
      expect(focusTab.callCount).to.equal(2);
      expect(setSelected.callCount).to.equal(1);

      // testing the the actual _getFocusedTabIndex method
      getFocused.restore();
      instance._focusTab(3);
      expect(instance._getFocusedTabIndex()).to.equal(3);
    });

    it('will not set an index out of range or a current one', () => {
      const selectPane = sinon.spy(instance, '_selectPane');

      instance.setSelectedIndex(0);
      expect(selectPane.callCount).to.equal(0);

      instance.setSelectedIndex(5);
      expect(selectPane.callCount).to.equal(0);

      instance.setSelectedIndex(-1);
      expect(selectPane.callCount).to.equal(0);

      instance.setSelectedIndex(2);
      expect(selectPane.callCount).to.equal(1);
    });

    it('can be prevented from showing a tab', () => {
      const selectPane = sinon.spy(instance, '_selectPane');

      instance.once(OdoTabs.EventType.WILL_SHOW, (evt) => {
        expect(evt.index).to.equal(1);
        evt.preventDefault();
      });

      instance.setSelectedIndex(1);
      expect(selectPane.callCount).to.equal(0);
    });

    it('can update the height of the tab panes container element', () => {
      instance.update();
    });

    it('knows which pane to go to when a tab is clicked', () => {
      const selectStub = sinon.stub(instance, 'setSelectedIndex');

      instance._handleClick({
        target: instance.anchors[1],
        preventDefault() {},
      });

      expect(selectStub.callCount).to.equal(1);
      expect(selectStub.calledWith(1)).to.equal(true);

      instance._handleClick({
        target: document.body,
        preventDefault() {},
      });

      expect(selectStub.callCount).to.equal(1);
    });

    it('will emit an event after selecting a tab', () => {
      expect(instance.getSelectedIndex()).to.equal(0);

      instance.element.addEventListener(OdoTabs.EventType.DID_SHOW, () => {
        expect(instance.getSelectedIndex()).to.equal(1);
      });

      instance.setSelectedIndex(1);
    });
  });

  describe('tabs with hashes', () => {
    beforeEach(() => {
      createFixture('hash');
    });

    afterEach(removeFixture);

    it('will change the hash upon navigation', () => {
      instance.setSelectedIndex(3);
      expect(window.location.hash).to.equal('#shark');
      expect(instance._getWindowHashIndex()).to.equal(3);
    });

    it('will initialize with the index of the hash', () => {
      expect(instance.getSelectedIndex()).to.equal(3);
    });

    it('will set the tab index on hash change if the hash matches', () => {
      const stub = sinon.stub(instance, '_getWindowHashIndex').returns(-1);
      const setter = sinon.stub(instance, 'setSelectedIndex');

      instance._handleHashChange();
      expect(setter.callCount).to.equal(0);

      stub.returns(3);
      instance._handleHashChange();
      expect(setter.callCount).to.equal(1);

      stub.restore();
      setter.restore();
    });
  });

  describe('tabs with starting index', () => {
    beforeEach(() => {
      createFixture('start-at-second');
    });

    afterEach(removeFixture);

    it('will show the tab pane with the `is-selected` class', () => {
      expect(instance.getSelectedIndex()).to.equal(1);
    });
  });
});
