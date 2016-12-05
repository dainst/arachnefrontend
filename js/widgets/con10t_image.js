'use strict';

angular.module('arachne.widgets.directives')

/**
 * @author: Jan G. Wieners
 */
    .directive('con10tImage', [function() {
        return {
            restrict: 'E',
            scope: {
                src: '@',
                alt: '@',
                align: '@',
                width: '@',
                height: '@',
                entityId: '@'
            },
            transclude: true,
            templateUrl: 'js/widgets/con10t-image.html',

            link: function(scope, element, attrs, ctrl, $transclude) {

                $transclude(function(clone){
                    scope.showCaption = clone.length;
                });
            }
        }
    }]);