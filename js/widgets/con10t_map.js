'use strict';

angular.module('arachne.widgets.directives')

/**
 * Shows a heatmap constructed from the current searches
 * agg_geogrid facet. If the resources of the viewport fall below
 * a certain threshold, the map will show markers instead.
 *
 * @author Daniel de Oliveira
 * @author David Neugebauer
 */
.directive('con10tMap', ['$filter', 'searchService', 'mapService', 'heatmapPainter', 'placesService','placesClusterPainter',
    function($filter, searchService, mapService, heatmapPainter, placesService, placesClusterPainter) {


        // var setView= function(places) {
        //     // set the map's view:
        //     // fit bounds to entities only when zoom or coordinates are not explicitely
        //     // required by the url, else use the url settings
        //     if ((places && places.length > 0) && !(currentQuery.zoom || currentQuery.lat || currentQuery.lng)) {
        //         var latLngs = places.map(function(place) {
        //             if (place.location) {
        //                 return [place.location.lat, place.location.lon];
        //             }
        //         });
        //         map.fitBounds(latLngs);
        //
        //         // Sets zoom, such that it is not too detailed when few entities are shown.
        //         // Zooms out a little bit to prevent all markers being hidden behind menus on the side.
        //         var zoom = map.getZoom();
        //         if(zoom > 9) {
        //             map.setZoom(9);
        //         } else if(zoom > 4) {
        //             map.setZoom(zoom -1);
        //         }
        //     } else {
        //         mapService.initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
        //     }
        // };
        
        
        function enrichQuery(currentQuery,scope) {

            if (!currentQuery.q) currentQuery.q = '*';

            if (!currentQuery.lat)
                if (scope.lat)  currentQuery.lat=scope.lat;
            if (!currentQuery.lng)
                if (scope.lng)  currentQuery.lng=scope.lng;
            if (!currentQuery.zoom)
                if (scope.zoom) currentQuery.zoom=scope.zoom;
            // Add a limit to the search if defined in the attribute
            if (scope.limit) {
                currentQuery.limit = scope.limit;
            }

            // Add restrictions for facets to the search if defined
            if (scope.facetsSelect) {

                var facet, len = scope.facetsSelect.length;

                for (var i = 0; i < len; i++) {

                    facet = scope.facetsSelect[i];

                    if (!currentQuery.hasFacet(facet.key)) {
                        currentQuery.facets.push(facet);
                    }
                }
            }

            // Add a further restriction for the catalog id
            if (scope.catalogId) {
                scope.catalogId = parseFloat(scope.catalogId);
                if (!currentQuery.hasFacet('catalogIds')) {
                    currentQuery.facets.push({key: 'catalogIds',value: scope.catalogId});
                }
            }
        }

        // TODO remove duplicate code (with map.js)
        var _bBoxFromBounds = function (bounds) {
            var southEast = bounds.getSouthEast();
            var northWest = bounds.getNorthWest();
            return [northWest.lat, northWest.lng, southEast.lat, southEast.lng].join(',');
        };

        return {
            restrict: 'A',
            scope: {
                catalogId: '@',
                overlays: '=?',
                baselayers: '=',
                defaultBaselayer: '=',	// "key"
                limit: '@',				// "500"
                facetsSelect: '=',		// {facetName: facetValue, ...}
                clustered: '=',  		// true|false
                lat: '@',
                lng: '@',
                zoom: '@'

            },
            // menu elements may appear in the transcluded html
            transclude: true,
            template: '<ng-transclude></ng-transclude>',
            link : function(scope,element) {

                var currentQuery = searchService.currentQuery();
                enrichQuery(currentQuery,scope);


                function mapOnMove() {
                    if (searchService.getSize()<500) {

                        placesClusterPainter.clear();
                        heatmapPainter.clear();

                        // scope.clustered = false;
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

                mapService.setOverlays(scope.overlays);
                // Add baselayers and activate one, given by url
                // parameter "baselayer" or a default value
                mapService.setBaselayers(scope.baselayers);
                mapService.activateBaselayer(currentQuery.baselayer || "osm");
                mapService.activateOverlays(currentQuery.getArrayParam('overlays')); // TODO this is undefined

                mapService.initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
            }
        }
    }
]);