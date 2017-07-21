(function () {
'use strict';

var OdoObjectFit = window.OdoObjectFit;

OdoObjectFit.cover(document.getElementById('my-cover'));

OdoObjectFit.cover(document.querySelectorAll('.coveralls'));

OdoObjectFit.contain(document.querySelectorAll('.my-contain'));

window.addEventListener('resize', function () {
  OdoObjectFit.cover(document.getElementById('my-cover'));
  OdoObjectFit.cover(document.querySelectorAll('.coveralls'));
  OdoObjectFit.contain(document.querySelectorAll('.my-contain'));
});

window.addEventListener('load', function () {
  var images = document.querySelectorAll('img[data-src]');
  for (var i = 0; i < images.length; i++) {
    images[i].src = images[i].getAttribute('data-src');
    images[i].removeAttribute('data-src');
  }
});

if (document.createElement('div').style.objectFit === '') {
  var replacers = document.querySelectorAll('[data-support]');
  Array.from(replacers).forEach(function (element) {
    element.textContent = element.getAttribute('data-support');
    element.setAttribute('supports-object-fit', true);
  });
}

}());
