'use strict';

angular.module('arachne.widgets.map')

/**
 * @author: Patrick Jominet
 */
    .directive('con10tMapMenuLegend', [
        function () {
            return {
                restrict: 'A',
                scope: {},
                templateUrl: 'app/map/con10t-map-menu-legend.html',
                link: function () {
                }
            }
        }]);