/**
 * @author: Sebastian Cuy
 * @author: Jan G. Wieners
 */
export default function(mapService, searchService) {
    return {
        restrict: 'A',
        scope: {
            overlays: '=?',
            baselayers: '='
        },
        // menu elements may appear in the transcluded html
        transclude: true,
        template: require('./con10t-map-overlays.html'),
        link: function (scope) {

            mapService.setOverlays(scope.overlays);
            mapService.activateOverlays(searchService.currentQuery().getArrayParam('overlays'));
        }
    };
};
