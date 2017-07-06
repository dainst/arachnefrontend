'use strict';

angular.module('arachne.widgets.directives')

/**
 * @author: Jan G. Wieners
 * @author Patrick Jominet
 */
    .directive('con10tMediaTree', ['arachneSettings', function (arachneSettings) {
        return {
            restrict: 'E',
            templateUrl: 'app/utils/con10t-media-tree.html',
            scope: {
                title: '@',
                headerTeaser: '@',
                images: '='
            },
            transclude: true,
            link: function (scope, element, attrs, $transclude) {
                scope.arachneUrl = arachneSettings.arachneUrl;
                scope.cols = 12 / scope.images.length;
                scope.hasTeaser = attrs.headerTeaser;

                $transclude(function (clone) {
                    scope.showCaption = clone.length;
                });
            }
        }
    }]);