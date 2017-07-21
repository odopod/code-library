(function () {
'use strict';

var OdoResponsiveImages = window.OdoResponsiveImages;
OdoResponsiveImages.initialize();

var carouselElement = document.querySelector('.fake-carousel__element');

var currentIndex = 0;
document.querySelector('.fake-carousel__next').addEventListener('click', function () {
  if (currentIndex === 3) {
    return;
  }

  currentIndex += 1;
  var percent = currentIndex * -5;
  carouselElement.style.transform = 'translateX(' + percent + '%)';
  OdoResponsiveImages.updateOffsets();
});

document.querySelector('.fake-carousel__previous').addEventListener('click', function () {
  if (currentIndex === 0) {
    return;
  }

  currentIndex -= 1;
  var percent = currentIndex * -5;
  carouselElement.style.transform = 'translateX(' + percent + '%)';
  OdoResponsiveImages.updateOffsets();
});

/*
Remove the first image
var img = document.querySelector('.odo-responsive-img');
OdoResponsiveImages.remove(img);
img.parentNode.removeChild(img);
*/

}());
