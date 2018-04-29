(function () {
  'use strict';

  var OdoWindowEvents = window.OdoWindowEvents;

  var output1 = document.getElementById('output1');
  var output2 = document.getElementById('output2');
  var output3 = document.getElementById('output3');
  var output4 = document.getElementById('output4');

  var scrolls = 0;
  OdoWindowEvents.onScroll(function () {
    scrolls += 1;
    output1.innerHTML = scrolls;
  });

  var fastScrolls = 0;
  OdoWindowEvents.onFastScroll(function () {
    fastScrolls += 1;
    output2.innerHTML = fastScrolls;
  });

  var resizes = 0;
  OdoWindowEvents.onResize(function () {
    resizes += 1;
    output3.innerHTML = resizes;
  });

  var leadingResizes = 0;
  OdoWindowEvents.onLeadingResize(function () {
    leadingResizes += 1;
    output4.innerHTML = leadingResizes;
  });

}());
