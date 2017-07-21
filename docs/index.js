/* eslint-disable */

(function (Shuffle) {
  'use strict';

  var ComponentGrid = function (element) {
    this.element = element;
    this.grid = this.element.querySelector('.odo-components');

    var isIE9or10 = document.all && document.addEventListener;
    if (!isIE9or10) {
      this.init();
    }
  };

  ComponentGrid.prototype.init = function () {
    this.shuffle = new Shuffle(this.grid, {
      itemSelector: '.odo-component',
      sizer: '.shuffle-sizer',
      staggerAmount: 10,
      staggerAmountMax: 100,
    });

    // Setup searching.
    this.element.querySelector('.js-shuffle-search')
      .addEventListener('input', this._handleInput.bind(this));

    // Filters
    var filterButtons = this.element.querySelectorAll('.filter__button');
    var listener = this._handleFilterButtonClick.bind(this);
    for (var i = 0; i < filterButtons.length; i++) {
      filterButtons[i].addEventListener('click', listener);
    }

    // Focus the search input when you press "/"
    document.addEventListener('keydown', this._handleHotkey.bind(this));
  };

  ComponentGrid.prototype._handleInput = function (evt) {
    this.filterByText(evt.target.value.toLowerCase());
  };

  ComponentGrid.prototype.filterByText = function (text) {
    this.shuffle.filter(function (element, shuffle) {

      // If there is a current filter applied, ignore elements that don't match it.
      if (shuffle.group !== Shuffle.ALL_ITEMS) {
        // Get the item's groups.
        var groups = JSON.parse(element.getAttribute('data-groups'));
        var isElementInCurrentGroup = groups.indexOf(shuffle.group) !== -1;

        // Only search elements in the current group
        if (!isElementInCurrentGroup) {
          return false;
        }
      }

      var titleElement = element.querySelector('.odo-component__title');
      var titleText = titleElement.textContent.toLowerCase().trim();

      return titleText.indexOf(text) !== -1;
    });
  };

  ComponentGrid.prototype._handleFilterButtonClick = function (evt) {
    var btn = evt.target;
    var isActive = btn.classList.contains('filter__button--active');
    var group = isActive ? 'all' : btn.getAttribute('data-group');

    // Hide current label, show current label in title
    if (!isActive) {
      var buttons = btn.parentNode.children;
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('filter__button--active');
      }
    }

    btn.classList.toggle('filter__button--active', !isActive);

    // Filter elements
    this.shuffle.filter(group);
  };

  ComponentGrid.prototype._handleHotkey = function (evt) {
    var searchEl = this.element.querySelector('.js-shuffle-search');
    if (document.activeElement !== searchEl && evt.which === 191) {
      // Delayed because focusing immediately will make "/" appear in the input.
      setTimeout(function () {
        searchEl.focus();
      }, 100);
    }
  };

  var instance = new ComponentGrid(document.querySelector('.components-container'));

  window.addEventListener('load', function () {
    // Coming back to the page via the "back" button will leave text in the search input.
    let searchEl = document.querySelector('.js-shuffle-search');
    if (searchEl.value) {
      instance.filterByText(searchEl.value);
    } else {
      instance.shuffle.layout();
    }
  });

})(window.Shuffle);
