'use strict';

angular.module('arachne.widgets.map')

/**
 * @author: David Neugebauer
 * @author: Daniel M. de Oliveira
 */
    .directive('con10tMapMenuSearchInfo', ['searchService', 'placesService', 'mapService', 'searchScope',
        function (searchService, placesService, mapService, searchScope) {
            return {
                restrict: 'A',
                scope: {
                    // "grid" or "places", depending on the map's type, different
                    // search results are required
                    type: '@',
                    // a scope path like "grako" or "antiksammleipzig".. usually not required
                    searchScope: '@'
                },
                templateUrl: 'app/map/con10t-map-menu-search-info.html',
                link: function (scope) {

                    scope.currentQuery = searchService.currentQuery();

                    scope.getScopePath = function() {
                        if ((typeof scope.searchScope !== "undefined") && scope.searchScope) {
                            return "project/" + scope.searchScope + '/';
                        }
                        return searchScope.currentScopePath();
					};

                    function placesCount(entities) {
                        if (mapService.underLimit()) {
                            // var placesCount =
                            return placesService.makePlacesFromEntities(entities, searchService.currentQuery().bbox.split(",")).length;
                        } else
                            return undefined;
                    }

                    var queryListener = function (entities) {
                        // basic information about the search depends on the type of the map
                        // (either a geogrid or a map with Place objects)
                        scope.placesCount = placesCount(entities);
                        scope.entityCount = searchService.getSize();

                        // scope.que=mapService.getMapQuery(searchService.currentQuery()).toString();
                        // scope.entityCount = searchService.getSize();
                    };

                    searchService.getCurrentPage().then(function (entities) {
                        scope.entitiesTotal = searchService.getSize();
                        scope.entityCount = searchService.getSize();
                        scope.placesCount = placesCount(entities);
                        mapService.registerOnMoveListener(queryListener);
                    });
                }
            }
        }]);