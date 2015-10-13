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

            var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                minZoom: 3
            });

            map.addLayer(layer);
            map.trackResize = true;
            L.Icon.Default.imagePath = 'img';

            var markers = new Array;

            var loadMarkers = function() {

                var group = new L.featureGroup();
                if(scope.places){
                    console.log(scope.places);
                    for(var place in scope.places){
                        var curplace = scope.places[place];

                        var name = curplace.name;
                        var relation = curplace.relation;
                        var location = curplace.location;

                        console.log(curplace.name);
                        var title = "<b>" + relation + "</b><br/>" + name;
                        var text = name;
                        var newMarker = L.marker(new L.LatLng(location.lat, location.lon), { title: text });
                        newMarker.bindPopup(title);
                        markers.push(newMarker);
                        map.addLayer(newMarker);
                    }

                }
                var mark = L.featureGroup(markers);
                map.fitBounds(mark.getBounds());
                map.setZoom(9);

                map._onResize();
            }
            loadMarkers();

        }
    };
}]);
