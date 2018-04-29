(function () {
  'use strict';

  var OdoVideo = window.OdoVideo;

  window.player = new OdoVideo(document.querySelector('#video-wrapper'));

  window.player.autoplay.then(function (canAutoplay) {
    if (canAutoplay) {
      console.log('Can autoplay');
    } else {
      console.log('Cannot autoplay');
    }
  });

  window.stacked = new OdoVideo(document.getElementById('stacked'), {
    controls: OdoVideo.Controls.STACKED_PROGRESS
  });

  // Style switcher.
  var styles = document.getElementById('styles');
  var styleOptions = Array.from(styles.children);
  var styleBase = 'odo-video--';
  styles.addEventListener('change', function (evt) {
    var element = document.getElementById('video-wrapper');
    var value = evt.target.value;

    styleOptions.forEach(function (option) {
      var classes = option.value.split(',');
      classes.forEach(function (className) {
        element.classList.remove(styleBase + className);
      });
    });

    if (value) {
      var classes = value.split(',');
      classes.forEach(function (className) {
        element.classList.add(styleBase + className);
      });
    }
  }, false);

}());
