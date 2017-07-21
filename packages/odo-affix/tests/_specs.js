/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;

const OdoAffix = window.OdoAffix;

describe('The OdoAffix Component', function affix() {
  this.timeout(4000);

  let fixtureWrapper;
  let instance;
  let cancel;
  let request;

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id) {
    fixtureWrapper = document.getElementById(id).cloneNode(true).firstElementChild;
    document.body.appendChild(fixtureWrapper);

    const anchor = fixtureWrapper.querySelector('[data-id]');
    anchor.id = anchor.getAttribute('data-id');
    anchor.removeAttribute('data-id');
    instance = new OdoAffix(fixtureWrapper.querySelector('.js-element-to-affix'));
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    document.body.removeChild(fixtureWrapper);
    fixtureWrapper = null;
    instance = null;
  }

  beforeEach(() => {
    cancel = sinon.stub(window, 'cancelAnimationFrame');
    request = sinon.stub(window, 'requestAnimationFrame').callsFake((fn) => {
      fn();
      return 'foo';
    });
  });

  afterEach(() => {
    cancel.restore();
    request.restore();
  });

  it('will throw if the anchor cannot be found', () => {
    expect(() => {
      // eslint-disable-next-line
      new OdoAffix(document.createElement('div'));
    }).to.throw(Error);
  });

  describe('basic fixture', () => {
    beforeEach(() => {
      createFixture('fixture');
    });

    afterEach(removeFixture);

    it('should initialize correctly', () => {
      expect(instance.element).to.exist;
      expect(instance._anchor).to.exist;
      expect(instance.isStuck).to.equal(false);
      expect(instance.isAtBottom).to.equal(false);
      expect(instance._overlap).to.equal(0);
      expect(instance._marginTop).to.equal(0);
      expect(instance._marginBottom).to.equal(0);
      expect(instance.element.style.overflowY).to.equal('auto');
      expect(instance.element.classList.contains(OdoAffix.Classes.BASE)).to.be.true;
      expect(instance.top).to.equal(instance._top);
      expect(instance.bottom).to.equal(instance._bottom);
      expect(OdoAffix.instances).to.have.lengthOf(1);
    });

    it('should dispose correctly', () => {
      const element = fixtureWrapper.querySelector('.js-element-to-affix');

      instance.dispose();
      expect(instance.element).to.not.exist;
      expect(instance._anchor).to.not.exist;
      expect(element.style.overflowY).to.equal('');
      expect(element.classList.contains(OdoAffix.Classes.BASE)).to.be.false;
      expect(OdoAffix.instances).to.have.lengthOf(0);
    });

    it('can set a UI overlap getter', () => {
      const process = sinon.spy(instance, 'process');
      const stub = sinon.stub().returns(50);
      instance.uiOverlap = stub;
      expect(instance._overlap).to.equal(50);
      expect(process.callCount).to.equal(1);
    });

    it('can calculate what to do on scroll', () => {
      instance._overlap = 20;
      instance._top = 100;
      instance._bottom = 300;
      instance._marginBottom = 15;

      const stick = sinon.spy(instance, 'stick');
      const stickToBottom = sinon.spy(instance, 'stickToBottom');
      const unstick = sinon.spy(instance, 'unstick');

      instance.process(0);
      instance.process(79); // 100 - 20 - 1
      expect(stick.callCount).to.equal(0);
      expect(stickToBottom.callCount).to.equal(0);
      expect(unstick.callCount).to.equal(0);

      // Going down vvv
      instance.process(80); // 100 - 20
      instance.process(264); // 300 - 20 - 15 - 1
      expect(stick.callCount).to.equal(1);
      expect(stickToBottom.callCount).to.equal(0);
      expect(unstick.callCount).to.equal(0);
      expect(instance.isStuck).to.be.true;

      // Going down vvv - hitting bottom
      instance.process(265); // 300 - 20 - 15
      instance.process(1000);
      expect(stick.callCount).to.equal(1);
      expect(stickToBottom.callCount).to.equal(1);
      expect(unstick.callCount).to.equal(0);
      expect(instance.isStuck).to.be.true;
      expect(instance.isAtBottom).to.be.true;

      // Going up ^^^ - stick again
      instance.process(264);
      expect(stick.callCount).to.equal(2);
      expect(stickToBottom.callCount).to.equal(1);
      expect(unstick.callCount).to.equal(0);
      expect(instance.isAtBottom).to.be.false;

      // Going up ^^^ - unstick
      instance.process(79);
      expect(stick.callCount).to.equal(2);
      expect(stickToBottom.callCount).to.equal(1);
      expect(unstick.callCount).to.equal(1);
      expect(instance.isStuck).to.be.false;
      expect(instance.isAtBottom).to.be.false;
    });

    it('will cancel an old scheduled update if one exists', () => {
      const handleImageLoad = sinon.stub(OdoAffix, '_handleImageLoad');

      OdoAffix._scheduleUpdate();
      expect(OdoAffix._updateId).to.equal('foo');
      OdoAffix._scheduleUpdate();
      expect(cancel.calledWith('foo')).to.equal(true);

      handleImageLoad.restore();
    });

    it('will clear the update id when an image loads', () => {
      const update = sinon.stub(OdoAffix, 'update');
      OdoAffix._updateId = 'foo';
      OdoAffix._handleImageLoad();
      expect(OdoAffix._updateId).to.equal(null);
      update.restore();
    });

    it('will call update when an image loads', () => {
      const update = sinon.stub(OdoAffix, 'update');

      OdoAffix._handleImageLoad();
      expect(update.callCount).to.equal(1);

      update.restore();
    });

    it('can batch-update instances', () => {
      const read = sinon.spy(instance, 'read');
      const process = sinon.spy(instance, 'process');
      const unstick = sinon.spy(instance, 'unstick');

      OdoAffix.update();

      expect(unstick.callCount).to.equal(1);
      expect(read.callCount).to.equal(1);
      expect(process.callCount).to.equal(1);
    });
  });

  describe('fixture with margins', () => {
    beforeEach(() => {
      createFixture('margin-fixture');
    });

    afterEach(removeFixture);

    it('should initialize with margins', () => {
      expect(instance._marginTop).to.equal(10);
      expect(instance._marginBottom).to.equal(3);
    });
  });
});
