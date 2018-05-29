'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tVega', function () { // con10t-vega
        return {
            restrict: 'E',
            scope: {
                spec: '@',
                name: '@'
            },
            link: function(scope, element, attrs) {

                scope.renderVega = function (spec) {
                    scope.vegaView = new vega.View(vega.parse(spec))
                        .renderer('canvas')
                        .initialize('[name="' + scope.name + '"]')
                        .hover()
                        .run();
                };

                vega.loader()
                    .load(scope.spec)
                    .then(function(data){
                        scope.renderVega(JSON.parse(data));
                    });
            }
        }
    });