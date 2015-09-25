'use strict';

angular.module('arachne.directives')

/* Directive shows a gridmap constructed from the current searches
 * agg_geogrid facet.
 *
 * @author: David Neugebauer
 */
.directive('arGridMap', ['$filter', 'searchService', 'mapService',
function($filter, searchService, mapService) {
    return {
        restrict: 'A',
        scope: {
            baselayers: '='
        },
        link: function(scope, element) {

            // Basic variables
            var currentQuery = searchService.currentQuery();
            // initialize map with minZoom 3 to prevent wrong bbox searches
            // when the window is bigger than the world
            var map = mapService.initializeMap(element.attr('id'), {minZoom: 3});
            var baselayerName = currentQuery.baselayer || "osm";
            var baseLinkRef = document.getElementById('baseLink').getAttribute("href");

            // Promise for a drawn grid, i.e. an array of all layers
            // making up the current grid
            var gridPromise = null;

            var rectOptions = {
                stroke: true,
                weight: 1,
                clickable: false,
            };

            // Guesses a good geohash precision value from the zoomlevel
            // "zoom". The returned value can be used as "ghprec"-param in
            // search queries
            var getGhprecFromZoom = function(zoom) {
                var result = null;

                switch (zoom) {
                    case 0:
                    case 1:
                        result = 1;
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        result = 2;
                        break;
                    case 6:
                    case 7:
                    case 8:
                        result = 3;
                        break;
                    case 9:
                    case 10:
                        result = 4;
                        break;
                    case 11:
                    case 12:
                        result = 5;
                        break;
                    case 13:
                    case 14:
                    case 15:
                        result = 6;
                        break;
                    case 16:
                    case 17:
                    case 18:
                        result = 7;
                        break;
                    default:
                        break;
                }
                return result;
            }

            var getBboxFromBounds = function(bounds) {
                var southEast = bounds.getSouthEast();
                var northWest = bounds.getNorthWest();
                return [northWest.lat, northWest.lng, southEast.lat, southEast.lng]
            }

            // draws a box layer on the map, returns the layer
            var drawBox = function(coords, count, max, halfWidth, halfHeight) {
                // coordinates for the box's corners
                var southwest = [(coords[0]-halfHeight), (coords[1]-halfWidth)];
                var northeast = [(coords[0]+halfHeight), (coords[1]+halfWidth)];
                // determine a color for the box
                var ratio = count / max;
                var hue = (1.0 - ratio) * 240; // 0-240 gives a 5-color heatmap from blue to red
                var opts = {
                    color: "hsl(" + hue + ", 70%, 75%)",
                    stroke: false,
                    weight: 1,
                    clickable: false,
                }
                var rect = L.rectangle([southwest, northeast], opts);
                rect.addTo(map);
                return rect;
            };

            // draws an html label as a layer on the map, returns the layer
            var drawLabel = function(coords, count, gridElementBounds) {
                var countStr = $filter('number')(count);
                var opts = {
                    className: 'ar-map-geogrid-label',
                    html: '<div class="ar-map-geogrid-label-inner">' + countStr + '</div>',
                }
                var label = L.marker(coords, { icon: L.divIcon(opts) });
                var query = searchService.currentQuery().setParam('bbox', getBboxFromBounds(gridElementBounds).join(','));
                label.bindPopup('<a href="' + baseLinkRef + 'search' + query.toString() + '" title="Objekte suchen"><b>' + countStr + '</b> Objekte</a> bei (' + coords[0] + ', ' + coords[1] + ')');
                label.addTo(map);
                label.on('mouseover', function(e) {
                    label.openPopup();
                });
                return label;
            }

            var removeLayers = function(layers) {
                if (layers) {
                    for (var i = 0; i < layers.length; i++) {
                        map.removeLayer(layers[i]);
                    }
                }
            };

            // resets the searchServices current result and performs a
            // new search with parameters "bbox" and "ghprec" adjusted to fit the maps
            // position and zoomlevel, then draws the grid from the "agg_geogrid"
            // aggregation that results from the search, returns a promise for all
            // layers that make up the map
            // Removes old layers right before setting the new ones if they are present
            // as param oldLayers
            var drawGrid = function(oldLayers) {
                searchService.reset();

                currentQuery = searchService.currentQuery();
                if (!currentQuery.q) currentQuery.q = '*';

                var ghprec = getGhprecFromZoom(map.getZoom());
                currentQuery.ghprec = getGhprecFromZoom(map.getZoom());
                currentQuery.bbox = getBboxFromBounds(map.getBounds()).join(',');
                var layers = [];

                return searchService.getCurrentPage().then(function(entities) {
                    removeLayers(oldLayers);

                    var facet = searchService.getFacet("agg_geogrid");
                    if (facet) {
                        var gridElements = facet.values;

                        // find maximum facet value
                        var counts = gridElements.map(function(elem) {
                            return elem.count;
                        })
                        var max = Math.max.apply(null, counts);

                        // compute the distance from the box's center to it's sides
                        var parity = ghprec % 2;
                        var halfWidth = 90 / Math.pow(2, ((5*ghprec + parity - 2) / 2) );
                        var halfHeight = 90 / Math.pow(2, ((5*ghprec - parity) / 2) );

                        for (var i = 0; i < gridElements.length; i++) {
                            var coords = angular.fromJson(gridElements[i].value);
                            var count = gridElements[i].count;

                            var box = drawBox(coords, count, max, halfWidth, halfHeight);
                            layers.push(box);
                            layers.push(drawLabel(coords, count, box.getBounds()));
                        }
                    }
                    return layers;
                });
            }

            // wraps drawGrid() in a promise, such that multiple calls to drawGrid()
            // are executed in order
            var drawGridDeferred = function() {
                if (gridPromise) {
                    gridPromise = gridPromise.then(function(oldLayers) {
                        return drawGrid(oldLayers);
                    });
                } else {
                    gridPromise = drawGrid();
                }
                return gridPromise;
            };

            // Add baselayers and activate one, given by url
            // parameter "baselayer" or a default value
            mapService.setBaselayers(scope.baselayers);
            mapService.activateBaselayer(baselayerName);

            // Set map view to center coords with zoomlevel
            var lat = currentQuery.lat || 40;
            var lng = currentQuery.lng || -10;
            var zoom = currentQuery.zoom || 3;
            map.setView([lat, lng], zoom);

            drawGridDeferred();

            // register a hook to redraw the grid on zoom and move events
            map.on('moveend', function() {
                drawGridDeferred();
            });
        }
    };
}]);