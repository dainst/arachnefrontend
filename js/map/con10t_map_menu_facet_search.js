'use strict';

angular.module('arachne.widgets.map')

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

        if (!scope.facetValuesLimit) scope.facetValuesLimit = 10;

        // additional properties which are not part of the widget definition
        scope.route = $location.path().slice(1);
        scope.entityCount = null; // Number
        scope.currentQuery = null; // Query
        scope.facetsShown = [];
        scope.activeFacets = [];
        scope.addFacet = null; // Function
        scope.removeFacet = null; // Function


        // before triggering a new search on facet actions,
        // removing coordinate and zoom params on new search to indicate that the map
        // should perform its default action when rendering the new objects' places
        var paramsToRemove = ['offset', 'lat', 'lng', 'zoom'];

        var facetsHidden = [
            'facet_fundort', 'facet_aufbewahrungsort', 'facet_geo',
            'facet_ort', 'agg_geogrid', 'facet_ortsangabe'];
        if (scope.facetsDeny)
            facetsHidden = facetsHidden.concat(scope.facetsDeny);

        var namesOfOpenFacets=[]; // Array


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

        function computeActiveFacets(queryFacets,facetsSelected) {
            var activeFacets;

            // determine active facets, do not show preselected facets as active
            if (facetsSelected) {
                activeFacets = queryFacets.filter(function(facet) {
                    for (var i = 0; i < facetsSelected.length; i++) {
                        var hiddenFacet = facetsSelected[i];
                        if ((hiddenFacet.key == facet.key) && (hiddenFacet.value == facet.value)) {
                            return false;
                        }
                    }
                    return true;
                });
            } else {
                activeFacets = queryFacets;
            }

            return activeFacets;
        }

        /**
         * With each search, the facets get recomputed.
         * This method provides the functionality to remain
         * facets open, which were open before the search and are
         * still part of the new search result.
         *
         * @param facetsShown array of facets which gets modified.
         * @param openFacets array with names of facets which were marked as beeing opened.
         */
        function recoverFacetOpenState(facetsShown,openFacets) {
            for (var i = 0; i < openFacets.length; i++) {

                var facetShownContainedInOpenFacets=false;
                for (var j = 0; j < facetsShown.length; j++) {

                    if (openFacets.indexOf(facetsShown[j].name)!=-1) {
                        facetsShown[j].open=true;
                        facetShownContainedInOpenFacets=true;
                    }
                }
                if (!facetShownContainedInOpenFacets) openFacets.splice(i,1);
            }
        }


        function trimFacetValues(facetsShown,facetValuesMax) {
            for (var i = 0; i < facetsShown.length; i++)
                facetsShown[i].values=facetsShown[i].values.slice(0,facetValuesMax);
        }

        function current() {
            searchService.getCurrentPage().then(function() {

                scope.entityCount = searchService.getSize();
                scope.currentQuery = searchService.currentQuery();

                scope.facetsShown=computeFacetsShown(searchService.getFacets(),scope.facetsAllowed,facetsHidden);
                trimFacetValues(scope.facetsShown,scope.facetValuesLimit);
                scope.activeFacets=computeActiveFacets(scope.currentQuery.facets,scope.facetsSelected);
                recoverFacetOpenState(scope.facetsShown,namesOfOpenFacets);
            });
        }
        current();
        mapService.registerOnMoveListener(current);

        

        scope.addFacet = function(facetName, facetValue) {
            searchService.setQuery(searchService.currentQuery().addFacet(facetName,facetValue));
            mapService.triggerSearch();
        };

        scope.removeFacet = function(facetName) {
            searchService.setQuery(searchService.currentQuery().removeFacet(facetName));
            mapService.triggerSearch();
        };

        scope.toggleFacet = function(facet) {
            facet.open = !facet.open;
            if (facet.open) namesOfOpenFacets.push(facet.name);
            else {
                var index = namesOfOpenFacets.indexOf[facet.name];
                if (index!=-1) namesOfOpenFacets.splice(index,1);
            }
        }
    }
}}]);