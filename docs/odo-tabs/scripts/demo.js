(function () {
  'use strict';

  var OdoTabs = window.OdoTabs;

  window.tabs = new OdoTabs(document.getElementById('tabs-demo'));
  window.hashes = new OdoTabs(document.getElementById('hash-demo'));

  document.getElementById('animations').addEventListener('change', function (evt) {
    var element = document.getElementById('tabs-demo');
    var value = evt.target.value;

    element.classList.remove('odo-tabs--zoom-in', 'odo-tabs--slide', 'odo-tabs--zoom-out');

    if (value !== 'fade') {
      element.classList.add('odo-tabs--' + value);
    }
  }, false);

}());
