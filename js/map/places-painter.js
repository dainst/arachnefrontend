'use strict';

angular.module('arachne.widgets.map')

/*
 * @author: David Neugebauer
 * @author: Daniel de Oliveira
 */
.factory('placesPainter', ['$compile', function ($compile) {

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
        },

        // create the actual places' markers
        drawPlaces : function(
            places, // : Place
            scope) {

            if (!places) return;
            
            for (var i = 0; i < places.length; i++) {
                var place = places[i];

                if (place.hasCoordinates()) {
                    // Dom-Element für Popup bauen und in Link-Funktion kompilieren
                    var html = '<div con10t-map-marker-popup place="place"></div>';
                    var linkFunction = $compile(angular.element(html));
                    var newScope = scope.$new(true);
                    newScope.place = place;

                    // Marker-Objekt anlegen, mit DOM von ausgeführter Link-Funktion verknüpfen
                    var icon = L.AwesomeMarkers.icon({
                        icon: 'record',
                        markerColor: 'cadetblue'
                    });
                    var marker = L.marker(new L.LatLng(place.location.lat, place.location.lon), {
                        icon: icon,
                        entityCount: place.entityCount
                    });
                    marker.bindPopup(linkFunction(newScope)[0]);
                    map.addLayer(marker);
                    markers.push(marker);
                }
            }
        }
    }
}]);