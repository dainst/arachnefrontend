'use strict';

angular.module('arachne.directives')

/**
 * @author: David Neugebauer
 */
.directive('arMapMenuBaselayer', ['searchService', 'mapService', function(searchService, mapService) {
return {
    restrict: 'A',
    scope: {
        baselayers: '='
    },
    templateUrl: 'partials/directives/ar-map-menu-baselayer.html',
    link: function(scope) {

        scope.chosenBaselayer = searchService.currentQuery().baselayer || "osm";

        scope.toggleBaselayer = function(key) {
            mapService.activateBaselayer(key);
            scope.chosenBaselayer = key;
        }
    }
}}]);