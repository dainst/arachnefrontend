'use strict';

angular.module('arachne.directives')

/**
 *
 */
.directive('entitymap', ['$location', '$filter',
function($location, $filter) {
    return {
        restrict: 'A',
        scope: {
            places:"="
        },
        link: function(scope, element, attrs) {

            var map = L.map('entitymap').setView([40, -10], 3);

            var layer = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
                maxZoom: 18,
                minZoom: 2
            });

            map.addLayer(layer);
            map.trackResize = true;
            L.Icon.Default.imagePath = 'img';

            var markers = new Array;

            var loadMarkers = function() {

                var group = new L.featureGroup();
                if(scope.places){
                    for(var place in scope.places){
                        var curplace = scope.places[place];

                        var name = curplace.name;
                        var relation = curplace.relation;
                        var location = curplace.location;

                        var title = "";
                        if (relation) title += "<b>" + relation + "</b><br/>";
                        title += "<a href='http://gazetteer.dainst.org/place/" + curplace.gazetteerId
                            + "' target='_blank'>" + name + "</a>";
                        var text = name;
                        var newMarker = L.marker(new L.LatLng(location.lat, location.lon), { title: text });
                        newMarker.bindPopup(title);
                        markers.push(newMarker);
                        map.addLayer(newMarker);
                    }

                }
                var mark = L.featureGroup(markers);

                // workaround, see https://github.com/Leaflet/Leaflet/issues/2021
                map.whenReady(function () {
                    window.setTimeout(function () {
                        if (markers.length > 1) map.fitBounds(mark.getBounds(), { padding: [20, 20] });
                        else map.fitBounds(mark.getBounds(), { maxZoom: 5 });
                    }.bind(this), 200);
                }, this);

                map._onResize();
            }
            loadMarkers();

        }
    };
}]);
