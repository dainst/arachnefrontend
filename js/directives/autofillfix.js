'use strict';

angular.module('arachne.directives')

    .directive('autofillfix', ['$timeout', function ($timeout) {
        return {
            link: function (scope, elem, attrs) {
                // Fixes Chrome bug: https://groups.google.com/forum/#!topic/angular/6NlucSskQjY
                elem.prop('method', 'POST');

                // Fix autofill issues where Angular doesn't know about autofilled inputs
                if (attrs.ngSubmit) {
                    $timeout(function () {

                        elem.unbind('submit').bind('submit', function (e) {
                            e.preventDefault();
                            var arr = elem.find('input');
                            if (arr.length > 0) {
                                arr.triggerHandler('input').triggerHandler('change').triggerHandler('keydown');
                                scope.$apply(attrs.ngSubmit);
                            }
                        });
                    }, 0);
                }
            }
        };
    }]);