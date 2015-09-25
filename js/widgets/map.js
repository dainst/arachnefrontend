'use strict';

/* Widget directives */
angular.module('arachne.widgets.directives')

/**
 * @autor: David Neugebauer
 */
.directive('con10tMap', ['searchService', function(searchService) {
return {
    restrict: 'A',
    scope: {
        catalogId: '@',
        overlays: '=?',
        baselayers: '=',
        defaultBaselayer: '=',	// "key"
        limit: '@',				// "500"
        facetsSelect: '=',		// {facetName: facetValue, ...}
        clustered: '=',  		// true|false
        lat: '@',
        lng: '@',
        zoom: '@'

    },
    // menu elements may appear in the transcluded html
    transclude: true,
    templateUrl: function(elem,attr) {
        if (attr.type=="grid") return 'partials/widgets/con10t-map_grid.html';
        if (attr.type=="places") return 'partials/widgets/con10t-map_places.html';
    },
    controller : function($scope) {

        var currentQuery = searchService.currentQuery();

        // Set currentQuery phrase to '*' if not defined beforehand
        if (!currentQuery.q) {
            currentQuery.q = '*';
        }
        if ($scope.lat)  currentQuery.lat=$scope.lat;
        if ($scope.lng)  currentQuery.lng=$scope.lng;
        if ($scope.zoom) currentQuery.zoom=$scope.zoom;


        // Add a limit to the search if defined in the attribute
        if ($scope.limit) {
            currentQuery.limit = $scope.limit;
        }

        // Add restrictions for facets to the search if defined
        if ($scope.facetsSelect) {
            for (var i = 0; i < $scope.facetsSelect.length; i++) {
                var facet = $scope.facetsSelect[i];

                if (!currentQuery.hasFacet(facet.key)) {
                    currentQuery.facets.push(facet);
                }
            }
        }
        // Add a further restriction for the catalog id
        if ($scope.catalogId) {
            $scope.catalogId = parseFloat($scope.catalogId);
            if (!currentQuery.hasFacet('catalogIds')) {
                currentQuery.facets.push({key: 'catalogIds',value: $scope.catalogId});
            }
        }
    }
}}]);