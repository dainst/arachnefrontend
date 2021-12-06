/**
 * @author: Richard Henck
 * @author: Philipp Franck
 * @author: Sebastian Cuy
 */  
export default function (placesPainter, mapService, searchService, placesService) {

    var MAX_PLACES_FOR_TRANSLOCATIONS = 1000;

    return {
        restrict: 'A',
        scope: {
            type: '@',
            searchScope: '@'
        },
        template: require('./con10t-map-menu-translocations.html'),
        link: function (scope) {
            scope.isTranslocationViewShown = false;

            scope.allowTranslocationView = function() {
                return !MAX_PLACES_FOR_TRANSLOCATIONS || (searchService.getSize() < MAX_PLACES_FOR_TRANSLOCATIONS);
            };

            scope.toggleTranslocationView = function() {
                scope.isTranslocationViewShown = !scope.isTranslocationViewShown;
                mapService.setTranslocationLayerActive(scope.isTranslocationViewShown);
                searchService.getCurrentPage().then(function (entities) {
                    drawTranslocationLines(entities);
                });
            };

            scope.$on('$destroy', function() {
                placesPainter.clearTranslocationLines();
            });

            function drawTranslocationLines(entities) {
                if (scope.isTranslocationViewShown) {
                    for (var i = 0; i < entities.length; i++) {
                        placesPainter.drawTranslocationLines(entities[i].places);
                    }
                } else {
                    placesPainter.clearTranslocationLines();
                }
            }

            mapService.registerOnMoveListener("checkTranslocationsLines", function() {
                if (!scope.isTranslocationViewShown || !scope.allowTranslocationView()) {
                    placesPainter.clearTranslocationLines();
                }
            });

        }
    }
}
