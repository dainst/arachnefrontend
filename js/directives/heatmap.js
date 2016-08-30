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
.directive('arHeatMap', ['$filter', 'searchService', 'mapService', 'heatmapPainter', 'placesService','placesClusterPainter',
function($filter, searchService, mapService, heatmapPainter, placesService, placesClusterPainter) {
    return {
        restrict: 'A',
        scope: {
            baselayers: '='
        },
        link: function(scope, element) {

            var currentQuery = searchService.currentQuery();
            if (!currentQuery.q) currentQuery.q = '*';

            // TODO remove duplicate code (with map.js)
            var _bBoxFromBounds = function (bounds) {
                var southEast = bounds.getSouthEast();
                var northWest = bounds.getNorthWest();
                return [northWest.lat, northWest.lng, southEast.lat, southEast.lng].join(',');
            };

            function mapOnMove() {
                if (searchService.getSize()<5000) {

                    placesClusterPainter.clear();
                    heatmapPainter.clear();

                    scope.clustered = false;
                    placesService.getCurrentPlaces().then(function(places) {
                        placesClusterPainter.drawPlaces(
                            places, scope);
                    });
                }
                else {
                    placesClusterPainter.clear();
                    heatmapPainter.clear();

                    searchService.getCurrentPage().then(function () {
                        var bucketsToDraw = null;
                        var agg_geogrid = searchService.getFacet("agg_geogrid");
                        if (agg_geogrid) bucketsToDraw = agg_geogrid.values;
                        heatmapPainter.drawBuckets(_bBoxFromBounds(mapService.getMap().getBounds()), bucketsToDraw);
                    });

                }
            }

            mapService.setMoveListener(mapOnMove);

            mapService.initializeMap(
                element.attr('id'),
                {minZoom: 3} // 3 is to prevent wrong bbox searches
                // when the window is bigger than the world,
            );
            heatmapPainter.setMap(mapService.getMap());
            placesClusterPainter.setMap(mapService.getMap());

            // Add baselayers and activate one, given by url
            // parameter "baselayer" or a default value
            mapService.setBaselayers(scope.baselayers);
            mapService.activateBaselayer(currentQuery.baselayer || "osm");
            mapService.initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
        }
    };
}]);