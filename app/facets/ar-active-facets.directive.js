'use strict';

angular.module('arachne.directives')

    .directive('arActiveFacets', function () {
        return {
            scope: {
                route: '@',
                currentQuery: '='
            },
            template: require('./ar-active-facets.html'),
            link: function (scope) {
                scope.facets = scope.currentQuery.facets || [];

                scope.removeBBox = function() {
                    if (scope.currentQuery && scope.currentQuery.bbox) {
                        delete scope.currentQuery.bbox;
                    }
                };

                scope.getBoundingBoxHumanReadable = function() {

                    function cutCoord(c) {
                        return c.toString().substring(0, 8) + '..'
                    }

                    if (!scope.currentQuery || !scope.currentQuery.bbox) {
                        return "";
                    }
                    return scope.currentQuery.bbox
                        .split(',')
                        .map(cutCoord)
                        .join(', ');
                };
            }
        }
    });
