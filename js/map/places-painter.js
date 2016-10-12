'use strict';

angular.module('arachne.widgets.map')

/*
 * @author: David Neugebauer
 * @author: Daniel de Oliveira
 */
.factory('placesPainter', ['$compile', function ($compile) {

    var markers = null; // used to keep track of markers for deleting them later
    var map;
    var entityCallback;
    
    return {

        setMap : function(mp) {
          map = mp;  
        },

        setEntityCallback : function (ec) {
            entityCallback = ec;
        },
        
        clear : function () {
            if (markers) {
                map.removeLayer(markers);
            }
            markers = null;
        },

        // create the actual places' markers
        drawPlaces : function(
            places, // : Place
            scope) {

            if (!places) return;

            markers = L.markerClusterGroup({
                iconCreateFunction: function (cluster) {
                    var childCount = cluster.getChildCount();
                    var c = ' marker-cluster-';
                    if (childCount < 10) c += 'small';
                    else if (childCount < 50) c += 'medium';
                    else c += 'large';
                    return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
                }
            });
            map.addLayer(markers);
            
            for (var i = 0; i < places.length; i++) {
                var place = places[i];

                if (place.hasCoordinates()) {
                    // Dom-Element für Popup bauen und in Link-Funktion kompilieren
                    var html = '<div con10t-map-popup place="place" entity-callback="entityCallback"></div>';
                    var linkFunction = $compile(angular.element(html));
                    var newScope = scope.$new(true);
                    newScope.place = place;
                    newScope.entityCallback = entityCallback;

                    // Marker-Objekt anlegen, mit DOM von ausgeführter Link-Funktion verknüpfen
                    var icon = L.AwesomeMarkers.icon({
                        icon: 'record',
                        markerColor: 'cadetblue'
                    });
                    var marker = L.marker(new L.LatLng(place.location.lat, place.location.lon), {
                        icon: icon,
                        entityCount: place.entityCount,
                        title: place.name
                    });
                    marker.on('click', function(newScope,linkFunction) {
                        var popup;
                        return function(e) {
                            if (!popup) popup = linkFunction(newScope)[0];
                            if (e.target.getPopup()) e.target.unbindPopup();
                            e.target.bindPopup(popup,{ minWidth: 300, autoPan: false });
                            e.target.openPopup();
                        };
                    }(newScope,linkFunction));
                    markers.addLayer(marker);
                }
            }
        }
    }
}]);