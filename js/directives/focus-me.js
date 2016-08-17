'use strict';

angular.module('arachne.directives')

    .directive('focusMe', ['$timeout', function ($timeout) {
        return {
            link: function (scope, element, attrs, model) {
                $timeout(function () {
                    element[0].focus();
                });
            }
        };
    }]);