const OdoAffix = window.OdoAffix;

let affix = new OdoAffix(document.querySelector('.js-my-sidebar'));
const affix2 = new OdoAffix(document.querySelector('.js-my-big-nav'));

// Add a button which, when clicked, toggles the UI overlap.
let hasOverlap = false;
const overlapButton = document.getElementById('set-ui-overlap');
const setText = overlapButton.textContent;
const removeText = overlapButton.getAttribute('data-reset');
overlapButton.addEventListener('click', () => {
  hasOverlap = !hasOverlap;

  // Set the Affix element to be position 50 pixels from the top of the browser.
  // This is useful when you have other sticky things on the page, like navigation.
  affix.uiOverlap = function uiOverlap() {
    overlapButton.textContent = hasOverlap ? removeText : setText;
    return hasOverlap ? 50 : 0;
  };
});

// Add a button which hides most of the links, changing the height of the affix instance.
let hasAllLinks = true;
const toggleLinkButton = document.getElementById('link-toggle');
const relevantText = toggleLinkButton.textContent;
const allText = toggleLinkButton.getAttribute('data-reset');
toggleLinkButton.addEventListener('click', () => {
  hasAllLinks = !hasAllLinks;
  toggleLinkButton.textContent = hasAllLinks ? relevantText : allText;
  const irrelevantLinks = toggleLinkButton.parentNode.querySelectorAll('li:not(.relevant)');
  const display = hasAllLinks ? '' : 'none';

  for (let i = 0; i < irrelevantLinks.length; i++) {
    irrelevantLinks[i].style.display = display;
  }

  // Notify the instance that the height changed.
  affix2.update();
});

const mediaHandler = (media) => {
  if (media.matches && !affix) {
    affix = new OdoAffix(document.querySelector('.js-my-sidebar'));
  } else if (!media.matches && affix) {
    affix.dispose();
    affix = null;
  }
};

const query = window.matchMedia('(min-width: 768px)');
query.addListener(mediaHandler);
mediaHandler(query);
