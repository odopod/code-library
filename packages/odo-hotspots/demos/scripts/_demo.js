const OdoHotspots = window.OdoHotspots;

let hotspots = new OdoHotspots(document.getElementById('basic-hotspots'));

hotspots.on(OdoHotspots.EventType.WILL_OPEN, (data) => {
  const hotspot = data.hotspot;
  console.log(hotspot);

  // Prevent hotspot from opening.
  // data.preventDefault();
}, false);


// Animation switcher.
const animations = document.getElementById('animations');
const animationOptions = Array.from(animations.children);
const animationBase = 'odo-hotspots--';
animations.addEventListener('change', (evt) => {
  const element = document.getElementById('basic-hotspots');
  const value = evt.target.value;

  animationOptions.forEach((option) => {
    element.classList.remove(animationBase + option.value);
  });

  if (value) {
    element.classList.add(animationBase + value);
  }

  hotspots.refresh();
}, false);

// Randomize hotspot placement.
document.getElementById('randomize').addEventListener('click', () => {
  hotspots.dispose();

  const spots = Array.from(document.querySelectorAll('#basic-hotspots .odo-hotspot'));

  spots[spots.length - 1].classList.remove(OdoHotspots.ClassName.HOTSPOT_LEFT);
  spots[spots.length - 1].classList.remove(OdoHotspots.ClassName.HOTSPOT_BOTTOM);

  spots.forEach((element) => {
    const x = (Math.random() * 90 + 5).toFixed(2);
    const y = (Math.random() * 86 + 7).toFixed(2);
    element.setAttribute('data-position', x + ',' + y);
  });

  hotspots = new OdoHotspots(document.getElementById('basic-hotspots'));
});
