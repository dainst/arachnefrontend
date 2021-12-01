'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tNetworkMapPopup', ['$http', '$q', '$filter', function ($http, $q, $filter) {
        return {
            restrict: 'E',
            template: require('./con10t-network-map-popup.html'),
            scope: {
                activeIncomingConnections: '=',
                activeOutgoingConnections: '=',
                selectedPlaceId: '=',
                placeDataCallback: '&',
                selectionCallback: '&'
            },
            link: function (scope, element, attrs) {

                scope.incomingCount = scope.activeIncomingConnections.length;
                scope.outgoingCount = scope.activeOutgoingConnections.length;

                scope.listedIncoming = [];
                scope.listedOutgoing = [];

                scope.sortConnectionsDesc = function (a, b) {
                    if(a.weight > b.weight) return -1;
                    if(a.weight < b.weight) return 1;
                    return 0;
                };

                scope.adjustOffsetIncoming = function(value){
                    if(scope.offsetIncoming + value > scope.incomingCount) {
                        scope.offsetIncoming = scope.incomingCount - value;
                    } else if(scope.offsetIncoming + value < 0){
                        scope.offsetIncoming = 0;
                    } else {
                        scope.offsetIncoming += value;
                    }
                    scope.applyOffset();
                };

                scope.adjustOffsetOutgoing = function(value){
                    if(scope.offsetOutgoing + value > scope.outgoingCount) {
                        scope.offsetOutgoing = scope.outgoingCount - value;
                    } else if(scope.offsetOutgoing + value < 0){
                        scope.offsetOutgoing = 0;
                    } else {
                        scope.offsetOutgoing += value;
                    }
                    scope.applyOffset();
                };

                scope.applyOffset = function () {
                    scope.listedIncoming = angular.copy(scope.activeIncomingConnections)
                        .sort(scope.sortConnectionsDesc)
                        .slice(scope.offsetIncoming, scope.listItemLimit + scope.offsetIncoming);

                    scope.listedOutgoing = angular.copy(scope.activeOutgoingConnections)
                        .sort(scope.sortConnectionsDesc)
                        .slice(scope.offsetOutgoing, scope.listItemLimit + scope.offsetOutgoing);
                };

                scope.selectPlace = function (id) {
                    scope.selectionCallback({id: id});
                };

                scope.getPlaceData = function(id) {
                    return scope.placeDataCallback({id: id});
                };

                scope.offsetIncoming = 0;
                scope.offsetOutgoing = 0;
                scope.listItemLimit = 5;

                scope.applyOffset();
            }
        }
    }]);
