/* eslint-disable no-console */

const OdoDialog = window.OdoDialog;

const defaultDialog = new OdoDialog(document.getElementById('default'));

defaultDialog.on(OdoDialog.EventType.OPENED, () => {
  console.log('default dialog opened');
});

defaultDialog.on(OdoDialog.EventType.CLOSED, () => {
  console.log('default dialog closed');
});

defaultDialog.on(OdoDialog.EventType.TRIGGER_CLICKED, (triggerElement) => {
  console.log('dialog about to open because you clicked:', triggerElement);
});

const styledDialog = new OdoDialog(document.getElementById('styled'));

const animationChanger = new OdoDialog(document.getElementById('animation-changer'));

const modal = new OdoDialog(document.getElementById('modal-dialog'), {
  dismissable: false,
});

const button = modal.element.querySelector('button');
button.addEventListener('click', () => {
  modal.close();
});

const scrollable = new OdoDialog(document.getElementById('scrollable-region'), {
  scrollableElement: '.my-list',
});

const fullscreen = new OdoDialog(document.getElementById('fullscreen'));
const inception = new OdoDialog(document.getElementById('inception'));

window.defaultDialog = defaultDialog;
window.styledDialog = styledDialog;
window.animationChanger = animationChanger;
window.modal = modal;
window.scrollable = scrollable;
window.fullscreen = fullscreen;
window.inception = inception;

// Change the class applied to the animation-changer dialog.
const select = document.querySelector('#animation-select');
animationChanger.element.classList.add(select.value);
select.addEventListener('change', () => {
  const classes = Array.from(select.options, opt => opt.value);
  animationChanger.element.classList.remove(...classes);
  animationChanger.element.classList.add(select.value);
});


// Normally, we would use @odopod/odo-scroll-animation for the scroll listener.
class ScrollToCloseDialog extends OdoDialog {
  constructor(element, options) {
    super(element, options);
    this._onScroll = this._onScroll.bind(this);
    this._onOpened = this._onOpened.bind(this);
    this._onClosed = this._onClosed.bind(this);
    this._saveCloseOffset = this._saveCloseOffset.bind(this);
    this.on(OdoDialog.EventType.OPENED, this._onOpened);
    this.on(OdoDialog.EventType.CLOSED, this._onClosed);
  }

  _saveCloseOffset() {
    const viewportHeight = window.innerHeight;

    // The extra margin is on the inner element, so it's included in the height
    // of the content element.
    const contentHeight = this.element.scrollHeight - viewportHeight;

    this.closeOffset = contentHeight -
      Math.round(viewportHeight / ScrollToCloseDialog.VIEWPORT_DIVISOR);
  }

  _onOpened() {
    this._saveCloseOffset();
    this.element.addEventListener('scroll', this._onScroll);
    window.addEventListener('resize', this._saveCloseOffset);
  }

  _onClosed() {
    this.element.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._saveCloseOffset);
  }

  _onScroll() {
    if (this.element.scrollTop > this.closeOffset) {
      this.close();
    }
  }

  dispose() {
    this.off(OdoDialog.EventType.OPENED, this._onOpened);
    this.off(OdoDialog.EventType.CLOSED, this._onClosed);
    super.dispose();
  }
}

// Require the user to scroll the content + x-1/x of the extra space.
ScrollToCloseDialog.VIEWPORT_DIVISOR = 6;

const scrollToClose = new ScrollToCloseDialog(document.getElementById('scroll-to-close'));

window.scrollToClose = scrollToClose;
