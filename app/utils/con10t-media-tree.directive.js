'use strict';

angular.module('arachne.widgets.directives')

/**
 * @author: Jan G. Wieners
 */
    .directive('con10tMediaTree', ['arachneSettings', function(arachneSettings) {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                headerImages: '='
            },
            transclude: true,
            templateUrl: 'app/utils/con10t-media-tree.html',

            link: function(scope, element, attrs, ctrl, $transclude) {

                scope.arachneUrl = arachneSettings.arachneUrl;

                $transclude(function(clone){
                    scope.showCaption = clone.length;
                });
            }
        }
    }]);