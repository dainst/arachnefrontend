'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tNetworkMapPopup', ['$http', '$q', '$filter', function ($http, $q, $filter) {
        console.log("Directive was run");
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-network-map-popup.html',
            link: function (scope, element, attrs) {

                scope.sortConnectionsDesc = function (a, b) {
                    if(a.weight > b.weight) return -1;
                    if(a.weight < b.weight) return 1;
                    return 0;
                };
            }
        }
    }]);