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
            var currentQuery = searchService.currentQuery();
            if (!currentQuery.q) currentQuery.q = '*';

            /**
             * TODO: this one should get moved over to services/map.js. The map should be not visible from here.
             *
             * Set map view to center coords with zoomlevel
             */
            var initializeView = function(lat,lng,zoom) {
                var lt = lat || 40;
                var lg = lng || -10;
                var zm = zoom || 3;
                map.setView([lt, lg], zm);
            };

            var calculateHalfWidth = function(ghprec) {
                var parity = ghprec % 2;
                return 90 / Math.pow(2, ((5*ghprec + parity - 2) / 2) );
            };

            var calculateHalfHeight = function(ghprec) {
                var parity = ghprec % 2;
                return 90 / Math.pow(2, ((5*ghprec - parity) / 2) );
            };

            var calculateOpts = function(hue) {

                return {
                    color: "hsl(" + hue + ", 70%, 75%)",
                    stroke: false,
                    weight: 1,
                    clickable: false
                };
            };

            var createRectangleForBox = function(coords, count, max, ghprec) {
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

            var createLabelForBox = function(coords, count, queryString) {
                var countStr = $filter('number')(count);
                var opts = {
                    className: 'ar-map-geogrid-label',
                    html: '<div class="ar-map-geogrid-label-inner">' + countStr + '</div>',
                };
                var label = L.marker(coords, { icon: L.divIcon(opts) });

                label.bindPopup('<a href="' + baseLinkRef + 'search' + queryString
                    + '" title="Objekte suchen"><b>' + countStr
                    + '</b> Objekte</a> bei (' + coords[0] + ', ' + coords[1] + ')');

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

            var findMaximumFacetValue = function(boxesToDraw) {

                var counts = boxesToDraw.map(function(elem) {
                    return elem.count;
                });
                return Math.max.apply(null, counts);
            };


            var drawBoxes = function(boxesToDraw,ghprec) {

                for (var i = 0; i < boxesToDraw.length; i++) {
                    var coords = angular.fromJson(boxesToDraw[i].value);
                    var count = boxesToDraw[i].count;

                    var box = createRectangleForBox(
                        coords, count, findMaximumFacetValue(boxesToDraw), ghprec);

                    // XXX Hack. this one modifies the current query's bbox
                    var queryString = searchService.currentQuery().setParam(
                        'bbox', mapService.bBoxFromBounds(box.getBounds())).toString();

                    var label = createLabelForBox(
                        coords, count, queryString);

                    label.addTo(map);
                    box.addTo(map);

                    currentGridLayers.push(box);
                    currentGridLayers.push(label);
                }
            };

            var drawGrid = function(ghprec,bbox,boxesToDraw){

                removeCurrentGridLayers();
                if (boxesToDraw){
                    drawBoxes(boxesToDraw,ghprec);
                    searchService.currentQuery().setParam('bbox', bbox); // XXX Hack. See above.
                }

            };

            var map = mapService.initializeMap(
                element.attr('id'),
                {minZoom: 3} // 3 is to prevent wrong bbox searches
                             // when the window is bigger than the world
                , drawGrid
            );

            // Add baselayers and activate one, given by url
            // parameter "baselayer" or a default value
            mapService.setBaselayers(scope.baselayers);
            mapService.activateBaselayer(currentQuery.baselayer || "osm");
            initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
        }
    };
}]);