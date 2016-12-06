'use strict';

angular.module('arachne.directives')

    .directive('arActiveFacets', function () {
        return {
            scope: {
                route: '@',
                currentQuery: '='
            },
            templateUrl: 'app/facets/ar-active-facets.html',
            link: function (scope) {
                scope.facets = scope.currentQuery.facets || [];
            }
        }
    });