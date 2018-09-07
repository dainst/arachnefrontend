'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tNetwork', ['$http', '$q', function ($http, $q) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-network.html',
            scope: {
                placesDataPath: '@',
                objectDataPath: '@',
                lat: '@',
                lng: '@',
                zoom: '@'
            },
            link: function (scope, element, attrs) {
                scope.minDate = new Date(-8640000000000000);
                scope.maxDate = new Date(8640000000000000);
            }
        }
    }]);
