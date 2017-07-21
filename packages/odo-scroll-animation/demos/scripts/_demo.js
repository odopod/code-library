const ScrollAnimation = window.OdoScrollAnimation;

function update(scrollTop) {
  document.getElementById('scroll-top-target').innerHTML = scrollTop;
}

const scrollId = ScrollAnimation.add(update);

const scrollElement = document.getElementById('scroller-thing');
const id = ScrollAnimation.add(scrollElement, (scrollTop) => {
  document.getElementById('scroller-thing-target').innerHTML = scrollTop;
});
