(function () {
'use strict';

var ScrollAnimation = window.OdoScrollAnimation;

function update(scrollTop) {
  document.getElementById('scroll-top-target').innerHTML = scrollTop;
}

var scrollId = ScrollAnimation.add(update);

var scrollElement = document.getElementById('scroller-thing');
var id = ScrollAnimation.add(scrollElement, function (scrollTop) {
  document.getElementById('scroller-thing-target').innerHTML = scrollTop;
});

}());
