'use strict';

angular.module('arachne.widgets.directives')

/**
 * @author David Neugebauer
 * @author Daniel de Oliveira
 */
.directive('con10tMapMenuFacetSearch', ['$location', 'searchService', 'mapService', function($location, searchService, mapService) {
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
        facetsAppend: '=?',
        facetValuesLimit: '=?'
    },
    templateUrl: 'partials/map/con10t_map_menu_facet_search.html',
    link: function(scope) {

        const geoFacets = ['facet_fundort', 'facet_aufbewahrungsort', 'facet_geo', 'facet_ort', 'agg_geogrid'];

        // before changing the location on facet actions, 
        // removing coordinate and zoom params on new search to indicate that the map
        // should perform its default action when rendering the new objects' places
        const paramsToRemove = ['offset', 'lat', 'lng', 'zoom'];

        if (!scope.facetValuesLimit) scope.facetValuesLimit = 10;

        scope.route = $location.path().slice(1);
        scope.entityCount = null;
        scope.facetsShown = [];
        scope.activeFacets = [];

        function computeFacetsShown(facets,allowedFacetsNames,hiddenFacetsNames) {

            var facetsShown=[];

            // facetsShown is either the ordered list defined in facetsAllow
            if (facets && allowedFacetsNames) {
                for (var i = 0; i < allowedFacetsNames.length; i++) {

                    var matchedFacet = facets.filter(function (facet) {
                        return (facet.name == allowedFacetsNames[i]);
                    })[0];

                    if (matchedFacet)
                        facetsShown.push(matchedFacet);

                }
                // or it is scope.facets pruned by everything in facetsHidden
            } else if(facets && hiddenFacetsNames) {
                facetsShown = facets.filter(function (facet) {
                    return (hiddenFacetsNames.indexOf(facet.name) == -1)
                });
            }

            return facetsShown;
        }

        function trimFacetValues(facetsShown,facetValuesMax) {
            for (var i = 0; i < facetsShown.length; i++)
                facetsShown[i].values=facetsShown[i].values.slice(0,facetValuesMax);
        }


        var facetsHidden = geoFacets;
        if (scope.facetsDeny) {
            facetsHidden = facetsHidden.concat(scope.facetsDeny);
        }

        searchService.getCurrentPage().then(function() {
            scope.entityCount = searchService.getSize();
            scope.currentQuery = searchService.currentQuery();

            scope.facetsShown=computeFacetsShown(searchService.getFacets(),scope.facetsAllowed,facetsHidden);
            trimFacetValues(scope.facetsShown,scope.facetValuesLimit);

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
            var query = mapService.getMapQuery(searchService.currentQuery(),true);
            query=query.addFacet(facetName,facetValue);
            query=query.removeParams(paramsToRemove);
            $location.url(query.toString());
        };

        scope.removeFacet = function(facetName) {
            var query = mapService.getMapQuery(searchService.currentQuery(),true);
            query=query.removeFacet(facetName);
            query=query.removeParams(paramsToRemove);
            $location.url(query.toString());
        }
    }
}}]);