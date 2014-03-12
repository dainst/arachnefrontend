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
					console.log(this);
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
	.directive('arachneimagerequest', function() {
  		return {
  			restrict: 'A',
    		link: function(scope, element, attrs) {
    			var image = '';
       			if(attrs.arachneimageid) {
       				image = '<img src="http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/image/'+attrs.arachneimagerequest+'/'  + attrs.arachneimageid + '?'  + attrs.arachneimagerequest + '=' + attrs.arachneimageheight + '">';
       			} else {
       				image = '<img height="300" width="300" style="height:300px; width:300px; background-color:silver">';
       			}
       			element.append(angular.element(image));
    		}
  		}
	})
	.directive('map', function() {
    return {
        restrict: 'A',
        link: function(scope) 
        {
			var map = L.map('map').setView([40, -10], 3);

			var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		        maxZoom: 18
		    });
		    map.addLayer(layer);			
        	L.Icon.Default.imagePath = 'img';
        	var markers = scope.map.markers;	 
	        map.addLayer(markers);   
        }
    };
	});
