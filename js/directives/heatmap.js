'use strict';

angular.module('arachne.directives')

/**
 * Shows a heatmap constructed from the current searches
 * agg_geogrid facet. If the resources of the viewport fall below 
 * a certain threshold, the map will show markers instead.
 *
 * @author Daniel de Oliveira
 * @author David Neugebauer
 */
.directive('arHeatMap', ['$filter', 'searchService', 'mapService', 'heatmapService',
function($filter, searchService, mapService, heatmapService) {
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

            mapService.registerBucketsListener(heatmapService.drawBuckets);
            mapService.initializeMap(
                element.attr('id'),
                {minZoom: 3} // 3 is to prevent wrong bbox searches
                // when the window is bigger than the world
            );

            // Add baselayers and activate one, given by url
            // parameter "baselayer" or a default value
            mapService.setBaselayers(scope.baselayers);
            mapService.activateBaselayer(currentQuery.baselayer || "osm");
            mapService.initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
        }
    };
}]);