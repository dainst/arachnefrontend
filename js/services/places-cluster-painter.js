'use strict';

angular.module('arachne.services')

/*
 * @author: David Neugebauer
 * @author: Daniel de Oliveira
 */
.factory('placesClusterPainter', ['$compile', function ($compile) {

    var markerClusterGroup;
    var markers=[];
    var map;
    
    return {

        setMap : function(mp) {
          map = mp;  
        },
        
        clear : function () {
            for (var i in markers) {
                map.removeLayer(markers[i])
            }
            markers=[];
            if (markerClusterGroup) map.removeLayer(markerClusterGroup);
        },

        // create the actual places' markers
        drawPlaces : function(
            places, // : Place
            scope) {

            markerClusterGroup = new L.MarkerClusterGroup({
                iconCreateFunction: function (cluster) {

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

                    return new L.DivIcon({
                        html: '<div><span>' + entityCount + ' at ' + childCount + ' Places</span></div>',
                        className: 'marker-cluster' + c,
                        iconSize: new L.Point(40, 40)
                    });
                }
            });

            if (!places) return;



            for (var i = 0; i < places.length; i++) {
                var place = places[i];

                if (place.hasCoordinates()) {
                    // Dom-Element für Popup bauen und in Link-Funktion kompilieren
                    var html = '<div con10t-map-popup place="place"></div>';
                    var linkFunction = $compile(angular.element(html));
                    var newScope = scope.$new(true);
                    newScope.place = place;

                    // Marker-Objekt anlegen, mit DOM von ausgeführter Link-Funktion verknüpfen
                    var marker = L.marker(new L.LatLng(place.location.lat, place.location.lon), {entityCount: place.entityCount});
                    marker.bindPopup(linkFunction(newScope)[0]);
                    if (scope.clustered) {
                        markerClusterGroup.addLayer(marker);
                    } else {
                        map.addLayer(marker);
                        markers.push(marker);
                    }
                }
            }

            map.addLayer(markerClusterGroup);
        }
    }
}]);