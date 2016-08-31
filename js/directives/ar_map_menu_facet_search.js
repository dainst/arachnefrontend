'use strict';

angular.module('arachne.directives')

/**
 * @author: David Neugebauer
 */
.directive('arMapMenuFacetSearch', ['$location', 'searchService', 'mapService', function($location, searchService, mapService) {
return {
    restrict: 'A',
    scope: {
        // which facets to show or hide generally
        // ['facetname1',...]
        facetsDeny: '=?',
        facetsAllow: '=?',
        // additionally: which facets are selected and should not be allowed
        // to be unselected
        // [{facet_name: value}, ...]
        facetsSelected: '=?',
        // projects can choose to append a string to certain facet's names
        // [{facet_name: 'string'}, ...]
        facetsAppend: '=?'
    },
    templateUrl: 'partials/directives/ar-map-menu-facet-search.html',
    link: function(scope) {

        var geofacets = ['facet_fundort', 'facet_aufbewahrungsort', 'facet_geo', 'facet_ort', 'agg_geogrid']

        scope.route = $location.path().slice(1)
        scope.entityCount = null;
        scope.facetsShown = [];
        scope.activeFacets = [];

        var facetsHidden = geofacets;
        if (scope.facetsDeny) {
            facetsHidden = facetsHidden.concat(scope.facetsDeny);
        }

        searchService.getCurrentPage().then(function() {
            scope.entityCount = searchService.getSize();
            scope.currentQuery = searchService.currentQuery();

            // facetsShown is either the ordered list defined in facetsAllow
            var facets = searchService.getFacets();
            if (facets && scope.facetsAllow) {
                for (var i = 0; i < scope.facetsAllow.length; i++) {
                    var name = scope.facetsAllow[i];
                    var result = facets.filter(function (facet) {
                        return (facet.name == name);
                    });
                    if (result[0]) {
                        scope.facetsShown.push(result[0]);
                    }
                }
                // or it is scope.facets pruned by everything in facetsHidden
            } else if(facets && facetsHidden) {
                scope.facetsShown = facets.filter(function (facet) {
                    return (facetsHidden.indexOf(facet.name) == -1)
                });
            }

            // determine active facets, do not show preselected facets as active
            var queryFacets = scope.currentQuery.facets;
            if (scope.facetsSelected) {
                scope.activeFacets = queryFacets.filter(function(facet) {
                    for (var i = 0; i < scope.facetsSelected.length; i++) {
                        var hiddenFacet = scope.facetsSelected[i];
                        if ((hiddenFacet.key == facet.key) && (hiddenFacet.value == facet.value)) {
                            return false;
                        }
                    }
                    return true;
                });
            } else {
                scope.activeFacets = queryFacets;
            }

        });

        scope.addFacet = function(facetName, facetValue) {
            // remove coordinate and zoom params on new search to indicate that the map
            // should choose its default action when rendering the new objects' places
            var query = mapService.getMapQuery(searchService.currentQuery(),true).addFacet(facetName,facetValue)
                .removeParams(['offset', 'lat', 'lng', 'zoom']);
            $location.url(query.toString());
        };

        scope.removeFacet = function(facetName) {
            var query = mapService.getMapQuery(searchService.currentQuery(),true).removeFacet(facetName)
                .removeParams(['offset', 'lat', 'lng', 'zoom']);
            $location.url(query.toString());
        }
    }
}}]);