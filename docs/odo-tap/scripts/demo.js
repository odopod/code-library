(function () {
'use strict';

var OdoTap = window.OdoTap;

function handler(evt) {
  evt.currentTarget.classList.toggle('active');
}

OdoTap.addListener(document.getElementById('the-tap-button'), handler);
OdoTap.addListener(document.getElementById('the-tap-div'), handler);
OdoTap.addListener(document.getElementById('the-tap-link'), handler, true);

// Click listener for comparison.
document.getElementById('the-click-button').addEventListener('click', handler);
document.getElementById('the-click-div').addEventListener('click', handler);
document.getElementById('the-click-link').addEventListener('click', function (evt) {
  evt.preventDefault();
  handler(evt);
});

}());
