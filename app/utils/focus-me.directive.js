'use strict';

angular.module('arachne.directives')

    .directive('focusMe', ['$timeout', function ($timeout) {
        return {
            link: function (scope, element) {

                $timeout(function () {
                    element[0].focus();
                }, 300);
            }
        };
    }]);