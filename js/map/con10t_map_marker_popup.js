'use strict';

angular.module('arachne.widgets.map')

/**
 * @author: David Neugebauer
 */
.directive('con10tMapMarkerPopup', function() {
return {
    restrict: 'A',
    scope: {
        place: '='
    },
    templateUrl: 'partials/map/con10t_map_marker_popup.html',
    link: function(scope) {

        scope.get = function(offset, limit) {
            if (offset < 0) offset = 0;
            scope.offset = offset;
            scope.limit = limit;
            scope.shownEntities = scope.place.entities.slice(offset, offset+limit);
        };

        scope.offset = 0;
        scope.limit = 3;
        scope.listLength = scope.place.entities.length;

        scope.get(scope.offset, scope.limit);
    }
};
});