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
.directive('con10tMap', ['$filter', 'searchService', 'mapService', 'heatmapPainter', 'placesService','placesPainter',
    function($filter, searchService, mapService, heatmapPainter, placesService, placesPainter) {

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

        /**
         * Set the map's view:
         * fit bounds to entities only when zoom or coordinates are not explicitely
         * required by the url, else use the url settings
         */
        function fitViewToMarkers(zoom,lat,lng,places) {

            if ((places && places.length > 0) && !(zoom || lat || lng)) {

                var latLngs = places.map(function (place) {
                    if (place.location) {
                        return [place.location.lat, place.location.lon];
                    }
                });

                // Sets zoom, such that it is not too detailed when few entities are shown.
                // Zooms out a little bit to prevent all markers being hidden behind menus on the side.
                if (mapService.getMap().getZoom() > 9) {
                    mapService.getMap().fitBounds(latLngs).setZoom(9);
                } else if (mapService.getMap().getZoom() > 4) {
                    mapService.getMap().fitBounds(latLngs).setZoom(mapService.getMap().getZoom() - 1);
                } else
                    mapService.getMap().fitBounds(latLngs);
            }
        }

        return {
            restrict: 'A',
            scope: {
                catalogId: '@',
                overlays: '=?',
                baselayers: '=',
                defaultBaselayer: '=',	// "key"
                limit: '@?',		    // "500"
                facetsSelect: '=',		// {facetName: facetValue, ...}
                lat: '@',
                lng: '@',
                zoom: '@',
                disableZoomControl: '@?', // true|false - disables the standard leaflet zoom control
            },
            // menu elements may appear in the transcluded html
            transclude: true,
            template: '<ng-transclude></ng-transclude>',
            link : function(scope,element) {

                if (scope.limit==undefined||scope.limit>500) scope.limit=500;

                var fitViewToMarkersAllowed=true;

                var cq = searchService.currentQuery();
                enrichQuery(cq,scope);



                function mapOnMove(entities) {

                    if (mapService.underLimit()) {

                        placesPainter.clear(); // TODO implement map.removeLayers

                        heatmapPainter.clear();
                        var places = placesService.makePlaces(entities,cq.bbox.split(","));

                        placesPainter.drawPlaces(
                            places, scope);

                        {
                            if (fitViewToMarkersAllowed) {
                                fitViewToMarkers(
                                    cq.zoom, cq.lat, cq.lng,
                                    places
                                );
                            }
                        }
                    }
                    else {
                        placesPainter.clear();
                        heatmapPainter.clear();

                        var bucketsToDraw = null;
                        var agg_geogrid = searchService.getFacet("agg_geogrid");
                        if (agg_geogrid) bucketsToDraw = agg_geogrid.values;
                        heatmapPainter.drawBuckets(cq.bbox, bucketsToDraw);
                    }

                    fitViewToMarkersAllowed=false;
                }


                mapService.setLimit(scope.limit);
                mapService.registerOnMoveListener(mapOnMove);

                mapService.initializeMap(
                    element.attr('id'),
                    {
                        zoomControl: !scope.disableZoomControl,
                        minZoom: 3
                    } // 3 is to prevent wrong bbox searches
                    // when the window is bigger than the world,
                );

                heatmapPainter.setMap(mapService.getMap());
                placesPainter.setMap(mapService.getMap());

                // Add baselayers and activate one, given by url
                // parameter "baselayer" or a default value
                mapService.setBaselayers(scope.baselayers);
                mapService.activateBaselayer(cq.baselayer || "osm");

                mapService.setOverlays(scope.overlays);
                mapService.activateOverlays(cq.getArrayParam('overlays')); // TODO this is undefined

                mapService.initializeView(cq.lat,cq.lng,cq.zoom);
            }
        }
    }
]);