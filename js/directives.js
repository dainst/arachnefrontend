'use strict';

/* Directives */
angular.module('arachne.directives', []).
	directive('imagesrow', function($window) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {

				var width 				= element[0].clientWidth;
				var images 				= element[0].getElementsByTagName('img');
				var imagesLeftToLoad 	= images.length;

				var errorListener = function (e) {
					console.log(e)
					console.warn("loading error -- Bild konnte nicht geladen werden. Pfad: " + this.src);
					this.src="img/imagePlaceholder.png";
				}

				var listener = function () {

					if(imagesLeftToLoad != 0) imagesLeftToLoad--;
					

					// BREAK if there are any images left to be loaded
					if (imagesLeftToLoad != 0) return;

					var scalingPercentage = 0, imagesWidth = 0;
					for (var i = images.length - 1; i >= 0; i--) {

						if(images[i].naturalWidth == 0) {
							console.warn("naturalWidth  -- Bild hatte eine naturalWidth von 0. Pfad: " + images[i].src);
							images[i].src="img/imagePlaceholder.png";
						}

						imagesWidth += images[i].width;
					};
					// 30 is padding of container
					scalingPercentage = (element.parent()[0].clientWidth-30) / (imagesWidth / 100);

					for (var i = images.length - 1; i >= 0; i--) {
						if(scalingPercentage > 120) {
							// 4px is padding of image

							var newWidth =  (images[i].width/101)*120;
							var newOuterWidth =  (images[i].width/101)*scalingPercentage;
							images[i].parentNode.parentNode.style.width = newOuterWidth + "px";
							images[i].width = newWidth;
						} else {
							var newWidth =  (images[i].width/101)*scalingPercentage;
							images[i].parentNode.parentNode.style.width = newWidth + "px";
							images[i].width = newWidth;
						}
						images[i].style.display = 'block';
						images[i].removeEventListener("load", listener, false);
						images[i].removeEventListener("error", listener, false);
					};
					
				};
				

				// watching for element resizing
				// important for context modal, where the filter comes in from the side and resizes the content
				scope.$watch(function(){
					if(element[0].clientWidth != width) {
						width = element[0].clientWidth;
						listener()		
					}
				});

				// watching for window resizing
				// important for the restults
				angular.element($window).bind('resize', function() {
					listener()
				});
				

				for (var i = images.length - 1; i >= 0; i--) {
					images[i].addEventListener(
						"load",
						listener,
						false);
					//images[i].setAttribute('onload',listener())
					// images[i].onload = listener();
					images[i].addEventListener(
						"error",
						errorListener,
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
	.directive('arachneimagerequest', ['arachneSettings', function(arachneSettings) {
		return {
			restrict: 'A',



			link: function(scope, element, attrs) {
				var newElement = '';
				//DIRTY workaround for iterations on things that does not exsist, maybe
				// handle tiles without data
				if(attrs.isPlaceholderIfEmpty == "") {
					newElement = '<span style="display:none"><img src="img/imagePlaceholder.png"></span>';
				} else {
					if (attrs.link) {
						if(attrs.imageid) {
							newElement = '<a href=\''+attrs.link+'\'><img src="'+arachneSettings.dataserviceUri+'/image/'+attrs.arachneimagerequest+'/'  + attrs.imageid + '?'  + attrs.arachneimagerequest + '=' + attrs.arachneimageheight + '"></a>';
						} else {
							newElement = '<a href=\''+attrs.link+'\'><img src="img/imagePlaceholder.png"></a>';
						}
					} else {
						newElement = '<span><img src="'+arachneSettings.dataserviceUri+'/image/'+attrs.arachneimagerequest+'/'  + attrs.imageid + '?'  + attrs.arachneimagerequest + '=' + attrs.arachneimageheight + '"></span>';
					}
				}
				element.prepend(angular.element(newElement));
			}
		}
	}])



	.directive('threedimensional', ['$window', '$q', function ($window, $q) {
		return {
		
			restrict: 'A',
			
			link: function (scope, element, attrs) { // function content is optional
				// in this example, it shows how and when the promises are resolved
				var load_script = function() {
					var paths = [
						"lib/3d/three.js/three.min.js",
						"lib/3d/three.js/Detector.js",
						"lib/3d/three.js/controls/ArachneTrackballControls.js",
						"lib/3d/three.js/controls/ArachneFirstPersonControls.js",
						"lib/3d/three.js/loaders/ArachneOBJLoader.js",
						"lib/3d/three.js/loaders/ArachneMTLLoader.js",        
						"lib/3d/three.js/loaders/ArachneOBJMTLLoader.js",
						"lib/3d/three.js/loaders/ArachneSTLLoader.js",
						//"lib/3d/three.js/Stats.js",        
						"lib/3d/threex/THREEx.screenshot.js",
						"lib/3d/threex/THREEx.FullScreen.js",
						//"lib/3d/libs/heartcode-canvasloader-min.js",
						//"lib/3d/libs/dat.gui.min.js",
						"lib/3d/viewer.js"
					];

					var pathsCount = paths.length
					var loadingIndex = 0;

					var listener = function () {
						loadingIndex++;
						if(loadingIndex<pathsCount) {
							var scriptTag = document.createElement('script'); // use global document since Angular's $document is weak
							scriptTag.src = paths[loadingIndex];
							document.body.appendChild(scriptTag);

							scriptTag.addEventListener('load', listener, false);
						} else {
							initialize();
						}
					}

					var newScriptTag = document.createElement('script'); // use global document since Angular's $document is weak
					newScriptTag.src = paths[loadingIndex];
					document.body.appendChild(newScriptTag);
					newScriptTag.addEventListener('load', listener, false);
				};
				
				var lazyLoadApi = function(key) {

					var deferred = $q.defer();
					$window.initialize = function () {
						deferred.resolve();
					};
					// thanks to Emil Stenström: http://friendlybit.com/js/lazy-loading-asyncronous-javascript/
					if ($window.attachEvent) {
						$window.attachEvent('onload', load_script);
					} else {
						if (document.readyState === "complete") {
							load_script();
						} else {
							$window.addEventListener('load', load_script, false);
						}
						
					}

					return deferred.promise;
				};


				if ($window.THREE) {
					console.log('lazyloading-libs: libs ALREADY loaded');
					init();
				} else {
					lazyLoadApi().then(function () {
						console.log('lazyloading-libs: promise resolved');
						if ($window.THREE) {
							console.log('lazyloading-libs:  loaded');
						} else {
							console.log('lazyloading-libs:  not loaded');
						}
					}, function () {
						console.log('lazyloading-libs: promise rejected');
					});
				}
			}
		}
	}])


	.directive('map', ['$location', function($location) {
	return {
		restrict: 'A',
		scope: {
			searchresults: '=',
			entities: '=',
			locationfacetname: '='
		},
		link: function(scope, element, attrs) 
		{	
			
			var createMarkers = function(facet_values){

				markerClusterGroup = new L.MarkerClusterGroup(
				{
					iconCreateFunction: function(cluster) {

						var markers = cluster.getAllChildMarkers();
						var entityCount = 0;
						for (var i = 0; i < markers.length; i++) {
							entityCount += markers[i].options.entityCount;
						}

						var childCount = cluster.getChildCount();

						var c = ' marker-cluster-';
						if (childCount < 10) {
							c += 'small';
						} else if (childCount < 100) {
							c += 'medium';
						} else {
							c += 'large';
						}

						return new L.DivIcon({ html: '<div><span>' + entityCount+ ' at ' + childCount + ' Places</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
					}
				});

				var facet_values_count = facet_values.length;
				for (var i = facet_values_count - 1; i >= 0; i--) {

					var facetValue = facet_values[i];

					var coordsString = facetValue.value.substring(facetValue.value.indexOf("[", 1)+1, facetValue.value.length - 1);
					var coords = coordsString.split(',');
					var title = "<b>" + facetValue.value.substring(0, facetValue.value.indexOf("[", 1)-1) + "</b><br/>";
					// Popup-Title auf Karte für Suchergebnis
					if (facet_values_count > 1) {
					
						title += "Einträge, <b>insgeamt</b>: " + facetValue.count + "<br>";
						if($location.$$search.fq) {
							title += "<a href='search?q=*&fq="+$location.$$search.fq+","+scope.locationfacetname+":\"" + facetValue.value +  "\"'>Diese Einträge anzeigen</a>";
						} else {
							title += "<a href='search?q=*&fq="+scope.locationfacetname+":\"" + facetValue.value +  "\"'>Diese Einträge anzeigen</a>";
						}
					// Popup-Title auf Karte für einzelnen Datensatz
					} else {
						var locationFacetNameHumanized = scope.locationfacetname.split('_')[1];
						locationFacetNameHumanized = locationFacetNameHumanized.charAt(0).toUpperCase() + locationFacetNameHumanized.slice(1);
						title = '<h4 class="text-info centered">' + locationFacetNameHumanized +  '</h4>' + title;
					}
					
					var marker = L.marker(new L.LatLng(coords[0], coords[1]), { title: title, entityCount : facetValue.count });
					marker.bindPopup(title);
					markerClusterGroup.addLayer(marker);
				}

				// karte auf marker fixieren, wenn es nur ein marker (also wahrscheinlich einzeldatensatz) ist
				if(facet_values_count == 1) {
					var facetValue = facet_values[0];
					var coordsString = facetValue.value.substring(facetValue.value.indexOf("[", 1)+1, facetValue.value.length - 1);
					var coords = coordsString.split(',');
					map.setView(coords, 6);
					
				}
				map.addLayer(markerClusterGroup);

				map.invalidateSize();
			}


			var selectFacetsAndCreateMarkers = function () {
				if(scope.searchresults)
				{
					for (var i = scope.searchresults.facets.length - 1; i >= 0; i--) {
						if(scope.searchresults.facets[i].name === scope.locationfacetname) {
							createMarkers(scope.searchresults.facets[i].values);
							break;
						}
					};
				}

				
				if(scope.entities)
				{
					var facet_geo = Array();
					for (var i = scope.entities.length - 1; i >= 0; i--) {

						facet_geo.push({value: scope.entities[i][scope.locationfacetname][0], count: 1});
					}
					createMarkers(facet_geo);
				}
			}


			var map = L.map('map').setView([40, -10], 3);

			//der layer mit markern (muss beim locationtype entfernt und neu erzeugt werden)
			var markerClusterGroup = null;

			var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				maxZoom: 18
			});
			map.addLayer(layer);			
			L.Icon.Default.imagePath = 'img';

			// der user kann den typ der orts-facette ändern! Watch for it baby
			scope.$watch(
				function() {
					return scope.locationfacetname;
				},
				function(newValue, oldValue){
					if(newValue != oldValue) {
						scope.locationfacetname = newValue;
						map.removeLayer(markerClusterGroup);
						selectFacetsAndCreateMarkers();
					}
				}
			);

			selectFacetsAndCreateMarkers();

		}
	};
	}])	
	.directive('zoomifyimg', ['arachneSettings', function(arachneSettings) {
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
						return arachneSettings.dataserviceUri + '/image/zoomify/' + this._entityId + '/' + this._map.getZoom() + '-' + tilePoint.x + '-' + tilePoint.y + '.jpg';
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
	}]);
