/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const dom = window.OdoHelpers.dom;

describe('The dom utility', function d() {
  this.timeout(5000);

  describe('handles children', () => {
    let parent;
    let child3;
    beforeEach(() => {
      parent = document.createElement('div');
      const child1 = document.createTextNode('i am text. muahaha.');
      const child2 = document.createElement('span');
      child3 = document.createElement('span');
      parent.appendChild(child1);
      parent.appendChild(child2);
      parent.appendChild(child3);

      document.body.appendChild(parent);
    });

    afterEach(() => {
      document.body.removeChild(parent);
      parent = null;
      child3 = null;
    });

    it('can get the first element child', () => {
      expect(dom.getFirstElementChild(parent).nodeType).to.equal(1);
    });

    it('should return null if there is not a first element child', () => {
      expect(dom.getFirstElementChild(child3)).to.be.null;
    });

    it('can retrieve children', () => {
      expect(dom.getChildren(parent)).to.have.length(2);
      expect(dom.getChildren(parent)).to.be.instanceof(Array);
    });

    it('can remove all children', () => {
      dom.removeChildren(parent);
      expect(parent.children).to.have.length(0);
    });
  });

  describe('the swapElements method', () => {
    let container;
    let sibling1;
    let sibling2;
    let sibling3;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'fixture';

      sibling1 = document.createElement('div');
      sibling2 = document.createElement('div');
      sibling3 = document.createElement('div');

      sibling1.className = 'one';
      sibling2.className = 'two';
      sibling3.className = 'three';

      container.appendChild(sibling1);
      container.appendChild(sibling2);
      container.appendChild(sibling3);

      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
      container = null;
    });

    it('can swap element locations', () => {
      dom.swapElements(sibling3, sibling1);

      expect(dom.getChildren(container)[0].className).to.equal('three');
      expect(dom.getChildren(container)[2].className).to.equal('one');

      dom.swapElements(sibling3, sibling2);

      expect(dom.getChildren(container)[0].className).to.equal('two');
      expect(dom.getChildren(container)[1].className).to.equal('three');

      dom.swapElements(sibling1, sibling2);

      expect(dom.getChildren(container)[0].className).to.equal('one');
      expect(dom.getChildren(container)[2].className).to.equal('two');
    });

    it('exits if one of the values if falsy', () => {
      expect(dom.swapElements('foo', null)).to.equal(undefined);
    });
  });

  describe('the getRelativeDepth method', () => {
    let container;
    let sibling1;
    let sibling2;
    let child1;
    let child2;
    let grandchild1;
    let grandchild2;

    beforeEach(() => {
      container = document.createElement('div');

      sibling1 = document.createElement('div');
      sibling2 = document.createElement('div');
      child1 = document.createElement('div');
      child2 = document.createElement('div');
      grandchild1 = document.createElement('div');
      grandchild2 = document.createElement('div');

      child1.appendChild(grandchild1);
      child2.appendChild(grandchild2);
      sibling1.appendChild(child1);
      sibling2.appendChild(child2);
      container.appendChild(sibling1);
      container.appendChild(sibling2);
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should return the depth of the element compared to another element', () => {
      // 1 depth.
      expect(dom.getRelativeDepth(sibling1, container)).to.equal(1);
      expect(dom.getRelativeDepth(sibling2, container)).to.equal(1);
      expect(dom.getRelativeDepth(child1, sibling1)).to.equal(1);
      expect(dom.getRelativeDepth(child2, sibling2)).to.equal(1);
      expect(dom.getRelativeDepth(grandchild1, child1)).to.equal(1);
      expect(dom.getRelativeDepth(grandchild2, child2)).to.equal(1);

      // 2 depth.
      expect(dom.getRelativeDepth(child1, container)).to.equal(2);
      expect(dom.getRelativeDepth(child2, container)).to.equal(2);

      // 3 depth.
      expect(dom.getRelativeDepth(grandchild1, container)).to.equal(3);
      expect(dom.getRelativeDepth(grandchild2, container)).to.equal(3);
    });

    // Same element.
    it('should return zero if its the same element', () => {
      expect(dom.getRelativeDepth(container, container)).to.equal(0);
    });

    // Not contained within the element.
    it('should return negative one if the given node is not a descendant of the given parent node', () => {
      expect(dom.getRelativeDepth(document.body, container)).to.equal(-1);
    });
  });

  describe('the getNthSibling method', () => {
    let container;
    let sibling1;
    let sibling2;
    let sibling3;
    let sibling4;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'getNthSibling';

      sibling1 = document.createElement('div');
      sibling2 = document.createElement('div');
      sibling3 = document.createElement('div');
      sibling4 = document.createElement('div');
      sibling1.className = 'one';
      sibling2.className = 'two';
      sibling3.className = 'three';
      sibling4.className = 'four';

      container.appendChild(sibling1);
      container.appendChild(sibling2);
      container.appendChild(sibling3);
      container.appendChild(sibling4);
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
      container = null;
    });

    it('can get a sibling at a provided offset', () => {
      // Passing zero still results in the nextSibling getting called.
      expect(dom.getNthSibling(sibling1, 0).className).to.equal('two');
      expect(dom.getNthSibling(sibling1, 1).className).to.equal('two');

      expect(dom.getNthSibling(sibling1, 2).className).to.equal('three');
      expect(dom.getNthSibling(sibling1, 3).className).to.equal('four');
    });

    it('can search previous siblings with an offset', () => {
      expect(dom.getNthSibling(sibling2, 1, false).className).to.equal('one');
      expect(dom.getNthSibling(sibling3, 2, false).className).to.equal('one');
      expect(dom.getNthSibling(sibling4, 3, false).className).to.equal('one');
    });

    it('returns null if sibling does not exist at the offset', () => {
      expect(dom.getNthSibling(sibling1, 4)).to.be.null;
      expect(dom.getNthSibling(sibling1, 5)).to.be.null;

      expect(dom.getNthSibling(sibling2, 5, false)).to.be.null;
      expect(dom.getNthSibling(sibling4, 4, false)).to.be.null;
    });
  });

  describe('Document state promises', () => {
    it('will return a promise on document "interactive" ready state', (done) => {
      /**
       * HEADS UP! document.readyState is read-only, and with phantom testing
       * it will most likely be 'complete' by the time this test is run.
       *
       * Therefore, we can only test the DOMContentLoaded event listener by
       * manually creating the event
       */
      let testVal = false;

      dom.ready.then(() => {
        testVal = !testVal;
        expect(testVal).to.be.true;
        done();
      });

      const DOMContentLoaded = document.createEvent('Event');
      DOMContentLoaded.initEvent('DOMContentLoaded', true, true);
      window.document.dispatchEvent(DOMContentLoaded);
    });

    it('will return a promise on document "complete" ready state', () => {
      /**
       * HEADS UP! document.readyState is read-only, and with phantom testing
       * it will most likely be 'complete' by the time this test is run.
       *
       * Therefore, we can only test readyState, since we can't manually
       * change the readyState.
       */
      let b = 1;

      return dom.loaded.then(() => {
        b += 1;
        expect(b).to.equal(2);
      });
    });
  });

  describe('giveId method', () => {
    it('will add an id to an element if it does not have one with a function', () => {
      const element = document.createElement('div');
      expect(element.id).to.equal('');
      dom.giveId(element, () => 'foo');
      expect(element.id).to.equal('foo');
    });

    it('will add an id to an element if it does not have one with a string', () => {
      const element = document.createElement('div');
      expect(element.id).to.equal('');
      dom.giveId(element, 'odo');
      expect(element.id).to.equal('odo');
    });

    it('will not add an id to an element that has one', () => {
      const element = document.createElement('div');
      element.id = 'foo';
      expect(element.id).to.equal('foo');
      dom.giveId(element, () => 'bar');
      expect(element.id).to.equal('foo');
    });
  });
});
