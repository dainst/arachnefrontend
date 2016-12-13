'use strict';

angular.module('arachne.directives')

    .directive('convertToBool', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (val) {
                    return val === 'true';
                });
                ngModel.$formatters.push(function (val) {
                    return '' + val;
                });
            }
        };
    });