'use strict';

angular.module('arachne.widgets.map')

/**
 * @author: David Neugebauer
 */
.directive('con10tMapMenuOverlays', ['$location', 'searchService', 'mapService', function($location, searchService, mapService) {
return {
    restrict: 'A',
    scope: {
        overlays: '='
    },
    templateUrl: 'partials/map/con10t_map_menu_overlays.html',
    link: function(scope) {

        var currentQuery = searchService.currentQuery();
        var keys = currentQuery.getArrayParam('overlays');

        scope.selectedOverlays = {};

        scope.toggleOverlay = function(key) {
            mapService.toggleOverlay(key);
        };

        for (var i = 0; i < keys.length; i++) {
            scope.selectedOverlays[keys[i]] = true;
        }

    }
}
}]);