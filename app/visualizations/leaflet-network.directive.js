'use strict';

// In order to debug your Vega spec, run the following command in your browser's console:
// view = angular.element(document.getElementsByName('<name attribute>')).scope().$$childHead.vegaView
// You can then use the variable view as described in https://vega.github.io/vega/docs/api/debugging/

angular.module('arachne.visualizations.directives')
    .directive('con10tLeafletNetwork', ['$http', '$q', function ($http, $q) {
        return {
            restrict: 'E',
            scope: {
                connectionsDataPath: '@',
                placesDataPath: '@',
                lat: '@',
                lng: '@',
                zoom: '@'
            },
            link: function (scope, element, attrs) {
                var mapElement = element[0].querySelector('.map-container');
                scope.map = L.map( mapElement).setView([scope.lat, scope.lng], scope.zoom);

                L.tileLayer(
                    'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=b47a3cf895b94aedad41e5cfb5222b87', { })
                    .addTo(scope.map);

                scope.connectionsLayer = new L.layerGroup().addTo(scope.map);

                var icon = 'user';
                scope.awesomeMarker = L.AwesomeMarkers.icon({
                    icon: icon,
                    markerColor: 'cadetblue'
                });

                scope.connections = [];
                scope.places = {};
                scope.activePlace = null;

                var dataQueries = [];

                dataQueries.push($http.get(scope.placesDataPath));
                dataQueries.push($http.get(scope.connectionsDataPath));

                $q.all(dataQueries)
                    .then(function(responses){

                        scope.places = scope.parsePlacesData(responses[0].data);
                        scope.connections = scope.parseConnectionsData(responses[1].data);

                        scope.showPlaces();
                        // scope.showAllConnections();
                    });

                scope.parsePlacesData = function(data){
                    var places = {};
                    var lines = data.split('\n');

                    var column_headings = lines[0].split(',');

                    var id_index = column_headings.indexOf('id');
                    var latitude_index = column_headings.indexOf('lat');
                    var longitude_index = column_headings.indexOf('lng');
                    var label_index = column_headings.indexOf('label');

                    var line_index = 1;
                    while (line_index < lines.length) {
                        var values = lines[line_index].split(',');

                        if(values.length !== column_headings.length){
                            // console.dir(values) TODO: Parse string fields containing ","
                            line_index += 1;
                            continue
                        }

                        var place = {
                            'label': values[label_index],
                            'lat': values[latitude_index],
                            'lng': values[longitude_index]
                        };

                        if (place.lat !== 'null' && place.lat !== undefined
                            && place.lng !== 'null' && place.lng !== undefined)
                            places[values[id_index]] = place;
                        line_index += 1
                    }

                    return places
                };

                scope.showPlaces = function() {
                    for(var key in scope.places){
                        L.marker(
                            new L.LatLng(
                                scope.places[key].lat, scope.places[key].lng
                            ),
                            {
                                title: scope.places[key].label, icon: scope.awesomeMarker, placeId: key
                            })
                            .addTo(scope.map)
                            .on('click ', function (event) {
                                scope.activePlace = event.sourceTarget.options.placeId;
                                scope.showActiveConnections();
                                console.dir(scope.activePlace)
                            });
                    }
                };

                scope.parseConnectionsData = function (data) {

                    var connections = [];
                    var lines = data.split('\n');

                    var columnHeadings = lines[0].split(',');
                    var originIndex = columnHeadings.indexOf('"origin_id"');
                    var receptionIndex = columnHeadings.indexOf('"reception_id"');
                    var weightIndex = columnHeadings.indexOf('"letter_count"');

                    var lineIndex = 1;
                    while(lineIndex < lines.length) {
                        var values = lines[lineIndex].split(',');

                        var origin = scope.places[values[originIndex]];
                        var reception = scope.places[values[receptionIndex]];

                        if(origin === undefined || reception === undefined){
                            lineIndex += 1;
                            continue;
                        }

                        var connection = {
                            'origin': {
                                'lat': origin['lat'],
                                'lng': origin['lng'],
                                'placeId': values[originIndex]
                            },
                            'reception': {
                                'lat': reception['lat'],
                                'lng': reception['lng'],
                                'placeId': values[receptionIndex]
                            },
                            'weight': values[weightIndex]
                        };
                        connections.push(connection);
                        lineIndex += 1

                    }
                    return connections
                };

                scope.showAllConnections = function () {

                    var translocationLayerGroup = new L.layerGroup();

                    for (var index in scope.connections){
                        var connection = scope.connections[index];

                        var latlngs = [
                            L.LatLng(connection.origin.lat, connection.origin.lng),
                            L.LatLng(connection.reception.lat, connection.reception.lng)
                        ];

                        var offset = Math.log(connection.weight) + 1;

                        var options = {
                            weight: offset * 2,
                            offset: offset,
                            delay: 800,
                            dashArray:[25,20]
                        };

                        L.polyline.antPath(latlngs, options).addTo(translocationLayerGroup);

                    }

                    translocationLayerGroup.addTo(scope.map)

                };

                scope.showActiveConnections = function () {

                    var activeOutgoingConnections = [];
                    var activeIncomingConnections = [];

                    for (var idx in scope.connections){
                        if(scope.connections[idx]['origin']['placeId'] === scope.activePlace){
                            activeOutgoingConnections.push(scope.connections[idx])
                        }
                        if(scope.connections[idx]['reception']['placeId'] === scope.activePlace){
                            activeIncomingConnections.push(scope.connections[idx])
                        }
                    }
                    scope.map.removeLayer(scope.connectionsLayer)
                    scope.connectionsLayer = new L.layerGroup()

                    for (var index in activeOutgoingConnections) {
                        var connection = activeOutgoingConnections[index];

                        var latlngs = [
                            [connection.origin.lat, connection.origin.lng, index+1],
                            [connection.reception.lat, connection.reception.lng, index]
                        ];

                        var offset = Math.log(connection.weight) + 1;

                        var options = {
                            weight: offset * 2,
                            offset: offset,
                            delay: 800,
                            dashArray:[25,20]
                        };

                        L.polyline.antPath(latlngs, options).addTo(scope.connectionsLayer);
                    }

                    for (var index in activeIncomingConnections){
                        var connection = activeIncomingConnections[index];

                        var latlngs = [
                            [connection.origin.lat, connection.origin.lng, index+1],
                            [connection.reception.lat, connection.reception.lng, index]
                        ];

                        var offset = Math.log(connection.weight) + 1;

                        var options = {
                            weight: offset * 2,
                            offset: offset,
                            delay: 800,
                            dashArray:[25,20],
                            color: 'red'
                        };

                        L.polyline.antPath(latlngs, options).addTo(scope.connectionsLayer);
                    }

                    scope.connectionsLayer.addTo(scope.map);
                };
            }
        }
    }]);