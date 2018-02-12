'use strict';

angular.module('arachne.widgets.map')

/**
 * @author: Richard Henck
 */
    .directive('con10tMapMenuTranslocations', ['placesPainter', 'heatmapPainter', 'mapService', 'searchService', 'placesService',
        function (placesPainter, heatmapPainter, mapService, searchService, placesService) {

            return {
                restrict: 'A',
                scope: {
                    type: '@',
                    searchScope: '@'
                },
                templateUrl: 'app/map/con10t-map-menu-translocations.html',
                link: function (scope) {
                    scope.translocationView = {
                        value1 : false
                    };

                    scope.toggleTranslocationView = function() {
                        mapService.setTranslocationLayerActive(scope.translocationView.value1);
                        searchService.getCurrentPage().then(function (entities) {
                            drawMapEntities(entities);
                        });
                    }

                    function drawMapEntities(entities) {
                        // draw colored lines between the nodes
                        if (scope.translocationView.value1) {
                            for (var i = 0; i < entities.length && i < 20; i++) {
                                placesPainter.drawTranslocationLines(entities[i].places);
                            }
                        } else {
                            placesPainter.clearTranslocationLines();
                        }
                    }
                }
            }
        }
    ]);
