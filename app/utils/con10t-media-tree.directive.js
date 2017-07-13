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
                scope.firstBatch = scope.images;

                // experimental 2 row design, only with even amount of images
                if (scope.images.length > 3) {
                    var midLength = scope.images.length / 2;
                    scope.firstBatch = scope.images.slice(0, midLength);
                    scope.secondBatch = scope.images.slice(midLength, scope.images.length);
                    scope.cols = 12 / midLength;
                }

                // 3 row design? 3 images per row?

                $transclude(function (clone) {
                    scope.showCaption = clone.length;
                });
            }
        }
    }]);