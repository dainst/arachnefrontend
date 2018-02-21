'use strict';

angular.module('arachne.widgets.map')

/*
 * @author: David Neugebauer
 * @author: Daniel de Oliveira
 */
.factory('placesPainter', ['$compile', 'Place', function ($compile, Place) {

    var markers = null; // used to keep track of markers for deleting them later
    var translocationLayerGroups = [];
    var map;
    var entityCallback;
    var fixedPlaces = []; // a set of fixed places given in the directive definition, which shall be shown independent of arachne-content
    var boundingBox = { // a bounding box of the fixed places
        latmin: 90,
        latmax: 0,
        lonmin: 180,
        lonmax: 0
	};

    return {

        setMap: function(mp) {
          map = mp;
        },

        setEntityCallback: function(ec) {
            entityCallback = ec;
        },

        clear: function() {
            if (markers) {
                map.removeLayer(markers);
            }
            markers = null;
            this.clearTranslocationLines();
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

        calculateMarkerColor: function(value, min, max) {
            var mid = (max - min) / 2;

            function calcValue(grd) {
                var pos1 = value <= mid ? grd[0] : grd[1];
                var pos2 = value <= mid ? grd[1] : grd[2];
                var pos = (value - (value <= mid ? min : mid)) / (value <= mid ? mid - min : (max-mid));
                pos = pos * pos;
                var len = Math.abs(pos1 - pos2);
                return parseInt((pos1 > pos2) ? pos1 - (len * pos) : pos1 + (len * pos));
            }

            function toHex(c) {
                var hex = c.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            }

            var gradient = [
                [0,   255, 255], //r
                [255, 255, 0  ], //g
                [0,   0,   0  ]  //b
            ];

            return '#' + gradient
                .map(calcValue)
                .map(toHex)
                .join("");

        },

        // create the actual places' markers
        drawPlaces: function(places, scope) {

            if (!places) return;

            markers = L.featureGroup().addTo(map);

            var mergedPlaces = fixedPlaces.concat(places);

            var maxEntityPerPlace = mergedPlaces.reduce(function(acc, cur) {
                return Math.max(cur.entityCount, acc);
            }, 1);

            for (var i = 0; i < mergedPlaces.length; i++) {
                var place = mergedPlaces[i];

                if (!place.hasCoordinates()) {
                    continue;
                }

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

                var markerType = 'default';

                var marker = new L.CircleMarker(
                    new L.LatLng(place.location.lat, place.location.lon),
                    {
                        radius:			6,
                        fillOpacity:	0.5,
                        opacity:		1,
                        weight:         1,
                        color:          '#000000',
                        className:      'circleMarker',
                        fillColor:      this.calculateMarkerColor(place.entityCount, 1, maxEntityPerPlace)
                    }
                ).addTo(markers);

                marker.on('click', function(newScope,linkFunction) {
                    var popup;
                    return function(e) {
                        if (!popup) popup = linkFunction(newScope)[0];
                        if (e.target.getPopup()) e.target.unbindPopup();
                        e.target.bindPopup(popup,{ minWidth: 150, autoPan: false });
                        e.target.openPopup();
                    };
                }(newScope,linkFunction));

            }
            markers.bringToFront();
        },

        clearTranslocationLines: function() {
            translocationLayerGroups.forEach(function(layer) {
                map.removeLayer(layer);
            });
            translocationLayerGroups = [];
        },

        drawTranslocationLines: function(places) {
            translocationLayerGroups.push(this.generateTranslocationLines(places).addTo(map));
        },

        generateTranslocationLines: function(places) {

            var translocationLayerGroup = new L.layerGroup();

            // Remove places without location value, without dates and places which have the same
            // consecutive locations
            for (var i = 0; i < places.length; i++) {
                if ((typeof places[i].location === 'undefined') ||
                    (
                        i+1 < places.length &&
                        JSON.stringify(places[i].location) === JSON.stringify(places[i+1].location)
                    )
                ) {
                    places.splice(i, 1);
                    i--; // need to decrease the loop counter because the list just got smaller and
                         // the next object has the same index as this one
                }
            }

            if (places && places.length > 1) {

                for (var i = 0; i < places.length-1; i++) {

                    var latlngs = [
                        [places[i+1].location.lat, places[i+1].location.lon, i+1],
                        [places[i].location.lat, places[i].location.lon, i]
                    ];

                    var options = {
                        weight: 1,
                        delay: 600
                    };

                    L.polyline.antPath(latlngs, options).addTo(translocationLayerGroup);

                }

            }

            return translocationLayerGroup;
        }
    }
}]);
