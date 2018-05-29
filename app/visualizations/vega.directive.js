'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tVega', function () { // con10t-vega
        return {
            restrict: 'E',
            scope: {
                spec: '@'
            },
            link: function(scope, element, attrs) {

                scope.renderVega = function (spec) {
                    scope.vegaView = new vega.View(vega.parse(spec))
                        .renderer('canvas')
                        .initialize('#vega-view')
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