'use strict';

angular.module('arachne.widgets.directives')

/**
 * @author: David Neugebauer
 */
.directive('con10tMapMenuBaselayer', ['searchService', 'mapService', function(searchService, mapService) {
return {
    restrict: 'A',
    scope: {
        baselayers: '='
    },
    templateUrl: 'partials/widgets/con10t-map-menu-baselayer.html',
    link: function(scope) {

        scope.chosenBaselayer = searchService.currentQuery().baselayer || "osm";

        scope.toggleBaselayer = function(key) {
            mapService.activateBaselayer(key);
            scope.chosenBaselayer = key;
        }
    }
}}]);