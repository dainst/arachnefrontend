/**
 * @author: David Neugebauer
 */
export default function(searchService, mapService) {
    return {
        restrict: 'A',
        scope: {
            overlays: '='
        },
        template: require('./con10t-map-menu-overlays.html'),
        link: function(scope) {

            var currentQuery = searchService.currentQuery();
            var keys = currentQuery.getArrayParam('overlays');

            scope.selectedOverlays = {};

            scope.toggleOverlay = function(key) {
                mapService.toggleOverlay(key);
            };

            for (var i = 0; i < keys.length; i++) {
                scope.selectedOverlays[keys[i]] = true;
            }

        }
    }
};
