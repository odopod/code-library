(function () {
	'use strict';

	var _window = window,
	    OdoReveal = _window.OdoReveal,
	    OdoResponsiveImages = _window.OdoResponsiveImages;


	OdoResponsiveImages.initialize();

	var instances = OdoReveal.initializeAll();
	console.log(instances);

}());
