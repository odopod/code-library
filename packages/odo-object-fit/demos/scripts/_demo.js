const OdoObjectFit = window.OdoObjectFit;

OdoObjectFit.cover(document.getElementById('my-cover'));

OdoObjectFit.cover(document.querySelectorAll('.coveralls'));

OdoObjectFit.contain(document.querySelectorAll('.my-contain'));

window.addEventListener('resize', () => {
  OdoObjectFit.cover(document.getElementById('my-cover'));
  OdoObjectFit.cover(document.querySelectorAll('.coveralls'));
  OdoObjectFit.contain(document.querySelectorAll('.my-contain'));
});

window.addEventListener('load', () => {
  const images = document.querySelectorAll('img[data-src]');
  for (let i = 0; i < images.length; i++) {
    images[i].src = images[i].getAttribute('data-src');
    images[i].removeAttribute('data-src');
  }
});

if (document.createElement('div').style.objectFit === '') {
  const replacers = document.querySelectorAll('[data-support]');
  Array.from(replacers).forEach((element) => {
    element.textContent = element.getAttribute('data-support');
    element.setAttribute('supports-object-fit', true);
  });
}
