'use strict';

// In order to debug your Vega spec, run the following command in your browser's console:
// view = angular.element(document.getElementsByName('<name attribute>')).scope().$$childHead.vegaView
// You can then use the variable view as described in https://vega.github.io/vega/docs/api/debugging/

angular.module('arachne.visualizations.directives')
    .directive('con10tLeafletNetwork', ['$http', '$q', function ($http, $q) {
        return {
            restrict: 'E',
            scope: {
                placesDataPath: '@',
                letterDataPath: '@',
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

                scope.mindatePicker = document.querySelector('#min-date-picker');
                scope.maxdatePicker = document.querySelector('#max-date-picker');

                scope.connectionsLayer = new L.layerGroup().addTo(scope.map);
                scope.connections = [];
                scope.selectedPlace = null;
                scope.displayedPlaces = [];

                var dataQueries = [];

                dataQueries.push($http.get(scope.placesDataPath));
                dataQueries.push($http.get(scope.letterDataPath));

                $q.all(dataQueries)
                    .then(function(responses){

                        scope.placeData = scope.parseTsvData(responses[0].data);
                        scope.letterData = scope.parseTsvData(responses[1].data);

                        scope.placeIndexById = scope.createIndex(scope.placeData, 'id');
                        scope.letterIndexById = scope.createIndex(scope.letterData, 'id');

                        scope.accumulateConnectionsData();
                        scope.getMinMaxDates();
                        scope.updateState();
                        scope.showPlaces();
                    });

                scope.parseTsvData = function(data){
                    var parsedRows = [];
                    var lines = data.split('\n');

                    var headings = lines[0].split('\t');

                    var line_index = 1;
                    while (line_index < lines.length && lines[line_index].trim() !== '') {
                        var parsedLine = {};
                        var values = lines[line_index].split('\t');

                        var columnIndex = 0;

                        while (columnIndex < headings.length) {
                            parsedLine[headings[columnIndex]] = values[columnIndex];
                            columnIndex += 1;
                        }

                        parsedRows.push(parsedLine);
                        line_index += 1
                    }

                    return parsedRows
                };

                scope.createIndex = function (data, indexKey){
                    var index = {};

                    var i = 0;
                    while(i < data.length) {
                        index[data[i][indexKey]] = i;
                        i += 1;
                    }

                    return index;
                };

                scope.updateState = function(){
                    scope.displayedPlaces = [];
                    scope.selectedPlace = null;

                    var weights = {};
                    var display = [];

                    for(var i = 0; i < scope.letterData.length; i++){
                        var currentLetter = scope.letterData[i];
                        if(Date.parse(currentLetter['origin_date_from']) < scope.minDate
                            || Date.parse(currentLetter['origin_date_to']) > scope.maxDate) {
                            continue;
                        }

                        var originPlace =
                            scope.placeData[
                                scope.placeIndexById[
                                    scope.letterData[i]['origin_id']
                                    ]
                                ];

                        var destinationPlace =
                            scope.placeData[
                                scope.placeIndexById[
                                    scope.letterData[i]['destination_id']
                                    ]
                                ];

                        if(!display.includes(originPlace['id'])){
                            display.push(originPlace['id']);
                        }

                        if(!display.includes(destinationPlace['id'])){
                            display.push(destinationPlace['id']);
                        }

                        if(typeof originPlace !== 'undefined') {
                            if (originPlace['id'] in weights) {
                                weights[originPlace['id']] += 1;
                            } else {
                                weights[originPlace['id']] = 1;
                            }
                        }
                    }

                    for(var i = 0; i < display.length; i++) {
                        scope.displayedPlaces.push({
                            'id': display[i],
                            'weight': weights[display[i]]
                        })

                    }
                };

                scope.accumulateConnectionsData = function () {

                    for(var i = 0; i < scope.letterData.length; i++){

                        var originPlace =
                            scope.placeData[
                                scope.placeIndexById[
                                    scope.letterData[i]['origin_id']
                                ]
                            ];

                        var destinationPlace =
                            scope.placeData[
                                scope.placeIndexById[
                                    scope.letterData[i]['destination_id']
                                ]
                            ];

                        if(
                            typeof originPlace !== 'undefined'
                            && typeof destinationPlace !== 'undefined'
                        ) {
                            var connectionId = scope.combineConnectionId(originPlace['id'], destinationPlace['id']);
                            if(connectionId in scope.connections){
                                scope.connections[connectionId] += 1
                            } else {
                                scope.connections[connectionId] = 1
                            }
                        }
                    }
                };

                scope.getMinMaxDates = function(){
                  scope.minDate = new Date(8640000000000000);
                  scope.maxDate = new Date(-8640000000000000);

                  for(var i = 0; i < scope.letterData.length; i++){
                      var current = scope.letterData[i];

                      if(new Date(current['origin_date_from']) < scope.minDate){
                          scope.minDate = new Date(current['origin_date_from'])
                      }

                      if(new Date(current['origin_date_to']) > scope.maxDate) {
                          scope.maxDate = new Date(current['origin_date_to'])
                      }
                  }

                  scope.mindatePicker.min = Date.parse(scope.minDate);
                  scope.mindatePicker.max = Date.parse(scope.maxDate);
                  scope.mindatePicker.value = scope.mindatePicker.min;

                  scope.maxdatePicker.min = Date.parse(scope.minDate);
                  scope.maxdatePicker.max = Date.parse(scope.maxDate);
                  scope.maxdatePicker.value = scope.maxdatePicker.max;
                };

                scope.showPlaces = function() {
                    for(var i = 0; i < scope.displayedPlaces.length; i++){
                        var currentId = scope.displayedPlaces[i]['id'];
                        var currentWeight = scope.displayedPlaces[i]['weight'];

                        var place = scope.placeData[
                                scope.placeIndexById[currentId]
                            ];

                        if(place['lat'] === 'null'
                            || place['lng'] === 'null'
                            || typeof currentWeight === 'undefined'
                        ) continue;

                        L.circle(
                            new L.LatLng(
                                place['lat'], place['lng']
                            ),

                            {
                                title: place['title'],
                                radius: (Math.log(currentWeight)  + 1)* 10000,
                                id: place['id']
                            }
                        )
                            .addTo(scope.map)
                            .on('click ', function (event) {
                                scope.selectedPlace = event.sourceTarget.options.id;
                                scope.showConnectionsForSelectedPlace();
                            });
                    }
                };

                scope.combineConnectionId = function(originId, destinationId) {
                    return originId + '-' + destinationId;
                };

                scope.splitConnectionId = function (id) {
                    return id.split('-')
                };

                scope.showConnectionsForSelectedPlace = function () {

                    var activeOutgoingConnections = [];
                    var activeIncomingConnections = [];

                    for (var idx in scope.connections){
                        var originId, destinationId;

                        var split = scope.splitConnectionId(idx);
                        originId = split[0];
                        destinationId = split[1];

                        if (originId === scope.selectedPlace) {

                            var origin = scope.placeData[scope.placeIndexById[originId]];
                            var destination = scope.placeData[scope.placeIndexById[destinationId]];

                            if(
                                origin['lat'] !== 'null'
                                && origin['lng'] !== 'null'
                                && destination['lat'] !== 'null'
                                && destination['lng'] !== 'null'
                            ) {
                                activeOutgoingConnections.push(
                                    {
                                        'weight': scope.connections[idx],
                                        'origin': {
                                            'lat': origin['lat'],
                                            'lng': origin['lng'],
                                            'name': origin['name']
                                        },
                                        'destination': {
                                            'lat': destination['lat'],
                                            'lng': destination['lng'],
                                            'name': destination['name']
                                        }
                                    }
                                );
                            }
                        }

                        if (destinationId === scope.selectedPlace) {
                            var origin = scope.placeData[scope.placeIndexById[originId]];
                            var destination = scope.placeData[scope.placeIndexById[destinationId]];

                            if(
                                origin['lat'] !== 'null'
                                && origin['lng'] !== 'null'
                                && destination['lat'] !== 'null'
                                && destination['lng'] !== 'null'
                            ) {
                                activeIncomingConnections.push(
                                    {
                                        'weight': scope.connections[idx],
                                        'origin': {
                                            'lat': origin['lat'],
                                            'lng': origin['lng'],
                                            'name': origin['name']
                                        },
                                        'destination': {
                                            'lat': destination['lat'],
                                            'lng': destination['lng'],
                                            'name': destination['name']
                                        }
                                    }
                                );
                            }
                        }
                    }

                    scope.map.removeLayer(scope.connectionsLayer);
                    scope.connectionsLayer = new L.layerGroup();

                    for (var idx in activeOutgoingConnections) {
                        var connection = activeOutgoingConnections[idx];

                        var latlngs = [
                            new L.LatLng(connection['origin']['lat'], connection['origin']['lng']),
                            new L.LatLng(connection['destination']['lat'], connection['destination']['lng'])
                        ];

                        var offset = Math.log(connection['weight']) + 1;

                        var options = {
                            weight: offset * 2,
                            offset: offset,
                            delay: 800,
                            dashArray:[25,20]
                        };

                        L.polyline.antPath(latlngs, options).addTo(scope.connectionsLayer);
                    }

                    for (var idx in activeIncomingConnections) {
                        var connection = activeIncomingConnections[idx];

                        var latlngs = [
                            new L.LatLng(connection['origin']['lat'], connection['origin']['lng']),
                            new L.LatLng(connection['destination']['lat'], connection['destination']['lng'])
                        ];

                        var offset = Math.log(connection['weight']) + 1;

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