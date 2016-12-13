'use strict';

angular.module('arachne.widgets.directives')

/**
 * @author: Jan G. Wieners
 */
    .directive('con10tMediaTree', [function() {
        return {
            restrict: 'E',
            scope: {
                headerImages: '='
            },
            transclude: true,
            templateUrl: 'app/utils/con10t-media-tree.html',

            link: function(scope, element, attrs, ctrl, $transclude) {

                console.log(scope);

                $transclude(function(clone){
                    scope.showCaption = clone.length;
                });
            }
        }
    }]);