'use strict';

angular.module('arachne.directives')

    .directive('hideFooter', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'A',
            controller: function () {
                $rootScope.hideFooter = true;
            }
        }
    }]);