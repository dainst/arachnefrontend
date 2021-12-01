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
            template: require('./con10t-include.html')
        }
    }]);
