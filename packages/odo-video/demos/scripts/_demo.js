const OdoVideo = window.OdoVideo;

window.player = new OdoVideo(document.querySelector('#video-wrapper'));

window.player.autoplay.then((canAutoplay) => {
  if (canAutoplay) {
    console.log('Can autoplay');
  } else {
    console.log('Cannot autoplay');
  }
});

window.stacked = new OdoVideo(document.getElementById('stacked'), {
  controls: OdoVideo.Controls.STACKED_PROGRESS,
});

// Style switcher.
const styles = document.getElementById('styles');
const styleOptions = Array.from(styles.children);
const styleBase = 'odo-video--';
styles.addEventListener('change', (evt) => {
  const element = document.getElementById('video-wrapper');
  const value = evt.target.value;

  styleOptions.forEach((option) => {
    const classes = option.value.split(',');
    classes.forEach((className) => {
      element.classList.remove(styleBase + className);
    });
  });

  if (value) {
    const classes = value.split(',');
    classes.forEach((className) => {
      element.classList.add(styleBase + className);
    });
  }
}, false);
