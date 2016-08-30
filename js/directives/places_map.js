'use strict';

angular.module('arachne.directives')



/*
 * Shows a number of Place objects on a Leaflet map as MarkerClusters
 *
 * @author: David Neugebauer
 */
.directive('arPlacesMap', [ 'mapService', 'searchService', 'placesService','placesClusterPainter',
function(mapService, searchService, placesService,placesClusterPainter) {
    return {
        restrict: 'A',
        scope: {
            overlays: '=',
            baselayers: '=',
            defaultBaselayer: '=',
            clustered: '=' // true|false
        },
        link: function(scope, element, attrs) {

            var setView= function(places) {
                // set the map's view:
                // fit bounds to entities only when zoom or coordinates are not explicitely
                // required by the url, else use the url settings
                if ((places && places.length > 0) && !(currentQuery.zoom || currentQuery.lat || currentQuery.lng)) {
                    var latLngs = places.map(function(place) {
                        if (place.location) {
                            return [place.location.lat, place.location.lon];
                        }
                    });
                    map.fitBounds(latLngs);

                    // Sets zoom, such that it is not too detailed when few entities are shown.
                    // Zooms out a little bit to prevent all markers being hidden behind menus on the side.
                    var zoom = map.getZoom();
                    if(zoom > 9) {
                        map.setZoom(9);
                    } else if(zoom > 4) {
                        map.setZoom(zoom -1);
                    }
                } else {
                    mapService.initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
                }
            };

            var selectFacetsCreateMarkersSetView = function(places) {

                placesClusterPainter.drawPlaces(
                    places, scope);
                setView(places);
            };

            
            // always cluster if not explicitely defined otherwise
            if (scope.clustered != false) {
                scope.clustered = true;
            }

            var currentQuery = searchService.currentQuery();
            
            var map = mapService.initializeMap(element.attr('id'), { zoomControl: false });

            placesClusterPainter.setMap(map);

            mapService.setOverlays(scope.overlays);
            mapService.setBaselayers(scope.baselayers);

            mapService.initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
            mapService.activateBaselayer(currentQuery.baselayer || scope.defaultBaselayer);
            mapService.activateOverlays(currentQuery.getArrayParam('overlays'));
            placesService.getCurrentPlaces().then(selectFacetsCreateMarkersSetView)
        }
    };
}]);
