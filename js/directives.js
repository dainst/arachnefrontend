'use strict';

/* Directives */
angular.module('arachne.directives', [])

	.directive('arImg', ['arachneSettings', '$http', function(arachneSettings, $http) {
		return {
			scope: {
				imgId: '@',
				imgWidth: '@',
				imgHeight: '@'
			},
			restrict: 'A',
			link: function(scope, element, attrs) {

				if (element[0].tagName== 'IMG') {
					var img = element[0];
					var imgUri = arachneSettings.dataserviceUri + "/image/";
					if (scope.imgWidth) {
						imgUri += "width/" + scope.imgId + "?width=" + scope.imgWidth;
					} else {
						imgUri += "height/" + scope.imgId + "?height=" + scope.imgHeight;
					}
					$http.get(imgUri, { responseType: 'arraybuffer' })
						.success(function(data) {
							var blob = new Blob([data], {type: 'image/jpeg'});
            				img.src = window.URL.createObjectURL(blob);
						}
					);
				} else {
					console.log("Warning: ar-img directive used on a non img element!");
				}

			}
		}
	}])

	.directive('arImagegrid', ['arachneSettings', '$http', '$sce', '$window', function(arachneSettings, $http, $sce, $window) {
		return {
			scope: {
				cells: '=',
				columns: '@',
				margin: '@'
			},
			templateUrl: 'partials/directives/ar-imagegrid.html',
			
			link: function(scope, element, attrs) {

				scope.loadImage = function(cell) {
        			cell.img = new Image();
					cell.img.addEventListener("load", function() {
						// custom event handlers need to be wrapped in $apply
						scope.$apply(function() {
							cell.complete = true;
							scope.resizeRow(cell.row);
						});
					});
					cell.img.addEventListener("error", function() {
						scope.$apply(function() {
							cell.complete = true;
							cell.img = scope.placeholder;
							scope.resizeRow(cell.row);
						});
					});
					$http.get(cell.imgUri, { responseType: 'blob' })
						.success(function(data) {
							var blob = new Blob([data], {type: 'image/jpeg'});
            				cell.img.src = window.URL.createObjectURL(blob);
						}
					);
				};

				scope.resizeRow = function(row) {

					// only resize if every cell in the row is complete
					for (var i=0; i < row.length; i++) {
						if(!row[i].complete) return;
					}

					row.complete = true;
					for (var i = 0; i < scope.grid.length; i++) {
						if (!scope.grid[i].complete) break;
						scope.complete = true;
					}

					var imagesWidth = 0;
					var maxHeight = 0;

					for (var i=0; i < row.length; i++) {
						imagesWidth += row[i].img.naturalWidth;
					}

					var columns = scope.columns;
					var totalWidth = element[0].clientWidth - 1;
					totalWidth -= columns * scope.margin * 2;
					// fill rows with fewer columns
					if (row.length < columns) {
						imagesWidth += (columns - row.length) * (totalWidth / columns)
					}
					var scalingFactor = totalWidth / imagesWidth;

					for (var i=0; i < row.length; i++) {
						row[i].width = row[i].img.naturalWidth * scalingFactor;
						if (scalingFactor > 1) {
							row[i].imgWidth = row[i].img.naturalWidth;
						} else {
							row[i].imgWidth = row[i].width;
						}
						var height;
						if (scalingFactor > 1) {
							height = row[i].img.naturalHeight;
						} else {
							height = row[i].img.naturalHeight * scalingFactor;
						}
						if (height > maxHeight) maxHeight = height;
					}

					for (var i=0; i < row.length; i++) {
						row[i].height = maxHeight;
					}

				};

				angular.element($window).bind('resize', function() {
					scope.$apply(function() {
						scope.complete = false;
						for (var i = 0; i < scope.grid.length; i++) {
							var row = scope.grid[i];
							row.complete = false;
							scope.resizeRow(row);
						}
					});
				});

			},

			controller: function($scope) {

				$scope.placeholder = new Image();
				$scope.placeholder.src = 'img/imagePlaceholder.png';
				$scope.complete = false;

				$scope.$watch('cells', function(newCells, oldCells) {

					if (typeof newCells == 'undefined' || !newCells) return;

					var columns = $scope.columns;
					var rows = Math.ceil($scope.cells.length / columns);
					$scope.grid = new Array(rows);
					for (var i = 0; i < rows; i++) {
						$scope.grid[i] = new Array(columns);
						for (var k = 0; k < columns; k++) {
							if (i*columns+k >= $scope.cells.length) break;
							var index = i * columns + k;
							var cell = $scope.cells[index];
							$scope.grid[i][k] = cell;
							cell.row = $scope.grid[i];
							$scope.grid[i].complete = false;
							if (typeof cell.imgUri == 'undefined') {
								cell.imgUri = $scope.placeholder.src;
							}
							$scope.loadImage(cell);
						}
					}
					
				});
			
			}
		}
	}])

	.directive('arImagegridCell', ['$sce', function($sce) {
		return {
			scope: {
				href: '@', img: '=', cellTitle: '@', cellSubtitle: '@', imgUri: '@',
				cellWidth: '@', imgWidth: '@', cellHeight: '@', cellMargin: '@'
			},
			templateUrl: 'partials/directives/ar-imagegrid-cell.html'
		}
	}])

	.directive('arActiveFacets', function() {
		return {
			scope: { route: '@', currentQuery: '=' },
			templateUrl: 'partials/directives/ar-active-facets.html'
		}
	})

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
			facets: '=',
			entities: '=',
			currentQuery: '=',
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
				
				// dirty hack: wenn nur ein marker da ist brauchen wir eine referenz um später sein popup zu öffnen
				// (!) todo: wenn du ein marker gemacht werden soll (also bei einzelnen Datensätzen) dann sollte kein clustering benutzt werden. 
				if(facet_values_count == 1) {
					var singleMarker = {};
				}

				for (var i = facet_values_count - 1; i >= 0; i--) {

					var facetValue = facet_values[i];

					var coordsString = facetValue.value.substring(facetValue.value.indexOf("[", 1)+1, facetValue.value.length - 1);
					var coords = coordsString.split(',');
					var title = "<b>" + facetValue.value.substring(0, facetValue.value.indexOf("[", 1)) + "</b><br/>";
					var text = facetValue.value.substring(0, facetValue.value.indexOf("[", 1)) + " ";
					// Popup-Title auf Karte für Suchergebnis
					if (facetValue.count > 1) {
					
						var locationFacetNameHumanized = scope.locationfacetname.split('_')[1];
						locationFacetNameHumanized = locationFacetNameHumanized.charAt(0).toUpperCase() + locationFacetNameHumanized.slice(1);
						title = '<h4 class="text-info centered">' + locationFacetNameHumanized +  '</h4>' + title;
						title += "Insgesamt " + facetValue.count + " Einträge<br>";
						text = locationFacetNameHumanized  +": " + text;
						text += "Insgesamt " + facetValue.count + " Einträge ";
						title += "<a href='search/" + scope.currentQuery.addFacet(scope.locationfacetname,facetValue.value).toString() + "'>Diese Einträge anzeigen</a>";

					// Popup-Title auf Karte für einzelnen Datensatz
					} else {
						var locationFacetNameHumanized = scope.locationfacetname.split('_')[1];
						locationFacetNameHumanized = locationFacetNameHumanized.charAt(0).toUpperCase() + locationFacetNameHumanized.slice(1);
						text = locationFacetNameHumanized  +": " + text;
						title = '<h4 class="text-info centered">' + locationFacetNameHumanized +  '</h4>' + title;
						title += "<a href='search/" + scope.currentQuery.addFacet(scope.locationfacetname,facetValue.value).toString() + "'>Diesen Eintrag anzeigen</a>";
					}
					
					var marker = L.marker(new L.LatLng(coords[0], coords[1]), { title: text, entityCount : facetValue.count });
					marker.bindPopup(title);
					markerClusterGroup.addLayer(marker);

					// dirty hack, referenz auf marker wenn es für einen einzelnen DS ist
					if(facet_values_count == 1) {
						singleMarker = marker;
					}
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

				// dirty hack, referenz auf marker wenn es für einen einzelnen DS ist
				// pop up öffnen
				if(facet_values_count == 1) {
					singleMarker.openPopup();
				}
			}


			var selectFacetsAndCreateMarkers = function () {
				if(scope.facets)
				{
					for (var i = scope.facets.length - 1; i >= 0; i--) {
						if(scope.facets[i].name === scope.locationfacetname) {
							createMarkers(scope.facets[i].values);
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

			var map = L.map(element.attr('id')).setView([40, -10], 3);

			//der layer mit markern (muss beim locationtype entfernt und neu erzeugt werden)
			var markerClusterGroup = null;

			var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				maxZoom: 18
			});
			map.addLayer(layer);	
			/*map.on('mousemove', function(e) {
				var point = e.containerPoint;
				var size = map.getSize();
				console.log(e.containerPoint + " " + size + " " + e.latlng)
				if(point.x < 10){
					map.panTo(e.latlng);
				}
				if(point.y < 10){
					map.panTo(e.latlng);
				}

				console.log(point.x + " " + size.x);
			});	*/
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
	.directive('zoomifyimg', ['arachneSettings', '$http', function(arachneSettings, $http) {
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

					// override to use XHR instead of regular image loading
					_loadTile: function (tile, tilePoint) {
						tile._layer  = this;
						tile.onload  = this._tileOnLoad;
						tile.onerror = this._tileOnError;

						this._adjustTilePoint(tilePoint);
						var imgUri = this.getTileUrl(tilePoint);
						$http.get(imgUri, { responseType: 'arraybuffer' })
							.success(function(data) {
								var blob = new Blob([data], {type: 'image/jpeg'});
	            				tile.src = window.URL.createObjectURL(blob);
							}
						);

						this.fire('tileloadstart', {
							tile: tile,
							url: tile.src
						});
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
	}])
	.directive('autofillfix', ['$timeout', function ($timeout) {
			return {
				link: function(scope, elem, attrs) {
					// Fixes Chrome bug: https://groups.google.com/forum/#!topic/angular/6NlucSskQjY
					elem.prop('method', 'POST');

					// Fix autofill issues where Angular doesn't know about autofilled inputs
					if(attrs.ngSubmit) {
						$timeout(function() {

							elem.unbind('submit').bind('submit', function (e) {
								e.preventDefault();
								var arr = elem.find('input');
								if (arr.length > 0) {
									arr.triggerHandler('input').triggerHandler('change').triggerHandler('keydown');
									scope.$apply(attrs.ngSubmit);
								}
							});
						}, 0);
					}
				}
			};
 		}]
 	)
 	.directive('focusMe', function ($timeout) {    
	    return {    
	        link: function (scope, element, attrs, model) {                
	            $timeout(function () {
	                element[0].focus();
	            });
	        }
	    };
	});
