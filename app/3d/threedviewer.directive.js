'use strict';

angular.module('arachne.directives')

.directive('threeDViewer', [function () {
    return {

        restrict: 'A',
        scope: { options: '=' },

        link: function (scope, element, attrs) {

            var init = function() {
                _3dviewer(scope.options);
            };

            init();
        }
    }
}]);