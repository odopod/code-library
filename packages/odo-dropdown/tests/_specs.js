/* global describe, it, expect, beforeEach, afterEach */
/* eslint-disable no-unused-expressions */

const sinon = window.sinon;
const animation = window.OdoHelpers.animation;
const OdoDropdown = window.OdoDropdown;

function transitionStub(element, fn, context) {
  setTimeout(() => {
    fn.call(context, {
      target: element,
      currentTarget: element,
    });
  }, 0);
}

describe('The OdoDropdown Component', function dropdown() {
  this.timeout(4000);

  let el;
  let instance;

  const noop = () => {};

  // Clone the fixture and append it to the body. Then create a new instance.
  function createFixture(id, options) {
    el = document.getElementById(id).cloneNode(true).firstElementChild;
    document.body.appendChild(el);
    const dropdownElement = el.querySelector('.odo-dropdown');

    instance = new OdoDropdown(dropdownElement, options);
  }

  function removeFixture() {
    if (instance.element) {
      instance.dispose();
    }

    document.body.removeChild(el);
    el = null;
    instance = null;
  }

  beforeEach(() => {
    // Make onTransitionEnd and onAnimationEnd a zero timeout every time.
    sinon.stub(animation, 'onTransitionEnd').callsFake(transitionStub);
    sinon.stub(animation, 'onAnimationEnd').callsFake(transitionStub);
  });

  afterEach(() => {
    animation.onTransitionEnd.restore();
    animation.onAnimationEnd.restore();
  });

  describe('Odo Dropdown', () => {
    beforeEach(() => {
      createFixture('fixture');
    });

    afterEach(removeFixture);

    it('has a getter for the <select>', () => {
      expect(instance.select).to.equal(instance._select);
    });

    it('has a getter for the <button>', () => {
      expect(instance.button).to.equal(instance._button);
    });

    it('can disable the select and button', () => {
      expect(instance.disabled).to.equal(false);
      instance.disabled = true;
      expect(instance.disabled).to.equal(true);
      expect(instance.select.disabled).to.equal(true);
      expect(instance.button.disabled).to.equal(true);
    });

    it('can get the selected option\'s value', () => {
      instance.value = '2013';
      const value = instance.value;
      expect(value).to.equal('2013');
    });

    it('can get the selected option\'s text content', () => {
      instance.value = '2012';
      const text = instance.selectedText;
      expect(text).to.equal('It is 2012');
    });

    it('can use `selectedIndex`', () => {
      expect(instance.selectedIndex).to.equal(0);
      instance.selectedIndex = 1;
      expect(instance.selectedIndex).to.equal(1);
    });

    it('emits CHANGE events with name and value', () => {
      const value = instance.value;
      let called = false;
      instance.once(OdoDropdown.EventType.CHANGE, (data) => {
        called = true;
        expect(data.value).to.equal(value);
        expect(data.name).to.equal('years1');
      });
      instance._handleSelectChange();
      expect(called).to.be.true;
    });

    it('can disable an option', () => {
      const customOption = instance.element.querySelector('[data-value="2011"]');
      const nativeOption = instance.select.querySelector('[value="2011"]');
      instance.disableOptionByValue('2011', true);
      expect(customOption.classList.contains(OdoDropdown.Classes.OPTION_DISABLED)).to.be.true;
      expect(nativeOption.disabled).to.be.true;
    });

    it('can enable an option', () => {
      const customOption = instance.element.querySelector('[data-value="2013"]');
      const nativeOption = instance.select.querySelector('[value="2013"]');
      instance.enableOptionByValue('2013', false);
      expect(customOption.classList.contains(OdoDropdown.Classes.OPTION_DISABLED)).to.be.false;
      expect(nativeOption.disabled).to.be.false;
    });

    it('gives the <select> and id', () => {
      expect(instance.id).to.exist;
    });

    it('will add selected and disabled classes to custom options', () => {
      expect(instance.getOptionMarkup({
        selected: false,
        disabled: false,
        value: 'foo',
        text: 'bar',
      })).to.equal('<div class="odo-dropdown__option" data-value="foo" tabindex="-1" role="menuitem">bar</div>');

      expect(instance.getOptionMarkup({
        selected: true,
        disabled: false,
        value: 'foo',
        text: 'bar',
      })).to.equal('<div class="odo-dropdown__option odo-dropdown__option--active" data-value="foo" tabindex="-1" role="menuitem">bar</div>');

      expect(instance.getOptionMarkup({
        selected: false,
        disabled: true,
        value: 'foo',
        text: 'bar',
      })).to.equal('<div class="odo-dropdown__option odo-dropdown__option--disabled" data-value="foo" tabindex="-1" role="menuitem">bar</div>');

      expect(instance.getOptionMarkup({
        selected: true,
        disabled: true,
        value: 'foo',
        text: 'bar',
      })).to.equal('<div class="odo-dropdown__option odo-dropdown__option--active odo-dropdown__option--disabled" data-value="foo" tabindex="-1" role="menuitem">bar</div>');
    });
  });

  describe('Odo Dropdown: <select> with id', () => {
    beforeEach(() => {
      createFixture('label-fixture', {
        useNative: false,
      });
    });

    afterEach(removeFixture);

    it('does not overwrite the existing id on the <select>', () => {
      expect(instance.select.id).to.equal('my-select-id');
    });

    it('will find the label element', () => {
      expect(instance._label).to.exist;
      expect(instance._label.id).to.exist;
    });
  });

  describe('Odo Dropdown: Native <select>', () => {
    beforeEach(() => {
      createFixture('fixture', {
        useNative: true,
      });
    });

    afterEach(() => {
      removeFixture();
    });

    it('will fallback to native select element', () => {
      const nativeSpy = sinon.stub(instance, '_initializeNativeDropdown');
      instance._initialize();
      expect(nativeSpy.called).to.be.true;
    });

    it('will update select value in wrapper on select change', () => {
      instance.select.value = '2012';
      instance._handleSelectChange();
      expect(instance._valueContainer.textContent).to.equal('It is 2012');
      expect(instance.value).to.equal('2012');
    });
  });

  describe('Odo Dropdown: Custom markup', () => {
    beforeEach(() => {
      createFixture('fixture', {
        useNative: false,
      });
    });

    afterEach((done) => {
      setTimeout(() => {
        removeFixture();
        done();
      }, 0);
    });

    it('will create custom dropdown component', () => {
      const customSpy = sinon.stub(instance, '_initializeCustomDropdown');
      instance._initialize();
      expect(customSpy.called).to.be.true;
    });

    describe('Opening/closing options', () => {
      it('will give focus to the selected option after open', (done) => {
        const openCallback = sinon.spy(instance, '_handleOptionsShown');
        instance._showOptions();

        setTimeout(() => {
          expect(openCallback.called).to.be.true;
          expect(instance._selectedOption).to.equal(document.activeElement);
          done();
        });
      });

      it('will not focus if a selected option is falsey', (done) => {
        const openCallback = sinon.spy(instance, '_handleOptionsShown');
        instance._selectedOption = undefined;
        instance._showOptions();

        setTimeout(() => {
          expect(openCallback.called).to.be.true;
          done();
        });
      });

      it('will give the custom display focus after close', (done) => {
        const closeCallback = sinon.spy(instance, '_handleOptionsHidden');
        instance._hideOptions();

        setTimeout(() => {
          expect(closeCallback.called).to.be.true;
          expect(instance._button).to.equal(document.activeElement);
          done();
        });
      });
    });

    describe('Open options', () => {
      it('won\'t be able to select a disabled option', () => {
        const hideSpy = sinon.spy(instance, '_hideOptions');
        const disabledOption = instance.element.querySelector('[data-value="2011"]');
        instance.disableOptionByValue('2011', true);
        instance._showOptions();
        instance._selectOption(disabledOption);
        expect(disabledOption.classList.contains(
          OdoDropdown.Classes.OPTION_DISABLED)).to.be.true;
        expect(hideSpy.called).to.be.false;
      });

      it('pressing UP key will give previous option focus', (done) => {
        instance.value = '2013'; // third option out of five
        instance._showOptions();

        setTimeout(() => {
          const current = document.activeElement;
          const prev = current.previousElementSibling;

          expect(current).to.equal(instance._selectedOption);

          // Go to previous enabled option.
          OdoDropdown._moveFocus(false);

          expect(prev).to.equal(document.activeElement);

          // Disable the only previous option left. The currently focused element
          // should stay the same.
          instance.disableOptionByValue('2011');
          OdoDropdown._moveFocus(false);
          expect(prev).to.equal(document.activeElement);

          done();
        }, 0);
      });

      it('pressing DOWN key will give next option focus', (done) => {
        instance.value = '2012';
        instance._showOptions();

        setTimeout(() => {
          const current = document.activeElement;
          const next = current.nextElementSibling;
          OdoDropdown._moveFocus(true); // DOWN KEY
          expect(next).to.equal(document.activeElement);
          done();
        }, 0);
      });

      it('next match will return null if no siblings match', () => {
        const options = instance.getCustomOptions();
        const penultimateOption = options[options.length - 2];
        const lastOption = options[options.length - 1];
        expect(OdoDropdown._nextMatch(penultimateOption, '.doesntexist')).to.equal(null);
        expect(OdoDropdown._nextMatch(lastOption, 'div')).to.equal(null);
      });
    });

    describe('On document click with options open', () => {
      it('if an option is clicked, the selected option will be selected', () => {
        const firstOption = instance.getElementByClass(OdoDropdown.Classes.OPTION);
        const selectedOptionSpy = sinon.spy(instance, '_selectOption');
        const event = {
          target: firstOption,
        };

        instance._handlePageClick(event);
        expect(selectedOptionSpy.called).to.be.true;
      });

      it('if an option is not clicked, the options will close', () => {
        const body = document.querySelector('.outside');
        const hideOptionsSpy = sinon.spy(instance, '_hideOptions');
        const event = {
          target: body,
        };

        instance._handlePageClick(event);
        expect(hideOptionsSpy.called).to.be.true;
      });
    });

    describe('Keyboard events', () => {
      it('pressing SPACE, DOWN, UP, or ENTER keys will open options', () => {
        const openOptionSpy = sinon.spy(instance, '_showOptions');

        // SPACE key
        const event = {
          which: OdoDropdown.Key.SPACE,
          preventDefault: noop,
        };

        instance._handleKey(event);
        expect(openOptionSpy.called).to.be.true;
        instance._hideOptions();

        // DOWN key
        event.which = OdoDropdown.Key.DOWN;
        instance._handleKey(event);
        expect(openOptionSpy.called).to.be.true;
        instance._hideOptions();

        // UP key
        event.which = OdoDropdown.Key.UP;
        instance._handleKey(event);
        expect(openOptionSpy.called).to.be.true;
        instance._hideOptions();

        // ENTER key
        event.which = OdoDropdown.Key.ENTER;
        instance._handleKey(event);
        expect(openOptionSpy.called).to.be.true;
      });

      it('with options open, pressing ESC or TAB keys will close options', () => {
        const hideOptionSpy = sinon.spy(instance, '_hideOptions');
        const event = {
          which: OdoDropdown.Key.ESC,
          preventDefault: noop,
        };

        instance._showOptions();
        instance._handleKey(event);
        expect(hideOptionSpy.called).to.be.true;

        event.which = OdoDropdown.Key.TAB;
        instance._showOptions();
        instance._handleKey(event);
        expect(hideOptionSpy.called).to.be.true;
      });

      it('with options open, pressing SPACE or ENTER keys will select an option', () => {
        const selectOptionSpy = sinon.stub(instance, '_selectOption').callsFake(noop);
        const event = {
          which: OdoDropdown.Key.SPACE,
          preventDefault: noop,
        };

        instance._showOptions();
        instance._handleKey(event);
        expect(selectOptionSpy.called).to.be.true;

        event.which = OdoDropdown.Key.ENTER;
        instance._showOptions();
        instance._handleKey(event);
        expect(selectOptionSpy.called).to.be.true;
      });

      it('with options open, pressing DOWN or UP keys will shift option focus', () => {
        const shiftFocusSpy = sinon.stub(OdoDropdown, '_moveFocus').callsFake(noop);
        const event = {
          which: OdoDropdown.Key.DOWN,
          preventDefault: noop,
        };

        instance._showOptions();
        instance._handleKey(event);
        expect(shiftFocusSpy.called).to.be.true;

        event.which = OdoDropdown.Key.UP;
        instance._showOptions();
        instance._handleKey(event);
        expect(shiftFocusSpy.called).to.be.true;

        shiftFocusSpy.restore();
      });
    });
  });

  describe('Odo Dropdown: without inserting markup', () => {
    beforeEach(() => {
      createFixture('react-fixture', {
        insertMarkup: false,
        useNative: false,
      });
    });

    afterEach(() => {
      removeFixture();
    });

    it('assumes the markup already exists for custom options', () => {
      expect(instance.getCustomOptions()).to.have.lengthOf(3);
    });

    it('can handle options changing', () => {
      // Simulate react or another view-based framework replacing the options with new options.
      instance._optionsContainer.textContent = '';
      instance.select.innerHTML = `<option value="birthday">Birthday</option>
      <option value="title" selected>Title</option>
      <option value="age">Age</option>`;
      const markup = instance.getOptionsMarkup();
      instance.select.insertAdjacentHTML('beforebegin', markup);
      expect(instance.value).to.equal('title');
    });
  });

  describe('Odo Dropdown: `selected` option', () => {
    beforeEach(() => {
      createFixture('selected-fixture');
    });

    afterEach(() => {
      removeFixture();
    });

    it('will have the value of the selected option', () => {
      expect(instance.value).to.equal('2013');
    });
  });

  describe('Odo Dropdown: `disabled` options', () => {
    beforeEach(() => {
      createFixture('disabled-fixture');
    });

    afterEach(() => {
      removeFixture();
    });

    // Chrome and Firefox it will be empty. Safari and PhantomJS, it will be the first option.
    it('will have an empty value or the first option', () => {
      expect(instance.value === '' || instance.value === '2011').to.equal(true);
    });

    it('will not throw when all options are disabled', () => {
      instance._selectedOption = undefined;

      expect(() => {
        instance.value = '';
      }).not.to.throw(Error);
    });
  });
});
