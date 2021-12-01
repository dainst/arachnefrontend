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
                template: require('./con10t-map-menu-legend.html'),
                link: function () {
                }
            }
        }]);
