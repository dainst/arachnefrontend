'use strict';

angular.module('arachne.controllers')

/**
 * @author: Sven Linßen
 */

.controller('FacetValueModalController', ['$scope', 'facet', '$location', 'indexService', 'Query', 'Entity', 'searchService',
function($scope, facet, $location, indexService, Query, Entity, searchService) {
    $scope.currentFacet = facet.name;
    $scope.facetValues = facet.values;

    $scope.currentEntityPage = 0;
    $scope.entitiesSize = 10;
    $scope.entityResultSize = 0;
    $scope.entitiesPageLength = 0;

    $scope.panelSize = 14;
    $scope.currentQuery = searchService.currentQuery();

    loadFacetValues();

    function loadFacetValues(letter) {
        if ($scope.groupedBy !== $location.search().group) {
            $scope.currentValuePage = 0;
        }

        var url = '/data/index/' + facet.name + $scope.currentQuery.toString();
        if (letter) {
            $scope.groupedBy = letter;
            url += "&group=" + $scope.groupedBy;
        } else {
            $scope.groupedBy = undefined;
        }

        indexService.loadFacetValuesAsync(url).then(function (preprocessedValues) {
            var itemsPerPage = 0;
            var pageCounter = 0;
            $scope.facetValues = [[]];
            $scope.valuesCount = preprocessedValues.length;

            if (preprocessedValues.length + 2 < $scope.panelSize) {
                $scope.valueRows = 1;
            }
            else {
                $scope.valueRows = 2;
            }

            $scope.currentValuePage = 0;
            $scope.currentEntityPage = 0;
            for (var i = 0; i < preprocessedValues.length; i++) {
                if (itemsPerPage + 2 === $scope.panelSize * 2) {
                    $scope.facetValues.push([]);
                    pageCounter += 1;
                    itemsPerPage = 0;
                }

                $scope.facetValues[pageCounter].push(preprocessedValues[i]);
                if (preprocessedValues[i] === $scope.currentValue) {
                    $scope.currentValuePage = pageCounter;
                }

                itemsPerPage += 1;
            }
        });
    }

    $scope.previousValuePage = function () {
        $scope.currentValuePage -= 1;
    };
    $scope.nextValuePage = function () {
        $scope.currentValuePage += 1;
    };

    $scope.searchLetter = function(letter){
        loadFacetValues(letter);
    };

}])

.component('facets', {
    controller: 'SearchController',
    templateUrl: 'facet-value-modal.html',
    bindings:{
        facet: '=',
    }
});
