'use strict';

/* Directives */


angular.module('arachne.directives', []).
	directive('imagesrow', function() {


		return {
			restrict: 'A',
			link: function (scope, elem, attrs) {
				var counter = 5;
				var images = (angular.element(elem).find('img'));
				
				var listener = function () {
					counter--;
					if (counter==0) {
						var scalingPercentage = 0, imagesWidth = 0;
						for (var i = images.length - 1; i >= 0; i--) {
							// 4 is padding of image
							imagesWidth += images[i].width+4;
						};
						// 30 is padding of container
						scalingPercentage = (document.getElementById("tiledImagesContainer").offsetWidth-30) / (imagesWidth / 100);
						for (var i = images.length - 1; i >= 0; i--) {
							images[i].width = (images[i].width/102)*scalingPercentage;
							images[i].removeEventListener("load", listener, false);
						};
					};

				};

				for (var i = images.length - 1; i >= 0; i--) {
					images[i].addEventListener(
						"load",
						listener,
						false);
				}
			}
		}

	})
	.directive('errSrc', function() {
  		return {
    		link: function(scope, element, attrs) {
     			element.bind('error', function() {
       				element.attr('src', attrs.errSrc);
      			});
    		}
  		}
	});