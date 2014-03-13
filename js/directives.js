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
							var newWidth =  (images[i].width/102)*scalingPercentage;
							images[i].width = newWidth;
							images[i].style.display = 'block';

							images[i].parentNode.parentNode.style.width = newWidth + "px";
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
  			scope: {
      			entity: '=',
    		},
    		link: function(scope, element, attrs) {
    			var image = '';
       			if(scope.entity.thumbnailId) {
       				image = '<a href="entity/'+scope.entity.entityId+'"><img src="http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/image/'+attrs.arachneimagerequest+'/'  + scope.entity.thumbnailId + '?'  + attrs.arachneimagerequest + '=' + attrs.arachneimageheight + '"></a><p><small>' + scope.entity.title+ '</small></p>';
       			} else {
       				image = '<a href="entity/'+scope.entity.entityId+'"><img src="img/imagePlaceholder.png"></a><p><small>' + scope.entity.title+ '</small></p>';
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
