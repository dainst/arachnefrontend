'use strict';

angular.module('arachne.widgets.map')

/**
 * @author: David Neugebauer
 */
.directive('con10tMapPopup', ['$location', 'Entity', function($location, Entity) {
return {
    restrict: 'A',
    scope: {
        place: '=',
        entityCallback: '='
    },
    templateUrl: 'app/map/con10t_map_marker_popup.html',
    link: function(scope) {

        scope.get = function(offset, limit) {
            if (offset < 0) offset = 0;
            scope.offset = offset;
            scope.limit = limit;
            var query = scope.place.query.setParam('offset', offset).setParam('limit', limit);
            Entity.query(query.toFlatObject(), function(result) {
                scope.shownEntities = result.entities;
                scope.listLength = result.size;
            });
        };

        scope.selectEntity = function(entity) {
            if (scope.entityCallback) {
                scope.entityCallback(entity);
            } else {
                $location.url('entity/' + entity.entityId);
            }
        };

        scope.offset = 0;
        scope.limit = 5;

        scope.get(scope.offset, scope.limit);
    }
};
}]);