(function () {
  'use strict';

  var OdoAffix = window.OdoAffix;

  var affix = new OdoAffix(document.querySelector('.js-my-sidebar'));
  var affix2 = new OdoAffix(document.querySelector('.js-my-big-nav'));

  // Add a button which, when clicked, toggles the UI overlap.
  var hasOverlap = false;
  var overlapButton = document.getElementById('set-ui-overlap');
  var setText = overlapButton.textContent;
  var removeText = overlapButton.getAttribute('data-reset');
  overlapButton.addEventListener('click', function () {
    hasOverlap = !hasOverlap;

    // Set the Affix element to be position 50 pixels from the top of the browser.
    // This is useful when you have other sticky things on the page, like navigation.
    affix.uiOverlap = function uiOverlap() {
      overlapButton.textContent = hasOverlap ? removeText : setText;
      return hasOverlap ? 50 : 0;
    };
  });

  // Add a button which hides most of the links, changing the height of the affix instance.
  var hasAllLinks = true;
  var toggleLinkButton = document.getElementById('link-toggle');
  var relevantText = toggleLinkButton.textContent;
  var allText = toggleLinkButton.getAttribute('data-reset');
  toggleLinkButton.addEventListener('click', function () {
    hasAllLinks = !hasAllLinks;
    toggleLinkButton.textContent = hasAllLinks ? relevantText : allText;
    var irrelevantLinks = toggleLinkButton.parentNode.querySelectorAll('li:not(.relevant)');
    var display = hasAllLinks ? '' : 'none';

    for (var i = 0; i < irrelevantLinks.length; i++) {
      irrelevantLinks[i].style.display = display;
    }

    // Notify the instance that the height changed.
    affix2.update();
  });

  var mediaHandler = function mediaHandler(media) {
    if (media.matches && !affix) {
      affix = new OdoAffix(document.querySelector('.js-my-sidebar'));
    } else if (!media.matches && affix) {
      affix.dispose();
      affix = null;
    }
  };

  var query = window.matchMedia('(min-width: 768px)');
  query.addListener(mediaHandler);
  mediaHandler(query);

}());
