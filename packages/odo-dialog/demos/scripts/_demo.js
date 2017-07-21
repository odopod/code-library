/* eslint-disable no-console */

const OdoDialog = window.OdoDialog;

const defaultDialog = new OdoDialog(document.getElementById('default'));

defaultDialog.on(OdoDialog.EventType.OPENED, () => {
  console.log('default dialog opened');
});

defaultDialog.on(OdoDialog.EventType.CLOSED, () => {
  console.log('default dialog closed');
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

window.defaultDialog = defaultDialog;
window.styledDialog = styledDialog;
window.animationChanger = animationChanger;
window.modal = modal;
window.scrollable = scrollable;
window.fullscreen = fullscreen;

// Change the class applied to the animation-changer dialog.
const select = document.querySelector('#animation-select');
animationChanger.element.classList.add(select.value);
select.addEventListener('change', () => {
  const classes = Array.from(select.options).map(opt => opt.value);
  animationChanger.element.classList.remove(...classes);
  animationChanger.element.classList.add(select.value);
});


// Normally, we would use @odopod/odo-scroll-animation for the scroll listener.
class ScrollToCloseDialog extends OdoDialog {
  constructor(element, options) {
    super(element, options);
    this.onScroll = this.onScroll.bind(this);
    this.on(OdoDialog.EventType.OPENED, this._onOpened.bind(this));
    this.on(OdoDialog.EventType.CLOSED, this._onClosed.bind(this));
  }

  _onOpened() {
    const viewportHeight = window.innerHeight;

    // The extra margin is on the inner element, so it's included in the height
    // of the content element.
    const contentHeight = this.element.scrollHeight - viewportHeight;

    // Require the user to scroll the content + 7/8 of the extra space.
    this.closeOffset = contentHeight - Math.round(viewportHeight / 8);

    // Listen for scrolls.
    this.element.addEventListener('scroll', this.onScroll);
  }

  _onClosed() {
    this.element.removeEventListener('scroll', this.onScroll);
  }

  onScroll() {
    const scrollTop = this.element.scrollTop;
    if (scrollTop > this.closeOffset) {
      this.close();
    }
  }
}

const scrollToClose = new ScrollToCloseDialog(document.getElementById('scroll-to-close'));

window.scrollToClose = scrollToClose;
