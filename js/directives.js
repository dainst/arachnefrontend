'use strict';

/* Directives */
angular.module('arachne.directives', []).

	directive('arImagegrid', ['arachneSettings', '$http', '$sce', '$window', function(arachneSettings, $http, $sce, $window) {
		return {
			scope: {
				entities: '=',
				columns: '@',
				offset: '=',
				margin: '@',
				currentQuery: '='
			},
			templateUrl: 'partials/ar-imagegrid.html',
			
			link: function(scope, element, attrs) {

				scope.complete = false;

				var placeholder = new Image();
				placeholder.src = 'img/imagePlaceholder.png';

				var columns = scope.columns;
				var rows = Math.ceil(scope.entities.length / columns);
				scope.grid = new Array(rows);
				for (var i = 0; i < rows; i++) {
					scope.grid[i] = new Array(columns);
					for (var k = 0; k < columns; k++) {
						if (i*columns+k >= scope.entities.length) break;
						var index = i * columns + k;
						var entity = scope.entities[index];
						scope.grid[i][k] = {
							entity: entity,
							href: 'entity/' + entity.entityId + "?resultIndex=" + (scope.offset + index)
								+ "&q=" + scope.currentQuery.q + "&fq=" + scope.currentQuery.fq,
							width: 200,
							height: 200,
							complete: false,
							row: scope.grid[i]
						}
						scope.grid[i].complete = false;
						if (typeof entity.thumbnailId != 'undefined') {
							scope.grid[i][k].imgUri = arachneSettings.dataserviceUri + "/image/height/" + entity.thumbnailId + "?height=300";
						} else {
							scope.grid[i][k].imgUri = placeholder.src;
						}
						loadImage(scope.grid[i][k]);
					}
				}

				// TODO: Is Ajax really necessary? Maybe setting src is sufficient ...
				function loadImage(cell) {
        			cell.img = new Image();
					cell.img.addEventListener("load", function() {
						// custom event handlers need to be wrapped in $apply
						scope.$apply(function() {
							cell.complete = true;
							resizeRow(cell.row);
						});
					});
					cell.img.addEventListener("error", function() {
						scope.$apply(function() {
							cell.complete = true;
							cell.img = placeholder;
							resizeRow(cell.row);
						});
					});
        			cell.img.src = cell.imgUri;
				}

				function resizeRow(row) {

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
						var height = row[i].img.naturalHeight * scalingFactor;
						if (height > maxHeight) maxHeight = height;
					}

					for (var i=0; i < row.length; i++) {
						if (scalingFactor > 1) {
							row[i].height = row[i].img.naturalHeight;
						} else {
							row[i].height = maxHeight;
						}
					}

				}

				angular.element($window).bind('resize', function() {
					scope.$apply(function() {
						scope.complete = false;
						for (var i = 0; i < scope.grid.length; i++) {
							var row = scope.grid[i];
							row.complete = false;
							resizeRow(row);
						}
					});
				});
			
			}
		}
	}]).

	directive('arImagegridCell', ['$sce', function($sce) {
		return {
			scope: {
				href: '@', img: '=', title: '@', subtitle: '@', imgUri: '@',
				cellWidth: '@', imgWidth: '@', cellHeight: '@', cellMargin: '@'
			},
			templateUrl: 'partials/ar-imagegrid-cell.html'
		}
	}]).

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
					this.setAttribute('placeholder','true');
				}

				var listener = function () {

					if(imagesLeftToLoad != 0) imagesLeftToLoad--;
					

					// BREAK if there are any images left to be loaded
					if (imagesLeftToLoad != 0) return;

					var scalingFactor = 0, imagesWidth = 0;
					for (var i = images.length - 1; i >= 0; i--) {

						if(images[i].naturalWidth == 0) {
							console.warn("naturalWidth  -- Bild hatte eine naturalWidth von 0. Pfad: " + images[i].src);
							images[i].src="img/imagePlaceholder.png";
							images[i].setAttribute('placeholder','true');

						}

						
						imagesWidth += images[i].naturalWidth;

					};



					var maxHeight = 0;


					scalingFactor = (element.parent()[0].clientWidth-10) / imagesWidth;
					
					

					for (var i = images.length - 1; i >= 0; i--) {

						var newWidth, newHeight;
						if(scalingFactor > 1.15) {


							newWidth =  images[i].width*1.15;
							newHeight = images[i].height*1.15;


							var newOuterWidth = (images[i].width) * scalingFactor;
														

							images[i].parentNode.parentNode.parentNode.style.width = newOuterWidth + "px";

							images[i].width = newWidth;
						} else {
							newWidth =  (images[i].naturalWidth) * scalingFactor;
							newHeight = (images[i].naturalHeight) * scalingFactor;

							images[i].parentNode.parentNode.parentNode.style.width = newWidth + "px";
							images[i].width = newWidth;

							
						}

						// if(images[i].getAttribute('width-extended-to')) {
						// 	images[i].parentNode.parentNode.parentNode.style.width = images[i].getAttribute('width-extended-to')-8 + "px";
						// }


						if (newHeight > maxHeight) maxHeight = newHeight;
						

						images[i].removeEventListener("load", listener, false);
						images[i].removeEventListener("error", listener, false);
						// angular.element(images[i].parentNode.parentNode.parentNode.parentNode).removeClass('invisible');

					};




					for (var i = images.length - 1; i >= 0; i--) {
						images[i].parentNode.style.height = maxHeight + "px";
						angular.element(images[i].parentNode.parentNode.parentNode.parentNode).removeClass('invisible');
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
	// + magnifier {boolean}
	// - arachneimagerequest
	// - arachneimageheight

	.directive('arachneimagerequest', ['arachneSettings', '$compile', function(arachneSettings, $compile) {
		return {
			restrict: 'A',

			link: function(scope, element, attrs) {

				// * * * * BASIC STRUCTURE OF IMAGE TILE
				element.addClass('invisible');

				var body = document.createElement('div');
				body.setAttribute('class','image-tile');
				element.append(body);

				var img = document.createElement('img');
				var imageWrapper = document.createElement('div');
				imageWrapper.setAttribute('class','imageWrapper');
				imageWrapper.appendChild(img);


				// * * * * IMAGE, TITLES AND LINK

				// if no entity is given:
				// uses an invisible placeholder to form the grid, which keeps the number of columns and a reasonable width of tiles for existing etities
				// than break the process
				if(attrs.isPlaceholderIfEmpty == "") {
					img.setAttribute('placeholder','true');
					img.setAttribute('src',"img/imagePlaceholder.png");
					body.appendChild(imageWrapper);

				} else {
				// link generation if entitiy is given
					var a;
					if (attrs.link) {
						a = document.createElement('a');
						a.setAttribute('href', attrs.link);
					} else {
						a = document.createElement('span');
					}
					body.appendChild(a);
					var src;

					if(attrs.imageid) {
						src = arachneSettings.dataserviceUri+'/image/'+attrs.arachneimagerequest+'/'  + attrs.imageid + '?'  + attrs.arachneimagerequest + '=' + attrs.arachneimageheight;
					} else {
						src = "img/imagePlaceholder.png";
						img.setAttribute('placeholder','true');
					}

					// for magnifier on mouse effects
					if(attrs.magnifier) {

						img.setAttribute('largeImage', arachneSettings.dataserviceUri+'/image/' + attrs.imageid );
						img.setAttribute('ng-mouseenter','searchCtrl.startTimer($event)');
						img.setAttribute('ng-mouseleave', 'searchCtrl.endTimer($event)');
						$compile(img)(scope);
					}

					img.setAttribute('src',src);
					a.appendChild(imageWrapper);
						
					var footer = document.createElement('p');
					
				
					var titleWrapper = document.createElement('small');
					if(attrs.imageTitle == "") {
						titleWrapper.textContent = "Objekt der Kat.  " +  attrs.category;
					} else {
						titleWrapper.textContent = attrs.imageTitle;
					}
					footer.appendChild(titleWrapper);
					if(attrs.imageSubtitle) {
						footer.appendChild(document.createElement('br'));
						var subtitleWrapper = document.createElement('small');
						subtitleWrapper.setAttribute('class','text-muted');
						subtitleWrapper.textContent = attrs.imageSubtitle;
						footer.appendChild(subtitleWrapper);
					}
					
					a.appendChild(footer);
					
				}

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
				
				// dirty hack: wenn nur ein marker da ist brauchen wir eine referenz um später sein popup zu öffnen
				// (!) todo: wenn du ein marker gemacht werden soll (also bei einzelnen Datensätzen) dann sollte kein clustering benutzt werden. 
				if(facet_values_count == 1) {
					var singleMarker = {};
				}

				for (var i = facet_values_count - 1; i >= 0; i--) {

					var facetValue = facet_values[i];

					var coordsString = facetValue.value.substring(facetValue.value.indexOf("[", 1)+1, facetValue.value.length - 1);
					var coords = coordsString.split(',');
					var title = "<b>" + facetValue.value.substring(0, facetValue.value.indexOf("[", 1)-1) + "</b><br/>";
					// Popup-Title auf Karte für Suchergebnis
					if (facetValue.count > 1) {
					
						title += "Einträge, <b>insgesamt</b>: " + facetValue.count + "<br>";
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
						title += "<a href='search?q=*&fq="+scope.locationfacetname+":\"" + facetValue.value +  "\"'>Diesen Eintrag anzeigen</a>";
					}
					
					var marker = L.marker(new L.LatLng(coords[0], coords[1]), { title: title, entityCount : facetValue.count });
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

			console.log(element.attr('id'))
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
 	);
