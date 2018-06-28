'use strict';

// In order to debug your Vega spec, run the following command in your browser's console:
// view = angular.element(document.getElementsByName('map-visualization')).scope().$$childHead.layer._view
// You can then use the variable view as described in https://vega.github.io/vega/docs/api/debugging/

angular.module('arachne.visualizations.directives')
    .directive('con10tStaticVegaMap', function(){
        return {
            restrict: 'E',
            scope: {
                spec: '@',
                lat: '@',
                lng: '@',
                zoom: '@',
                name: '@'
            },
            link: function (scope, element, attrs) {

                scope.renderVega = function (spec) {
                    scope.map = L.map('map').setView([scope.lat, scope.lng], scope.zoom);

                    L.tileLayer(
                        'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=b47a3cf895b94aedad41e5cfb5222b87', { })
                        .addTo(scope.map);

                    // var icon = 'user';
                    // var awesomeMarker = L.AwesomeMarkers.icon({
                    //     icon: icon,
                    //     markerColor: 'cadetblue'
                    // });
                    //
                    // L.marker(new L.LatLng(40.7128, -74.0059), {title: 'Example Marker', icon: awesomeMarker}).addTo(scope.map)
                    //     .bindPopup('A Leaflet marker popup<br><b>(on top of Vega)</b>');

                    scope.layer = L.vega(spec, {
                       // Make sure the legend stays in place when moving (slower)
                       delayRepaint: false
                    });

                    scope.layer.addTo(scope.map);
                };

                vega.loader()
                    .load(scope.spec)
                    .then(function(data){
                        scope.renderVega(JSON.parse(data));
                    });
            }
        }
});