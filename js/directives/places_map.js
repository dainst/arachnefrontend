'use strict';

angular.module('arachne.directives')



/*
 * Shows a number of Place objects on a Leaflet map as MarkerClusters
 *
 * @author: David Neugebauer
 */
.directive('arPlacesMap', ['$compile', 'mapService', 'searchService', 'placesService',
function($compile, mapService, searchService, placesService) {
    return {
        restrict: 'A',
        scope: {
            overlays: '=',
            baselayers: '=',
            defaultBaselayer: '=',
            clustered: '=' // true|false
        },
        link: function(scope, element, attrs) {

            // create the actual places' markers
            var selectFacetsAndCreateMarkers = function(markerClusterGroup, map, places, showClustered) {

                markerClusterGroup = new L.MarkerClusterGroup({
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

                if(places) {
                    for(var i=0; i < places.length; i++){
                        var place = places[i];

                        if (place.hasCoordinates()) {
                            // Dom-Element für Popup bauen und in Link-Funktion kompilieren
                            var html = '<div ar-map-popup place="place"></div>';
                            var linkFunction = $compile(angular.element(html));
                            var newScope = scope.$new(true);
                            newScope.place = place;

                            // Marker-Objekt anlegen, mit DOM von ausgeführter Link-Funktion verknüpfen
                            var marker = L.marker(new L.LatLng(place.location.lat, place.location.lon), { entityCount : place.entityCount });
                            marker.bindPopup(linkFunction(newScope)[0]);
                            if (showClustered) {
                                markerClusterGroup.addLayer(marker);
                            } else {
                                map.addLayer(marker);
                            }
                        }
                    }
                }

                map.addLayer(markerClusterGroup);
            }

            // Returns an object containing all overlays ordered by their keys
            // regardless of them being grouped or not
            // returns { key: overlay, ... }
            var extractOverlays = function() {
                var result = {}
                var overlays = scope.overlays;
                // overlays are either grouped at .groups
                if (overlays && overlays.groups) {
                    for (var i = 0; i < overlays.groups.length; i++) {
                        var group = overlays.groups[i];

                        for (var j = 0; j < group.overlays.length; j++) {
                            var overlay = group.overlays[j];
                            result[overlay.key] = overlay;
                        }
                    }
                    // or just listed directly
                } else if (overlays) {
                    for (var i = 0; i < overlays.length; i++) {
                        var overlay = overlays[i];
                        result[overlay.key] = overlay;
                    }
                }
                return result
            }

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

                selectFacetsAndCreateMarkers(markerClusterGroup, map, places, scope.clustered);
                setView(places);
            };

            // which overlays are to be created is given by their keys in the URL
            var activateOverlays= function() {
                var keys = currentQuery.getArrayParam('overlays');
                for (var i = 0; i < keys.length; i++) {
                    mapService.activateOverlay(keys[i]);
                }
            };

            // always cluster if not explicitely defined otherwise
            if (scope.clustered != false) {
                scope.clustered = true;
            }

            var currentQuery = searchService.currentQuery();

            // the layer with markers (has to be recreated when places change)
            var markerClusterGroup = null;

            var map = mapService.initializeMap(element.attr('id'), { zoomControl: false });
            // Set the available overlays and baselayers
            mapService.setOverlays(extractOverlays());
            mapService.setBaselayers(scope.baselayers);

            mapService.initializeView(currentQuery.lat,currentQuery.lng,currentQuery.zoom);
            mapService.activateBaselayer(currentQuery.baselayer || scope.defaultBaselayer);
            activateOverlays();
            placesService.getCurrentPlaces().then(selectFacetsCreateMarkersSetView)
        }
    };
}])
