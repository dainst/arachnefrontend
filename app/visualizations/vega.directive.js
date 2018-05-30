'use strict';

// In order to debug your Vega spec, run the following command in your browser's console:
// view = angular.element(document.getElementsByName('<name attribute>')).scope().$$childHead.vegaView
// You can then use the variable view as described in https://vega.github.io/vega/docs/api/debugging/

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
                        //.logLevel(vega.Debug)
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