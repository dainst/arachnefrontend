'use strict';

/* Directives */

angular.module('arachne.directives', []).
	directive('imagesrow', function() {
		return {
			restrict: 'A',
			link: function (scope, elem, attrs) {
				var images = (angular.element(elem).find('img'));
				var counter = images.length
				var listener = function () {
					counter--;
					if (counter==0) {
						var scalingPercentage = 0, imagesWidth = 0;
						for (var i = images.length - 1; i >= 0; i--) {
							// 4 is padding of image
							imagesWidth += images[i].width;
						};
						// 30 is padding of container
						scalingPercentage = (elem.parent()[0].clientWidth-30) / (imagesWidth / 100);
						for (var i = images.length - 1; i >= 0; i--) {
							var newWidth =  (images[i].width/101)*scalingPercentage;
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
	// Parameters:
	// + imageId
	// + link
	// + placeholderIfEmpty
	// - arachneimagerequest
	// - arachneimageheight
	.directive('arachneimagerequest', function() {
  		return {
  			restrict: 'A',

    		link: function(scope, element, attrs) {
    			var newElement = '';
    			//DIRTY workaround for iterations on things that does not exsist, maybe
    			// handle tiles without data
    			if(attrs.isPlaceholderIfEmpty == "") {
    				newElement = '<span style="display:none"><img src="img/imagePlaceholder.png"></span>';
 				} else {
	       			if(attrs.imageid) {
	       				newElement = '<a href="'+attrs.link+'"><img src="http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/image/'+attrs.arachneimagerequest+'/'  + attrs.imageid + '?'  + attrs.arachneimagerequest + '=' + attrs.arachneimageheight + '"></a>';
	       			} else {
	       				newElement = '<a href="'+attrs.link+'"><img src="img/imagePlaceholder.png"></a>';
	       			}
	       		}
       			element.prepend(angular.element(newElement));
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
        	var markers = scope.searchresults.markers;	 
	        map.addLayer(markers);   
        }
    };
	})	
	.directive('zoomifyimg', function() {
    	return {
	        restrict: 'A',
	        link: function(scope, element, attrs) 
	        {
				/*
				 * L.TileLayer.Zoomify display Zoomify tiles with Leaflet
				 */
				L.TileLayer.Zoomify = L.TileLayer.extend({
					options: {
						continuousWorld: true,
						tolerance: 0.8
					},
					initialize: function (entityId, options) {
						options = L.setOptions(this, options);
						this._entityId = entityId;

				    	var imageSize = L.point(options.width, options.height),
					    	tileSize = options.tileSize;

				    	this._imageSize = [imageSize];
				    	this._gridSize = [this._getGridSize(imageSize)];

				        while (parseInt(imageSize.x) > tileSize || parseInt(imageSize.y) > tileSize) {
				        	imageSize = imageSize.divideBy(2).floor();
				        	this._imageSize.push(imageSize);
				        	this._gridSize.push(this._getGridSize(imageSize));
				        }

						this._imageSize.reverse();
						this._gridSize.reverse();

				        this.options.maxZoom = this._gridSize.length - 1;
				        var southWest = map.unproject([0, options.height], this.options.maxZoom);
						var northEast = map.unproject([options.width, 0], this.options.maxZoom);
						map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

					},
					onAdd: function (map) {
						L.TileLayer.prototype.onAdd.call(this, map);
						var mapSize = map.getSize(),
							zoom = this._getBestFitZoom(mapSize),
							imageSize = this._imageSize[zoom],
							center = map.options.crs.pointToLatLng(L.point(imageSize.x/2, imageSize.y/2), zoom);

						map.setView(center, zoom, true);
					},

					_getGridSize: function (imageSize) {
						var tileSize = this.options.tileSize;
						return L.point(Math.ceil(imageSize.x / tileSize), Math.ceil(imageSize.y / tileSize));
					},

					_getBestFitZoom: function (mapSize) {
						var tolerance = this.options.tolerance,
							zoom = this._imageSize.length - 1,
							imageSize, zoom;

						while (zoom) {
							imageSize = this._imageSize[zoom];
							if (imageSize.x * tolerance < mapSize.x && imageSize.y * tolerance < mapSize.y) {
								return zoom;
							}			
							zoom--;
						}

						return zoom;
					},

					_tileShouldBeLoaded: function (tilePoint) {
						var gridSize = this._gridSize[this._map.getZoom()];
						return (tilePoint.x >= 0 && tilePoint.x < gridSize.x && tilePoint.y >= 0 && tilePoint.y < gridSize.y);
					},

					_addTile: function (tilePoint, container) {
						var tilePos = this._getTilePos(tilePoint),
							tile = this._getTile(),
							zoom = this._map.getZoom(),
							imageSize = this._imageSize[zoom],
							gridSize = this._gridSize[zoom],
							tileSize = this.options.tileSize;

						if (tilePoint.x === gridSize.x - 1) {
							tile.style.width = imageSize.x - (tileSize * (gridSize.x - 1)) + 'px';
						} 

						if (tilePoint.y === gridSize.y - 1) {
							tile.style.height = imageSize.y - (tileSize * (gridSize.y - 1)) + 'px';			
						} 

						L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome || L.Browser.android23);

						this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;
						this._loadTile(tile, tilePoint);

						if (tile.parentNode !== this._tileContainer) {
							container.appendChild(tile);
						}
					},
					getTileUrl: function (tilePoint) {
						return 'http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/image/zoomify/' + this._entityId + '/' + this._map.getZoom() + '-' + tilePoint.x + '-' + tilePoint.y + '.jpg';
					},

					_getTileGroup: function (tilePoint) {
						var zoom = this._map.getZoom(),
							num = 0,
							gridSize;

						for (var z = 0; z < zoom; z++) {
							gridSize = this._gridSize[z];
							num += gridSize.x * gridSize.y; 
						}	

						num += tilePoint.y * this._gridSize[zoom].x + tilePoint.x;
				      	return Math.floor(num / 256);
					}

				});

				L.tileLayer.zoomify = function (entityId, options) {
					return new L.TileLayer.Zoomify(entityId, options);
				};
				var map = L.map(element[0]).setView([0,0], 0);
				L.tileLayer.zoomify(attrs.entityid, {
		    		width: scope.imageProperties.width,
		    		height: scope.imageProperties.height,
		    		tileSize : scope.imageProperties.tilesize,
		    		tolerance: 0.8
				}).addTo(map);

	        }
    	};
	});
