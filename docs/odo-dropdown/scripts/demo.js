(function () {
'use strict';

var OdoDropdown = window.OdoDropdown;

var example = new OdoDropdown(document.getElementById('demo-1'));
var watcher = document.getElementsByClassName('watcher')[0];

watcher.textContent = example.value;

example.on(OdoDropdown.EventType.CHANGE, function (data) {
  watcher.textContent = data.value;
});

var example2 = new OdoDropdown(document.getElementById('demo-2'));
var example3 = new OdoDropdown(document.getElementById('demo-3'));
var example4 = new OdoDropdown(document.getElementById('demo-4'));

// Export to window to play with in the console.
window.dropdown = example;
window.example2 = example2;
window.example3 = example3;
window.example4 = example4;

}());
