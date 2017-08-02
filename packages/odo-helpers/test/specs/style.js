/* global describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

describe('The style utility', () => {
  const expect = window.chai.expect;
  const style = window.OdoHelpers.style;
  const sinon = window.sinon;

  let element;

  beforeEach(() => {
    element = document.createElement('div');
    element.style.cssText = 'box-sizing:border-box;width:300px;height:150px;' +
      'padding: 5px 2px;margin:10px 20px 30px 40px;';
    element.id = 'fixture';
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (document.body.contains(element)) {
      element.parentNode.removeChild(element);
    }

    element = null;
  });

  describe('the getSize method', () => {
    it('should have a width and height', () => {
      expect(style.getSize(element)).to.deep.equal({
        width: 300,
        height: 150,
      });
    });

    it('should return zeros when the element is display none', () => {
      element.style.display = 'none';
      expect(style.getSize(element)).to.deep.equal({
        width: 0,
        height: 0,
      });
    });
  });

  describe('the getMarginBox method', () => {
    it('should return a box with margins', () => {
      expect(style.getMarginBox(element)).to.deep.equal({
        top: 10,
        right: 20,
        bottom: 30,
        left: 40,
      });
    });

    it('should resolve auto margins', () => {
      const parent = document.createElement('div');
      parent.style.cssText = 'width:400px;height:200px;';
      document.body.removeChild(element);
      document.body.appendChild(parent);
      parent.appendChild(element);

      element.style.marginTop = 'auto';
      element.style.marginRight = 'auto';
      element.style.marginBottom = 'auto';
      element.style.marginLeft = 'auto';

      const parentWidth = element.parentNode.offsetWidth;
      const elementWidth = element.offsetWidth;
      const centered = (parentWidth - elementWidth) / 2;

      // getComputedStyle for PhantomJS doesn't resolve auto margins correctly.
      const gCS = sinon.stub(window, 'getComputedStyle').returns({
        marginTop: '0px',
        marginRight: `${centered}px`,
        marginLeft: `${centered}px`,
        marginBottom: '0px',
      });

      expect(style.getMarginBox(element)).to.deep.equal({
        top: 0,
        right: centered,
        bottom: 0,
        left: centered,
      });

      document.body.removeChild(parent);
      gCS.restore();
    });
  });

  describe('the getPaddingBox method', () => {
    it('should return a box with paddings', () => {
      expect(style.getPaddingBox(element)).to.deep.equal({
        top: 5,
        right: 2,
        bottom: 5,
        left: 2,
      });
    });
  });

  describe('the getElementsSize method', () => {
    let element2;
    let element3;
    beforeEach(() => {
      element2 = document.createElement('div');
      element3 = document.createElement('div');
      element2.id = 'fixture2';
      element3.id = 'fixture3';

      element2.style.cssText = 'box-sizing:border-box;width:300px;height:150px;' +
        'padding: 5px 2px;margin:10px 20px 30px 40px;';
      element3.style.cssText = 'box-sizing:border-box;width:300px;height:150px;' +
        'padding: 5px 2px;margin:10px 20px 30px 40px;';

      document.body.appendChild(element2);
      document.body.appendChild(element3);
    });

    afterEach(() => {
      document.body.removeChild(document.getElementById('fixture2'));
      document.body.removeChild(document.getElementById('fixture3'));
      element2 = null;
      element3 = null;
    });

    it('can get the total width', () => {
      const totalElements = 3;
      const width = totalElements * 300;
      const margins = (20 * totalElements) + (40 * totalElements);
      const total = width + margins;
      expect(style.getElementsSize([element, element2, element3], 'width')).to.equal(total);
    });

    it('can get the total height', () => {
      const totalElements = 3;
      const height = totalElements * 150;
      const margins = (10 * totalElements) + (30 * totalElements);
      const total = height + margins;
      expect(style.getElementsSize([element, element2, element3], 'height')).to.equal(total);
    });
  });

  describe('the getWindowHeight method', () => {
    it('should return the correct window size', () => {
      expect(style.getWindowHeight()).to.equal(window.innerHeight);
    });
  });

  describe('the forceRedraw method', () => {
    it('can be called', () => {
      expect(style.forceRedraw()).to.equal(undefined);
    });
  });

  describe('the causeLayout method', () => {
    it('can be called', () => {
      expect(style.causeLayout(element)).to.equal(element.offsetWidth);
    });
  });

  describe('the even heights method', () => {
    /**
     * Because EvenHeights reset the style attribute's height to get the correct
     * height each time it's called, setting height on the main element doesn't work
     * it has to be on a child element.
     * @param  {number} height    Desired height.
     * @param  {string} className Element's class.
     * @param  {string=} text Text content.
     * @return {Element}          The element.
     */

    function createElementWithHeight(height, className, text) {
      const element = document.createElement('div');
      const child = document.createElement('div');
      child.style.height = `${height}px`;

      if (text) {
        child.appendChild(document.createTextNode(text));
      }

      if (className) {
        element.className = className;
      }

      element.appendChild(child);

      return element;
    }

    beforeEach(() => {
      // Take off the height on the main demo element.
      element.style.height = '';

      const group1Item1 = createElementWithHeight(100, 'group1');
      const group1Item2 = createElementWithHeight(200, 'group1');
      const group1Item3 = createElementWithHeight(300, 'group1');

      const group2Item1 = createElementWithHeight(5, 'group2');
      const group2Item2 = createElementWithHeight(0, 'group2');
      const group2Item3 = createElementWithHeight(20, 'group2');

      const group3Item1 = createElementWithHeight(50, 'group3');
      const group3Item2 = createElementWithHeight(49, 'group3');
      const group3Item3 = createElementWithHeight(48, 'group3');

      [
        group1Item1,
        group1Item2,
        group1Item3,

        group2Item1,
        group2Item2,
        group2Item3,

        group3Item1,
        group3Item2,
        group3Item3,
      ].forEach((item) => {
        element.appendChild(item);
      });
    });

    afterEach(() => {});

    it('can even out the heights of a node list', () => {
      const nodeList = document.querySelectorAll('.group1');
      expect(style.evenHeights(nodeList)).to.equal(300);
      for (let i = 0; i < nodeList.length; i++) {
        expect(nodeList[i].offsetHeight).to.equal(300);
      }
    });

    it('can even out the heights multiple collections', () => {
      const groups = [
        element.querySelectorAll('.group1'),
        element.querySelectorAll('.group2'),
        element.querySelectorAll('.group3'),
      ];

      expect(style.evenHeights(groups)).to.deep.equal([300, 20, 50]);

      const group1 = Array.from(element.querySelectorAll('.group1'));
      const group2 = Array.from(element.querySelectorAll('.group2'));
      const group3 = Array.from(element.querySelectorAll('.group3'));

      group1.forEach((el) => {
        expect(el.offsetHeight).to.equal(300);
      });

      group2.forEach((el) => {
        expect(el.offsetHeight).to.equal(20);
      });

      group3.forEach((el) => {
        expect(el.offsetHeight).to.equal(50);
      });
    });

    it('should fail silently with an empty collection', () => {
      const groups = document.querySelectorAll('.theisnotonthepage');
      const fn = () => {
        style.evenHeights(groups);
      };

      expect(fn).not.to.throw(Error);
      expect(style.evenHeights(groups)).to.deep.equal([]);
    });
  });
});
