const OdoOnSwipe = window.OdoOnSwipe;

/**
* On Swipe handler.
* @param {PointerEvent} event Pointer event object.
*/
const swiped = function (event) {
  console.log(event);
  event.currentTarget.querySelector('span').textContent = 'Swiped ' + event.direction;
};

Array.from(document.querySelectorAll('.js-on-swipe')).forEach((element) => {
  new OdoOnSwipe(element, swiped, element.getAttribute('data-axis'));
});
