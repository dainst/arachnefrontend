'use strict';

angular.module('arachne.widgets.directives')

/**
 * @author: Simon Hohl
 */

    .directive('con10tInclude', [function () {
        return {
            restrict: 'E',
            scope: {
                src: '@'
            },
            templateUrl: 'app/utils/con10t-include.html'
        }
    }]);