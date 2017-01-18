'use strict';

angular.module('arachne.widgets.map')

/*
 * @author: David Neugebauer
 * @author: Daniel de Oliveira
 */
.factory('placesPainter', ['$compile', 'Place', function ($compile, Place) {

    var markers = null; // used to keep track of markers for deleting them later
    var map;
    var entityCallback;
	var fixedPlaces = []; // a set of fixed places given in the directive definition, which shall be shown independent of arachne-content
    var boundingBox = { // a bounding box of the fixed places
		latmin: 90,
		latmax: 0,
		lonmin: 180,
		lonmax: 0
	}

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

		setFixedPlaces: function placesPainter_setFixedPlaces(places) {
            if (typeof places !== "object") {
                return;
            }

            angular.forEach(places, function(p) {

               var place = new Place();
               place.location = p.location;
               place.name = p.name;
               place.entityCount = 0;
               place.gazetteerId = p.gazetteerId;
               place.text = p.text;
               place.isFixed = true;

               boundingBox.latmin = Math.min(place.location.lat, boundingBox.latmin);
               boundingBox.latmax = Math.max(place.location.lat, boundingBox.latmax);
               boundingBox.lonmin = Math.min(place.location.lon, boundingBox.lonmin);
               boundingBox.lonmax = Math.max(place.location.lon, boundingBox.lonmax);

               fixedPlaces.push(place);
            });
        },

        getFixedPlacesBoundingBox: function placesPainter_getFixedPlaces() {
            return (fixedPlaces.length) ? boundingBox : false;
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

            var mergedPlaces = fixedPlaces.concat(places);
            
            for (var i = 0; i < mergedPlaces.length; i++) {
                var place = mergedPlaces[i];

                if (place.hasCoordinates()) {
					// Dom-Element für Popup bauen und in Link-Funktion kompilieren
                    var newScope = scope.$new(true);

                    newScope.place = place;
                    if (place.isFixed === true) {
						var linkFunction = function(scope) {
						    var title = (scope.place.gazetteerId) ?
                                '<strong><a href="https://gazetteer.dainst.org/app/#!/show/' + scope.place.gazetteerId + '" target="_blank">' + scope.place.name + '</a></strong>' :
								'<strong>' + scope.place.name + '</strong>';
                            var body = (scope.place.text) ?
                                '<p>' + scope.place.text + '</p>' :
                                '';
						    return [title + body];
                        }
                    } else {
						var html = '<div con10t-map-popup place="place" entity-callback="entityCallback"></div>';
						var linkFunction = $compile(angular.element(html));
						newScope.entityCallback = entityCallback;
                    }

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
                            e.target.bindPopup(popup,{ minWidth: 150, autoPan: false });
                            e.target.openPopup();
                        };
                    }(newScope,linkFunction));
                    markers.addLayer(marker);
                }
            }
        }
    }
}]);