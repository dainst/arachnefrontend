'use strict';

angular.module('arachne.widgets.map')

/**
 * @author David Neugebauer
 * @author Daniel de Oliveira
 */
.directive('con10tMapMenuFacetSearch', ['$location', 'searchService', 'mapService', 'arachneSettings',
    function($location, searchService, mapService, arachneSettings) {
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
    templateUrl: 'app/map/con10t-map-menu-facet-search.html',
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

        // before changing the location on facet actions,
        // removing coordinate and zoom params on new search to indicate that the map
        // should perform its default action when rendering the new objects' places
        var paramsToRemove = ['offset', 'lat', 'lng', 'zoom'];

        var facetsHidden = []
        // var facetsHidden = [
        //     'facet_fundort', 'facet_aufbewahrungsort', 'facet_geo',
        //     'facet_ort', 'agg_geogrid', 'facet_ortsangabe'];
        if (scope.facetsDeny)
            facetsHidden = facetsHidden.concat(scope.facetsDeny);


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


        function trimFacetValues(facetsShown,facetValuesMax) {
            for (var i = 0; i < facetsShown.length; i++)
                facetsShown[i].values=facetsShown[i].values.slice(0,facetValuesMax);
        }

        function _buildFacetGroups() {
            scope.facetGroups = {};

            var facetNames = scope.facetsShown.map(function (facet) {

                return facet.name;
            });

            scope.facetsShown
                .filter(function (facet) {
                    if (facet.dependsOn === null) {
                        return true;
                    }
                    return (facetNames.indexOf('facet_' + facet.dependsOn) < 0);
                })
                .map(function (facet) {
                    var group = (facet.group) ? facet.group : facet.name;
                    if (typeof scope.facetGroups[group] === "undefined") {
                        scope.facetGroups[group] = [];
                    }
                    scope.facetGroups[group].push(facet);
                });
        }

        searchService.getCurrentPage().then(function() {
            scope.entityCount = searchService.getSize();
            scope.currentQuery = searchService.currentQuery();

            scope.facetsShown=computeFacetsShown(searchService.getFacets(),scope.facetsAllowed,facetsHidden);
            trimFacetValues(scope.facetsShown,scope.facetValuesLimit);
            scope.activeFacets=computeActiveFacets(scope.currentQuery.facets,scope.facetsSelected);

            _buildFacetGroups();
            var insert = [];

            // separate default facets from the rest, to display them first
            scope.defaultFacets = [];
            arachneSettings.openFacets.forEach(function(openName) {
                if (openName in scope.facetGroups) {
                    scope.defaultFacets.push(scope.facetGroups[openName][0]);
                    delete scope.facetGroups[openName];
                }
            });

            for (var i = 0; i < scope.defaultFacets.length; i++) {
                var facet = scope.defaultFacets[i];
                facet.open = false;
                if (facet.values.length < searchService.currentQuery.fl) {
                    facet.hasMore = false;
                } else {
                    facet.hasMore = true;
                }
                arachneSettings.openFacets.forEach(function (openName) {
                    if (facet.name.slice(0, openName.length) == openName) {
                        insert.unshift(scope.defaultFacets.splice(i--, 1)[0]);
                        facet.open = true;
                    }
                });
            }
            insert.forEach(function (facet) {
                scope.defaultFacets.unshift(facet);
            });
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
