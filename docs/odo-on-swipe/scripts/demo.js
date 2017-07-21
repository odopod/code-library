(function () {
'use strict';

var OdoOnSwipe = window.OdoOnSwipe;

/**
* On Swipe handler.
* @param {PointerEvent} event Pointer event object.
*/
var swiped = function swiped(event) {
  console.log(event);
  event.currentTarget.querySelector('span').textContent = 'Swiped ' + event.direction;
};

Array.from(document.querySelectorAll('.js-on-swipe')).forEach(function (element) {
  new OdoOnSwipe(element, swiped, element.getAttribute('data-axis'));
});

}());
