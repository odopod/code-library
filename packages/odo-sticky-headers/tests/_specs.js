/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;

const OdoStickyHeaders = window.OdoStickyHeaders;

describe('The OdoStickyHeaders Component', function d() {
  this.timeout(4000);

  let wrapper;
  let instance;

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id) {
    wrapper = document.getElementById(id).cloneNode(true).firstElementChild;
    document.body.appendChild(wrapper);

    instance = new OdoStickyHeaders();
  }

  function removeFixture() {
    instance.dispose();

    document.body.removeChild(wrapper);
    instance = null;
  }

  describe('basic fixture', () => {
    beforeEach(() => {
      createFixture('fixture');
    });

    afterEach(removeFixture);

    it('will throw when adding non-elements', () => {
      expect(() => {
        instance.add({});
      }).to.throw(TypeError);

      expect(() => {
        instance.add(null);
      }).to.throw(TypeError);

      expect(() => {
        instance.add('');
      }).to.throw(TypeError);
    });

    it('will not throw when removing untracked elements', () => {
      expect(() => {
        instance.remove({});
      }).to.not.throw();

      expect(() => {
        instance.remove(null);
      }).to.not.throw();

      expect(() => {
        instance.remove('');
      }).to.not.throw();

      expect(() => {
        instance.remove(wrapper);
      }).to.not.throw();
    });

    describe('in push mode', () => {
      beforeEach(() => {
        instance.add(Array.from(wrapper.querySelectorAll('.js-sticky')));
      });

      it('should initialize correctly', () => {
        expect(instance._overlap).to.equal(0);
        expect(instance._holder).to.be.null;
        expect(instance.items.size).to.equal(3);
        expect(instance._mode).to.equal(OdoStickyHeaders.Mode.PUSH);
      });

      it('will wrap each sticky element in a placeholder', () => {
        instance.items.forEach((item) => {
          expect(item.element.parentNode).to.not.equal(wrapper);
          expect(item.wrapper.parentNode).to.equal(wrapper);
          expect(item.element.parentNode).to.equal(item.wrapper);
        });
      });

      it('can sort items by their offset', () => {
        let last = 0;
        instance._orderedItems.forEach((item) => {
          expect(item.top).to.be.above(last);
          last = item.top;
        });
      });

      it('should calculate the bottom offset for each item', () => {
        instance.items.forEach((item) => {
          expect(item.bottom).to.exist;
        });
      });

      it('can add a single element', () => {
        const div = document.createElement('div');
        wrapper.appendChild(div);
        instance.add(div);
        expect(instance.items.size).to.equal(4);
      });

      it('will not add the same element more than once', () => {
        const elementToAdd = wrapper.querySelectorAll('.js-sticky')[1];

        expect(instance.items.size).to.equal(3);
        instance.add(elementToAdd);
        expect(instance.items.size).to.equal(3);
      });

      it('will save new offsets on update', () => {
        const spy = sinon.spy(instance, '_cacheStyles');
        instance.update();
        expect(spy.callCount).to.equal(1);
      });

      it('can have a custom starting point for items and viewport overlap', () => {
        instance.uiOffset = () => 5;

        instance.uiOverlap = () => 50;

        instance.update();
        expect(instance._startingOffset).to.equal(5);
        expect(instance._overlap).to.equal(50);
      });

      it('can determine when to postion items', () => {
        const arr = instance._orderedItems;
        const first = arr[0];
        const spyFirstStick = sinon.spy(first, 'stick');
        const spyFirstStickToBottom = sinon.spy(first, 'stickToBottom');
        const spyFirstUnstick = sinon.spy(first, 'unstick');

        // => position fixed
        instance.process(first.top);
        expect(first.isFixed).to.be.true;
        expect(spyFirstStick.callCount).to.equal(1);
        expect(spyFirstStickToBottom.callCount).to.equal(0);
        expect(spyFirstUnstick.callCount).to.equal(0);

        // Scroll 1 more pixel, nothing should be called.
        instance.process(first.top + 1);
        expect(spyFirstStick.callCount).to.equal(1);
        expect(spyFirstStickToBottom.callCount).to.equal(0);
        expect(spyFirstUnstick.callCount).to.equal(0);

        // => position absolute
        instance.process(first.bottom);
        expect(first.isFixed).to.be.false;
        expect(first.isAtBottom).to.be.true;
        expect(spyFirstStick.callCount).to.equal(1);
        expect(spyFirstStickToBottom.callCount).to.equal(1);
        expect(spyFirstUnstick.callCount).to.equal(0);

        // Scroll 1 more pixel, nothing should be called.
        instance.process(first.bottom + 1);
        expect(spyFirstStick.callCount).to.equal(1);
        expect(spyFirstStickToBottom.callCount).to.equal(1);
        expect(spyFirstUnstick.callCount).to.equal(0);

        // => position fixed
        instance.process(first.top + 1);
        expect(first.isFixed).to.be.true;
        expect(first.isAtBottom).to.be.false;
        expect(spyFirstStick.callCount).to.equal(2);
        expect(spyFirstStickToBottom.callCount).to.equal(1);
        expect(spyFirstUnstick.callCount).to.equal(0);

        // => position relative
        instance.process(first.top - 1);
        expect(first.isFixed).to.be.false;
        expect(first.isAtBottom).to.be.false;
        expect(spyFirstStick.callCount).to.equal(2);
        expect(spyFirstStickToBottom.callCount).to.equal(1);
        expect(spyFirstUnstick.callCount).to.equal(1);

        // Scroll 1 more pixel, nothing should be called.
        instance.process(first.top - 2);
        expect(spyFirstStick.callCount).to.equal(2);
        expect(spyFirstStickToBottom.callCount).to.equal(1);
        expect(spyFirstUnstick.callCount).to.equal(1);
      });

      it('can determine when to layer promote an item', () => {
        const item = instance._orderedItems[0];
        const promote = sinon.spy(item, 'layerPromote');
        const demote = sinon.spy(item, 'layerDemote');

        item.isPromoted = false;

        // Out of range by 1 pixel (top).
        instance._itemPositionCouldChange(item, item.top - OdoStickyHeaders.PROMOTION_RANGE - 1);
        expect(item.isPromoted).to.be.false;
        expect(promote.callCount).to.equal(0);
        expect(demote.callCount).to.equal(0);

        // In range by 0 pixels (top).
        instance._itemPositionCouldChange(item, item.top - OdoStickyHeaders.PROMOTION_RANGE);
        expect(item.isPromoted).to.be.true;
        expect(promote.callCount).to.equal(1);
        expect(demote.callCount).to.equal(0);

        // In range by 0 pixels (bottom).
        instance._itemPositionCouldChange(item, item.bottom + OdoStickyHeaders.PROMOTION_RANGE);
        expect(item.isPromoted).to.be.true;
        expect(promote.callCount).to.equal(1);
        expect(demote.callCount).to.equal(0);

        // Out of range by 1 pixel (bottom).
        instance._itemPositionCouldChange(
          item, item.bottom + OdoStickyHeaders.PROMOTION_RANGE + 1);
        expect(item.isPromoted).to.be.false;
        expect(promote.callCount).to.equal(1);
        expect(demote.callCount).to.equal(1);
      });

      it('can use a sticky element holder', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        instance.stickyHolder = div;
        expect(instance._holder).to.equal(div);
        expect(instance.stickyHolder).to.equal(div);

        const item = instance._orderedItems[0];
        item.stick(0, div);
        expect(item.element.parentNode).to.equal(div);

        item.unstick();
        expect(item.element.parentNode).to.equal(item.wrapper);

        instance.stickyHolder = null;
        expect(instance._holder).to.equal(null);
        expect(instance.stickyHolder).to.equal(null);
        document.body.removeChild(div);
      });
    });

    describe('in stack mode', () => {
      beforeEach(() => {
        instance.mode = OdoStickyHeaders.Mode.STACK;
        expect(instance.mode).to.equal(OdoStickyHeaders.Mode.STACK);
        instance.add(Array.from(wrapper.querySelectorAll('.js-sticky')));
      });

      it('should not calculate the bottom offset for each item', () => {
        instance.items.forEach((item) => {
          expect(item.bottom).to.not.exist;
        });
      });

      it('can determine when to postion items', () => {
        const arr = instance._orderedItems;
        const first = arr[0];
        const spyFirstStick = sinon.spy(first, 'stick');
        const spyFirstUnstick = sinon.spy(first, 'unstick');

        // => position fixed
        instance.process(first.top);
        expect(first.isFixed).to.be.true;
        expect(spyFirstStick.callCount).to.equal(1);
        expect(spyFirstUnstick.callCount).to.equal(0);

        // Scroll 1 more pixel, nothing should be called.
        instance.process(first.top + 1);
        expect(spyFirstStick.callCount).to.equal(1);
        expect(spyFirstUnstick.callCount).to.equal(0);

        // => position relative
        instance.process(first.top - 1);
        expect(first.isFixed).to.be.false;
        expect(spyFirstStick.callCount).to.equal(1);
        expect(spyFirstUnstick.callCount).to.equal(1);
      });
    });
  });
});
