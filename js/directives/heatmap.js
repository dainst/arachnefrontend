'use strict';

angular.module('arachne.directives')

/**
 * Shows a gridmap constructed from the current searches
 * agg_geogrid facet.
 *
 * @author: Daniel de Oliveira
 */
.directive('arHeatMap', ['$filter', 'searchService', 'mapService',
function($filter, searchService, mapService) {
    return {
        restrict: 'A',
        scope: {
            baselayers: '='
        },
        link: function(scope, element) {

            console.log("Heatmap link function called")

            var currentGridLayers = [];
            var baseLinkRef = document.getElementById('baseLink').getAttribute("href");
            var currentQuery = searchService.currentQuery();
            if (!currentQuery.q) currentQuery.q = '*';



            var drawGrid = function(ghprec,bbox,boxesToDraw){

                console.log("abc")

                function heatMapColorForValue(value) {
                    var h = Math.round((1.0 - value) * 240);
                    return "hsl(" + h + ", 90%, 50%)";
                }

                function generateGradient(s) {
                    var gradient = {};
                    for (var i = 1; i <= 10; i++) {
                        gradient[s * i / 10] = heatMapColorForValue(i / 10);
                    }
                    return gradient;
                }

                // var max = grid[0]['doc_count'];
                var heatPoints = [[50.5, 30.5, 0.2], // lat, lng, intensity
                    [50.6, 30.4, 0.5]]

                console.log("gradient",generateGradient(0.7))
                console.log("map",map)

                var heatmap = L.heatLayer(heatPoints, {
                    radius: 25,
                    // max: 5000,
                    // gradient: generateGradient(0.7),
                    // minOpacity: 0.3
                }).addTo(map);
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
            mapService.initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
        }
    };
}]);