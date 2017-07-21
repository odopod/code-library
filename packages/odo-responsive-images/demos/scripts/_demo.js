const OdoResponsiveImages = window.OdoResponsiveImages;
OdoResponsiveImages.initialize();

const carouselElement = document.querySelector('.fake-carousel__element');

let currentIndex = 0;
document.querySelector('.fake-carousel__next').addEventListener('click', () => {
  if (currentIndex === 3) {
    return;
  }

  currentIndex += 1;
  const percent = currentIndex * -5;
  carouselElement.style.transform = 'translateX(' + percent + '%)';
  OdoResponsiveImages.updateOffsets();
});

document.querySelector('.fake-carousel__previous').addEventListener('click', () => {
  if (currentIndex === 0) {
    return;
  }

  currentIndex -= 1;
  const percent = currentIndex * -5;
  carouselElement.style.transform = 'translateX(' + percent + '%)';
  OdoResponsiveImages.updateOffsets();
});

/*
Remove the first image
var img = document.querySelector('.odo-responsive-img');
OdoResponsiveImages.remove(img);
img.parentNode.removeChild(img);
*/
