(function () {
  'use strict';

  var OdoHotspots = window.OdoHotspots;

  var hotspots = new OdoHotspots(document.getElementById('basic-hotspots'));

  hotspots.on(OdoHotspots.EventType.WILL_OPEN, function (data) {
    var hotspot = data.hotspot;
    console.log(hotspot);

    // Prevent hotspot from opening.
    // data.preventDefault();
  }, false);

  // Animation switcher.
  var animations = document.getElementById('animations');
  var animationOptions = Array.from(animations.children);
  var animationBase = 'odo-hotspots--';
  animations.addEventListener('change', function (evt) {
    var element = document.getElementById('basic-hotspots');
    var value = evt.target.value;

    animationOptions.forEach(function (option) {
      element.classList.remove(animationBase + option.value);
    });

    if (value) {
      element.classList.add(animationBase + value);
    }

    hotspots.refresh();
  }, false);

  // Randomize hotspot placement.
  document.getElementById('randomize').addEventListener('click', function () {
    hotspots.dispose();

    var spots = Array.from(document.querySelectorAll('#basic-hotspots .odo-hotspot'));

    spots[spots.length - 1].classList.remove(OdoHotspots.ClassName.HOTSPOT_LEFT);
    spots[spots.length - 1].classList.remove(OdoHotspots.ClassName.HOTSPOT_BOTTOM);

    spots.forEach(function (element) {
      var x = (Math.random() * 90 + 5).toFixed(2);
      var y = (Math.random() * 86 + 7).toFixed(2);
      element.setAttribute('data-position', x + ',' + y);
    });

    hotspots = new OdoHotspots(document.getElementById('basic-hotspots'));
  });

}());
