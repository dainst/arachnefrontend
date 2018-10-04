'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tNetworkMap', ['$http', '$q', '$filter', '$compile', 'transl8',
        function ($http, $q, $filter, $compile, transl8) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-network-map.html',
            scope: {
                lat: '@',
                lng: '@',
                zoom: '@',
                places: '=',
                connections: '=',
                selectedPlaceId: '='
            },
            link: function (scope, element, attrs) {
                scope.text = '...'
                transl8.onLoaded().then(function() {
                    scope.text = transl8.getTranslation('ui_reset');
                });

                var mapElement = element[0].querySelector('.map-container');
                scope.map = L.map( mapElement).setView([scope.lat, scope.lng], scope.zoom);

                L.tileLayer(
                    'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=b47a3cf895b94aedad41e5cfb5222b87', { })
                    .addTo(scope.map);

                scope.placeLayer = new L.LayerGroup().addTo(scope.map);
                scope.connectionsLayer = new L.LayerGroup().addTo(scope.map);
                scope.previouslySelectedPlaceId = null;

                scope.$watch('selectedPlaceId', function(newValue, oldValue) {
                    scope.evaluateState();
                });

                scope.$watch('places', function(newValue, oldValue) {
                    scope.evaluateState();
                });

                var DeselectControl = L.Control.extend({
                    options: {
                        position: 'topright'
                    },
                    onAdd: function(map) {
                        var container = document.createElement("div");

                        container.classList.add('leaflet-bar', 'leaflet-control', 'leaflet-control-custom');
                        container.innerHTML = scope.text;

                        container.style.backgroundColor = 'white';
                        container.style.padding = '5px';
                        container.style.cursor = 'pointer';

                        container.onclick = function () {
                            scope.selectedPlaceId = null;
                            scope.evaluateState();
                        };
                        return container;
                    }
                });

                scope.map.addControl(new DeselectControl());

                scope.evaluateState = function() {

                    if(typeof scope.places === 'undefined' || scope.connections === 'undefined')
                        return;

                    scope.evaluateVisiblePlaces();
                    scope.evaluateVisibleConnections();

                    scope.renderPlaces();
                    scope.renderConnections();

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
                };

                scope.evaluateVisiblePlaces = function() {
                    scope.visiblePlaces = [];

                    var weights = {};
                    for(var i = 0; i < scope.connections.length; i++){
                        var connection = scope.connections[i];

                        if (connection[0] in weights) {
                            weights[connection[0]] += 1;
                        } else {
                            weights[connection[0]] = 1;
                        }
                    }

                    for(var i = 0; i < scope.places.length; i++) {
                        scope.visiblePlaces.push({
                            'data': scope.places[i],
                            'weight': weights[scope.places[i]['id']]
                        })
                    }
                };

                scope.evaluateVisibleConnections = function() {
                    scope.visibleConnections = [];

                    for(var i = 0; i < scope.connections.length; i++){
                        var connection = scope.connections[i];

                        var connectionId = scope.constructConnectionKey(connection[0], connection[1]);
                        if(connectionId in scope.visibleConnections){
                            scope.visibleConnections[connectionId] += 1
                        } else {
                            scope.visibleConnections[connectionId] = 1
                        }
                    }
                };

                scope.renderPlaces = function() {
                    if(typeof scope.places === 'undefined') {
                        console.log('No places to render...');
                        return;
                    }

                    scope.map.removeLayer(scope.placeLayer);
                    scope.placeLayer = new L.LayerGroup();

                    for(var i = 0; i < scope.visiblePlaces.length; i++){
                        var weight = scope.visiblePlaces[i]['weight'];
                        var place = scope.visiblePlaces[i]['data'];
                        if(place['lat'] === 'null'
                            || place['lng'] === 'null'
                            || typeof weight === 'undefined'
                        ) continue;

                        var coordinates = new L.LatLng(place['lat'], place['lng']);
                        var params = {
                            title: place['name'],
                            radius: (Math.log(weight)  + 1)* 10000,
                            id: place['id']
                        };

                        if(place['id'] === scope.selectedPlaceId){
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
                            place['id'] === scope.selectedPlaceId
                            && scope.selectedPlaceId !== scope.previouslySelectedPlaceId) {
                            scope.currentPopup = new L.Popup({ closeOnClick: false, minWidth : 250 })
                                .setLatLng([place['lat'], place['lng']]);
                        }
                    }

                    scope.placeLayer.addTo(scope.map);
                };

                scope.renderConnections = function () {

                    scope.activeOutgoingConnections = [];
                    scope.activeIncomingConnections = [];

                    for (var idx in scope.visibleConnections){
                        var originId, destinationId;

                        var split = scope.deconstructConnectionKey(idx);
                        originId = split[0];
                        destinationId = split[1];

                        var origin = scope.getPlaceById(originId);
                        var destination = scope.getPlaceById(destinationId);

                        if (originId === scope.selectedPlaceId) {
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

                    scope.map.removeLayer(scope.connectionsLayer);
                    scope.connectionsLayer = new L.LayerGroup();

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

                        L.polyline(latlngs, options).addTo(scope.connectionsLayer);
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

                        L.polyline(latlngs, options).addTo(scope.connectionsLayer);
                    }

                    if(scope.currentPopup
                        && scope.selectedPlaceId != null
                        && (scope.activeIncomingConnections.length > 0 || scope.activeOutgoingConnections.length > 0)) {
                        var popContent =
                            $compile
                            (
                                '<con10t-network-map-popup ' +
                                'active-incoming-connections="activeIncomingConnections" ' +
                                'active-outgoing-connections="activeOutgoingConnections" ' +
                                'selected-place-id="selectedPlaceId" ' +
                                'selection-callback="setSelectedPlaceId(id)" ' +
                                'place-data-callback="getPlaceById(id)">' +
                                '</con10t-network-map-popup>'
                            )
                            (scope);

                        scope.currentPopup
                            .setContent(popContent[0])
                            .addTo(scope.placeLayer);
                    }
                    scope.connectionsLayer.addTo(scope.map);
                };


                scope.setSelectedPlaceId = function(id) {
                    scope.previouslySelectedPlaceId = scope.selectedPlaceId;
                    scope.selectedPlaceId = id;

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
                };

                scope.getPlaceById = function(id) {
                    return scope.places.filter(function(place){
                        return place['id'] === id;
                    })[0]
                };

                scope.constructConnectionKey = function(originId, destinationId) {
                    return originId + ':::' + destinationId;
                };

                scope.deconstructConnectionKey = function (id) {
                    return id.split(':::')
                };
            }
        }
    }]);