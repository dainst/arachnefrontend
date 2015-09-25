'use strict';

angular.module('arachne.directives')

/**
 * Shows a gridmap constructed from the current searches
 * agg_geogrid facet.
 *
 * @author: David Neugebauer
 * @author: Daniel M. de Oliveira
 */
.directive('arGridMap', ['$filter', 'searchService', 'mapService',
function($filter, searchService, mapService) {
    return {
        restrict: 'A',
        scope: {
            baselayers: '='
        },
        link: function(scope, element) {

            var currentGridLayers = [];
            var baseLinkRef = document.getElementById('baseLink').getAttribute("href");

            // Set map view to center coords with zoomlevel
            var initializeView = function(lat,lng,zoom) {
                var lt = lat || 40;
                var lg = lng || -10;
                var zm = zoom || 3;
                map.setView([lt, lg], zm);
            };

            /**
             * Guesses a good geohash precision value from the zoomlevel
             * "zoom". The returned value can be used as "ghprec"-param in
             * search queries
             */
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
            };

            var getBboxFromBounds = function(bounds) {
                var southEast = bounds.getSouthEast();
                var northWest = bounds.getNorthWest();
                return [northWest.lat, northWest.lng, southEast.lat, southEast.lng]
            };

            var calculateHalfWidth = function(ghprec) {
                var parity = ghprec % 2;
                return 90 / Math.pow(2, ((5*ghprec + parity - 2) / 2) );
            }

            var calculateHalfHeight = function(ghprec) {
                var parity = ghprec % 2;
                return 90 / Math.pow(2, ((5*ghprec - parity) / 2) );
            }

            var calculateOpts = function(hue) {

                return {
                    color: "hsl(" + hue + ", 70%, 75%)",
                    stroke: false,
                    weight: 1,
                    clickable: false
                };
            }

            var makeBoxesLayer = function(coords, count, max, ghprec) {
                var halfHeight=calculateHalfHeight(ghprec)
                var halfWidth =calculateHalfWidth(ghprec)

                // coordinates for the box's corners
                var southwest = [(coords[0]-halfHeight), (coords[1]-halfWidth)];
                var northeast = [(coords[0]+halfHeight), (coords[1]+halfWidth)];
                // determine a color for the box
                var ratio = count / max;
                var hue = (1.0 - ratio) * 240; // 0-240 gives a 5-color heatmap from blue to red
                var rect = L.rectangle([southwest, northeast], calculateOpts(hue));
                return rect;
            };

            var makeLabelsLayer = function(coords, count, gridElementBounds) {
                var countStr = $filter('number')(count);
                var opts = {
                    className: 'ar-map-geogrid-label',
                    html: '<div class="ar-map-geogrid-label-inner">' + countStr + '</div>',
                }
                var label = L.marker(coords, { icon: L.divIcon(opts) });
                var query = searchService.currentQuery().setParam('bbox', getBboxFromBounds(gridElementBounds).join(','));
                label.bindPopup('<a href="' + baseLinkRef + 'search' + query.toString() + '" title="Objekte suchen"><b>' + countStr + '</b> Objekte</a> bei (' + coords[0] + ', ' + coords[1] + ')');

                label.on('mouseover', function(e) {
                    label.openPopup();
                });
                return label;
            };

            var removeCurrentGridLayers = function() {
                if (currentGridLayers) {
                    for (var i = 0; i < currentGridLayers.length; i++) {
                        map.removeLayer(currentGridLayers[i]);
                    }
                }
            };



            var drawGrid = function(boxesToDraw,ghprec) {

                // find maximum facet value
                var counts = boxesToDraw.map(function(elem) {
                    return elem.count;
                });
                var max = Math.max.apply(null, counts);

                // compute the distance from the box's center to it's sides


                for (var i = 0; i < boxesToDraw.length; i++) {
                    var coords = angular.fromJson(boxesToDraw[i].value);
                    var count = boxesToDraw[i].count;

                    var boxesLayer = makeBoxesLayer(coords, count, max, ghprec);
                    var labelsLayer = makeLabelsLayer(coords, count, boxesLayer.getBounds())

                    labelsLayer.addTo(map);
                    boxesLayer.addTo(map);

                    currentGridLayers.push(boxesLayer);
                    currentGridLayers.push(labelsLayer);
                }
            };


            /**
             * Adjusts currentQuery to the current viewport.
             * The query gets executed and a new grid gets drawn
             * with layers based on the results.
             */
            var recalculateGridForViewport = function(){
                currentQuery.ghprec = getGhprecFromZoom(map.getZoom());
                currentQuery.bbox = getBboxFromBounds(map.getBounds()).join(',');

                searchService.setCurrentQuery(currentQuery);
                searchService.getCurrentPage().then(function(entities){

                    removeCurrentGridLayers();

                    var boxesToDraw=[];
                    var agg_geogrid = searchService.getFacet("agg_geogrid");
                    if (agg_geogrid) boxesToDraw=agg_geogrid.values;

                    if (boxesToDraw.length!=0)
                        drawGrid(boxesToDraw,currentQuery.ghprec);
                });
            };




            // on link

            var currentQuery = searchService.currentQuery();
            if (!currentQuery.q) currentQuery.q = '*';

            var baselayerName = currentQuery.baselayer || "osm";

            var map = mapService.initializeMap(
                element.attr('id'),
                {minZoom: 3} // 3 is to prevent wrong bbox searches
                             // when the window is bigger than the world
            );
            // Add baselayers and activate one, given by url
            // parameter "baselayer" or a default value
            mapService.setBaselayers(scope.baselayers);
            mapService.activateBaselayer(baselayerName);
            initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
            recalculateGridForViewport();


            // Hook for redrawing the grid on zoom and move events
            map.on('moveend', function() {
                recalculateGridForViewport();
            });
        }
    };
}]);