/**
 * @author: David Neugebauer
 * @author: Simon Hohl
 */

'use strict';


var arMapMarkerPopup = ['$location', 'Entity', 'searchScope', function($location, Entity, searchScope) {
    return {
        restrict: 'A',
        scope: {
            place: '=',
            entityCallback: '=',
            shortForm: '='
        },
        templateUrl: 'app/map/ar-map-marker-popup.html',
        link: function(scope, element, attrs) {

            scope.get = function(offset, limit) {
                if (offset < 0) offset = 0;

                scope.offset = offset;
                scope.limit = limit;

                var query = scope.place.query.setParam('offset', offset).setParam('limit', limit);
				var finalQuery = query.extend(searchScope.currentScopeData());
                Entity.query(finalQuery.toFlatObject(), function(result) {
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

            scope.listLength = 0;
            scope.offset = 0;
            scope.limit = 5;
            if (scope.place.isFixed !== true) { // maybe null  more likely than undefined if not defined
                scope.get(scope.offset, scope.limit);
            }

            scope.getScopePath = function() {
                return searchScope.currentScopePath()
            }
        }
    }
}];


angular.module('arachne.widgets.map')
    .directive('arMapMarkerPopup', arMapMarkerPopup);

angular.module('arachne.widgets.map')
    .directive('con10tMapPopup', arMapMarkerPopup);