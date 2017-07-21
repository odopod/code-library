const OdoStickyHeaders = window.OdoStickyHeaders;

const stickyMananger = new OdoStickyHeaders();
const stickies = Array.from(document.querySelectorAll('.my-sticky'));
stickyMananger.add(stickies);

// Prism syntax highlighting can cause the code it highlights to be taller.
window.addEventListener('load', () => {
  stickyMananger.update();
});

const stickyNav = document.querySelector('.sticky-nav');
const stickyNavInner = stickyNav.firstElementChild;
const setStickyHolderBtn = document.getElementById('set-sticky-holder');
const unsetStickyHolderBtn = document.getElementById('unset-sticky-holder');

setStickyHolderBtn.addEventListener('click', function listener() {
  // Show the sticky nav.
  stickyNav.style.display = '';

  // Tell OdoStickyHeaders to put elements inside the sticky nav when they're "fixed".
  stickyMananger.stickyHolder = stickyNavInner;

  // Set the UI overlap to the size of the sticky nav.
  stickyMananger.uiOverlap = () => stickyNav.offsetHeight;

  // Showing the sticky nav caused elements on the page to move.
  stickyMananger.update();

  this.disabled = true;
  unsetStickyHolderBtn.disabled = false;
});

unsetStickyHolderBtn.addEventListener('click', function listener() {
  // Hide sticky nav.
  stickyNav.style.display = 'none';

  // Leave sticky elements where they are when they're "fixed".
  stickyMananger.stickyHolder = null;

  stickyMananger.uiOverlap = () => 0;

  // Offsets changed.
  stickyMananger.update();

  this.disabled = true;
  setStickyHolderBtn.disabled = false;
});

const setModePushBtn = document.getElementById('set-mode-push');
const setModeStackBtn = document.getElementById('set-mode-stack');

setModePushBtn.addEventListener('click', function listener() {
  stickyMananger.mode = OdoStickyHeaders.Mode.PUSH;
  stickyMananger.update();
  this.disabled = true;
  setModeStackBtn.disabled = false;
});

setModeStackBtn.addEventListener('click', function listener() {
  stickyMananger.mode = OdoStickyHeaders.Mode.STACK;
  stickyMananger.update();
  this.disabled = true;
  setModePushBtn.disabled = false;
});

window.stickyMananger = stickyMananger;
