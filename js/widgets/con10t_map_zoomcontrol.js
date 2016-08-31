'use strict';

angular.module('arachne.widgets.directives')

/**
 * Directive implements a simple Zoomcontrol box instead of the one provided by leaflet. This is done
 * for consistency and such that the box can be styled via any template even if inside the partial one
 * could not normally override leaflet's css (e.g. con10t-pages).
 *
 * @author: David Neugebauer
 */
.directive('con10tMapZoomcontrol', ['searchService', 'mapService', function(searchService, mapService) {
return{
    restrict: 'A',
    scope: {},
    templateUrl: 'partials/directives/ar-map-zoomcontrol.html',
    link: function(scope) {

        scope.increaseZoom = function(increment) {
            mapService.increaseZoom(increment);
        }
    }
};
}]);