/**
 * @author: David Neugebauer
 */
export default function(searchService, mapService) {
    return {
        restrict: 'A',
        scope: {
            baselayers: '='
        },
        template: require('./con10t-map-menu-baselayer.html'),
        link: function(scope) {

            scope.chosenBaselayer = searchService.currentQuery().baselayer || "osm";

            scope.toggleBaselayer = function(key) {
                mapService.activateBaselayer(key);
                scope.chosenBaselayer = key;
            }
        }
    }
};
