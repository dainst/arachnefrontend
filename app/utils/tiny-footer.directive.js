'use strict';

angular.module('arachne.directives')

    .directive('tinyFooter', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'A',
            controller: function () {
                $rootScope.tinyFooter = true;
            }
        }
    }]);