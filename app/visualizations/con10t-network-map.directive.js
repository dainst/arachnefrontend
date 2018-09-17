'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tNetworkMap', ['$http', '$q', '$filter', '$compile', function ($http, $q, $filter, $compile) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-network-map.html',
            scope: {
                placesDataPath: '@',
                objectDataPath: '@',
                showControls: '@',
                lat: '@',
                lng: '@',
                zoom: '@',
                minDate: '=',
                maxDate: '='
            },
            link: function (scope, element, attrs) {
                scope.placesDataColumns = [
                    'id', 'lat', 'lng', 'name', 'authId', 'authSource'
                ];

                scope.objectDataColumns = [
                    'id', 'timespanFrom', 'timespanTo', 'originPlaceId', 'destinationPlaceId'
                ];

                var mapElement = element[0].querySelector('.map-container');
                scope.map = L.map( mapElement).setView([scope.lat, scope.lng], scope.zoom);

                L.tileLayer(
                    'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=b47a3cf895b94aedad41e5cfb5222b87', { })
                    .addTo(scope.map);

                scope.mindatePicker = document.querySelector('#min-date-picker');
                scope.maxdatePicker = document.querySelector('#max-date-picker');
                scope.dateDisplay = document.querySelector('#date-range-display');

                scope.mindatePicker.oninput = function(){
                    scope.setMinDate(scope.mindatePicker.value);
                };

                scope.maxdatePicker.oninput = function(){
                    scope.setMaxDate(scope.maxdatePicker.value);
                };

                scope.visibleConnectionsLayer = new L.LayerGroup().addTo(scope.map);
                scope.placeLayer = new L.LayerGroup().addTo(scope.map);
                scope.visibleConnections = [];
                scope.selectedPlaceId = null;
                scope.displayedPlaces = [];

                var dataQueries = [];

                dataQueries.push($http.get(scope.placesDataPath));
                dataQueries.push($http.get(scope.objectDataPath));

                $q.all(dataQueries)
                    .then(function(responses){
                        scope.placeData =  $filter('tsvData')(responses[0].data, scope.placesDataColumns);
                        scope.objectData = $filter('tsvData')(responses[1].data, scope.objectDataColumns);

                        scope.placeIndexById = scope.createIndex(scope.placeData, 'id');
                        scope.objectIndexById = scope.createIndex(scope.objectData, 'id');

                        scope.evaluateOverallDateRange();
                        scope.evaluateState();

                        scope.$watch('minDate', function(newValue, oldValue) {
                            scope.evaluateState();
                        });

                        scope.$watch('maxDate', function(newValue, oldValue) {
                            scope.evaluateState();
                        });

                        scope.$watch('selectedPlaceId', function(newValue, oldValue) {
                            scope.evaluateState();
                        });
                    });

                // Takes TSV data object and creates a lookup-index based on the values behind the given key
                scope.createIndex = function (data, indexKey){
                    var index = {};

                    var i = 0;
                    while(i < data.length) {
                        index[data[i][indexKey]] = i;
                        i += 1;
                    }

                    return index;
                };

                scope.evaluateOverallDateRange = function(){
                    scope.minDate = new Date(8640000000000000);
                    scope.maxDate = new Date(-8640000000000000);

                    for(var i = 0; i < scope.objectData.length; i++){
                        var current = scope.objectData[i];

                        if(new Date(current['timespanFrom']) < scope.minDate){
                            scope.minDate = new Date(current['timespanFrom'])
                        }

                        if(new Date(current['timespanTo']) > scope.maxDate) {
                            scope.maxDate = new Date(current['timespanTo'])
                        }
                    }

                    scope.mindatePicker.min = Date.parse(scope.minDate);
                    scope.mindatePicker.max = Date.parse(scope.maxDate);
                    scope.mindatePicker.value = scope.mindatePicker.min;

                    scope.maxdatePicker.min = Date.parse(scope.minDate);
                    scope.maxdatePicker.max = Date.parse(scope.maxDate);
                    scope.maxdatePicker.value = scope.maxdatePicker.max;
                };

                scope.evaluateState = function(){

                    scope.evaluateVisiblePlaces();
                    scope.evaluateVisibleConnections();

                    scope.showPlaces();
                    scope.showConnectionsForSelectedPlace();

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
                };

                scope.evaluateVisiblePlaces = function() {
                    scope.visiblePlaces = [];

                    var weights = {};
                    var display = [];


                    for(var i = 0; i < scope.objectData.length; i++){
                        var currentObject = scope.objectData[i];
                        if(Date.parse(currentObject['timespanFrom']) < scope.minDate
                            || Date.parse(currentObject['timespanTo']) > scope.maxDate) {
                            continue;
                        }

                        var originPlace =
                            scope.placeData[
                                scope.placeIndexById[
                                    scope.objectData[i]['originPlaceId']
                                    ]
                                ];

                        var destinationPlace =
                            scope.placeData[
                                scope.placeIndexById[
                                    scope.objectData[i]['destinationPlaceId']
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
                        scope.visiblePlaces.push({
                            'id': display[i],
                            'weight': weights[display[i]]
                        })
                    }
                };

                scope.evaluateVisibleConnections = function() {
                    scope.visibleConnections = [];
                    for(var i = 0; i < scope.objectData.length; i++){
                        var currentObject = scope.objectData[i];

                        if(Date.parse(currentObject['timespanFrom']) < scope.minDate
                            || Date.parse(currentObject['timespanTo']) > scope.maxDate
                        ){
                            continue;
                        }

                        var originPlace =
                            scope.placeData[
                                scope.placeIndexById[
                                    currentObject['originPlaceId']
                                ]
                            ];

                        var destinationPlace =
                            scope.placeData[
                                scope.placeIndexById[
                                    currentObject['destinationPlaceId']
                                ]
                            ];

                        if(
                            typeof originPlace !== 'undefined'
                            && typeof destinationPlace !== 'undefined'
                        ) {
                            var connectionId = scope.constructConnectionKey(originPlace['id'], destinationPlace['id']);
                            if(connectionId in scope.visibleConnections){
                                scope.visibleConnections[connectionId] += 1
                            } else {
                                scope.visibleConnections[connectionId] = 1
                            }
                        }
                    }
                };

                scope.showPlaces = function() {

                    scope.map.removeLayer(scope.placeLayer);
                    scope.placeLayer = new L.LayerGroup();

                    for(var i = 0; i < scope.visiblePlaces.length; i++){
                        var currentId = scope.visiblePlaces[i]['id'];
                        var currentWeight = scope.visiblePlaces[i]['weight'];

                        var place = scope.placeData[
                                scope.placeIndexById[currentId]
                            ];

                        if(place['lat'] === 'null'
                            || place['lng'] === 'null'
                            || typeof currentWeight === 'undefined'
                        ) continue;

                        var coordinates = new L.LatLng(place['lat'], place['lng']);
                        var params = {
                            title: place['title'],
                            radius: (Math.log(currentWeight)  + 1)* 10000,
                            id: place['id']
                        };

                        if(currentId === scope.selectedPlaceId){
                            params['color'] = 'red';
                            params['fillColor'] = '#f03';
                        }

                        var circle = L.circle(coordinates, params);

                        circle
                            .addTo(scope.placeLayer)
                            .on('click ', function (event) {
                                scope.setSelectedPlaceId(event.sourceTarget.options.id);
                            });

                        if(
                            currentId === scope.selectedPlaceId
                            && scope.selectedPlaceId !== scope.previouslySelectedPlaceId) {
                            scope.currentPopup = new L.Popup({ closeOnClick: false, minWidth : 250 })
                                .setLatLng([place['lat'], place['lng']]);
                        }
                    }

                    scope.placeLayer.addTo(scope.map);
                };

                scope.showConnectionsForSelectedPlace = function () {

                    scope.activeOutgoingConnections = [];
                    scope.activeIncomingConnections = [];

                    for (var idx in scope.visibleConnections){
                        var originId, destinationId;

                        var split = scope.deconstructConnectionKey(idx);
                        originId = split[0];
                        destinationId = split[1];

                        if (originId === scope.selectedPlaceId) {

                            var origin = scope.placeData[scope.placeIndexById[originId]];
                            var destination = scope.placeData[scope.placeIndexById[destinationId]];

                            if(
                                origin['lat'] !== 'null'
                                && origin['lng'] !== 'null'
                                && destination['lat'] !== 'null'
                                && destination['lng'] !== 'null'
                            ) {
                                scope.activeOutgoingConnections.push(
                                    {
                                        'weight': scope.visibleConnections[idx],
                                        'origin': origin,
                                        'destination': destination
                                    }
                                );
                            }
                        }

                        if (destinationId === scope.selectedPlaceId) {
                            var origin = scope.placeData[scope.placeIndexById[originId]];
                            var destination = scope.placeData[scope.placeIndexById[destinationId]];

                            if(
                                origin['lat'] !== 'null'
                                && origin['lng'] !== 'null'
                                && destination['lat'] !== 'null'
                                && destination['lng'] !== 'null'
                            ) {
                                scope.activeIncomingConnections.push(
                                    {
                                        'weight': scope.visibleConnections[idx],
                                        'origin': origin,
                                        'destination': destination
                                    }
                                );
                            }
                        }
                    }

                    scope.map.removeLayer(scope.visibleConnectionsLayer);
                    scope.visibleConnectionsLayer = new L.LayerGroup();

                    for (var idx in scope.activeOutgoingConnections) {
                        var connection = scope.activeOutgoingConnections[idx];

                        var latlngs = [
                            new L.LatLng(connection['origin']['lat'], connection['origin']['lng']),
                            new L.LatLng(connection['destination']['lat'], connection['destination']['lng'])
                        ];

                        var offset = Math.log(connection['weight']) + 1;

                        var options = {
                            weight: offset * 2,
                            offset: offset,
                            delay: 600,
                            opacity: 0.5,
                            color: 'red'
                        };

                        L.polyline(latlngs, options).addTo(scope.visibleConnectionsLayer);
                    }

                    for (var idx in scope.activeIncomingConnections) {
                        var connection = scope.activeIncomingConnections[idx];

                        var latlngs = [
                            new L.LatLng(connection['origin']['lat'], connection['origin']['lng']),
                            new L.LatLng(connection['destination']['lat'], connection['destination']['lng'])
                        ];

                        var offset = Math.log(connection['weight']) + 1;

                        var options = {
                            weight: offset * 2,
                            offset: offset,
                            delay: 600,
                            opacity: 0.5
                        };

                        L.polyline(latlngs, options).addTo(scope.visibleConnectionsLayer);
                    }


                    if(scope.currentPopup) {
                        var popContent = $compile(
                            '<con10t-network-map-popup ' +
                            'active-incoming-connections="activeIncomingConnections" ' +
                            'active-outgoing-connections="activeOutgoingConnections" ' +
                            'selection-callback="setSelectedPlaceId(id)"></con10t-network-map-popup>')(scope);
                        scope.currentPopup
                            .setContent(popContent[0])
                            .addTo(scope.placeLayer);

                    }
                    scope.visibleConnectionsLayer.addTo(scope.map);
                };

                scope.constructConnectionKey = function(originId, destinationId) {
                    return originId + ':::' + destinationId;
                };

                scope.deconstructConnectionKey = function (id) {
                    return id.split(':::')
                };

                scope.setMinDate = function(value) {
                    if(value < scope.maxdatePicker.value) {
                        scope.maxdatePicker.value = value;
                        scope.mindatePicker.value = scope.minDate;
                        scope.setMaxDate(value)
                    } else {
                        scope.minDate = new Date(Number(value));
                        scope.evaluateState();
                    }
                };

                scope.setMaxDate = function(value) {
                    if(value > scope.mindatePicker.value) {
                        scope.mindatePicker.value = value;
                        scope.maxdatePicker.value = scope.maxDate;
                        scope.setMinDate(value);
                    } else {
                        scope.maxDate = new Date(Number(value));
                        scope.evaluateState();
                    }
                };

                scope.setSelectedPlaceId = function(id) {
                    scope.previouslySelectedPlaceId = scope.selectedPlaceId;
                    scope.selectedPlaceId = id;

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
                }
            }
        }
    }]);