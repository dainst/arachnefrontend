'use strict';

angular.module('arachne.widgets.map')

/**
 * @author: David Neugebauer
 * @author: Daniel M. de Oliveira
 */
    .directive('con10tMapMenuSearchInfo', ['searchService', 'placesService', 'mapService',
        function (searchService, placesService, mapService) {
            return {
                restrict: 'A',
                scope: {
                    // "grid" or "places", depending on the map's type, different
                    // search results are required
                    type: '@',
                    // a scope path like "grako" or "antiksammleipzig".. usually not required
                    searchScope: '@',
                    linkToSearch: '='
                },
                template: require('./con10t-map-menu-search-info.html'),
                link: function (scope, element, attrs) {
                    scope.placesCount = null;
                    scope.currentQuery = searchService.currentQuery();

                    scope.showLinkToSearch = function() {
                        return angular.isUndefined(attrs.linkToSearch) || eval(attrs.linkToSearch);
                    };

                    scope.getScopePath = function() {
                        if ((typeof scope.searchScope !== "undefined") && scope.searchScope) {
                            return "project/" + scope.searchScope + '/';
                        }
                        return searchScope.currentScopePath();
					};

                    function placesCount(entities) {
                        var facet_geo = searchService.getFacet("facet_geo");
                        return facet_geo ? facet_geo.values.length : null;
                    }

                    var updateCounters = function(entities) {
                        // basic information about the search depends on the type of the map
                        // (either a geogrid or a map with Place objects)
                        scope.placesCount = placesCount(entities);
                        scope.entityCount = searchService.getSize();

                    };

                    scope.searchUrl = function() {
                        return (this.searchScope ? "project/" + this.searchScope + "/" : "") +
                               "search" + this.currentQuery.removeParam('fl').removeParam('zoom').toString();

                    };

                    searchService.getCurrentPage().then(function (entities) {
                        scope.entitiesTotal = searchService.getSize();
                        scope.entityCount = searchService.getSize();
                        scope.placesCount = placesCount(entities);
                        mapService.registerOnMoveListener("updateCounters", updateCounters);
                    });
                }
            }
        }]);
