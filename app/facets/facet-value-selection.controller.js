'use strict';

angular.module('arachne.controllers')

/**
 * @author Patrick Jominet
 */
    .controller('FacetValueSelectionController', ['$scope', '$uibModalInstance', 'searchService', 'arachneSettings', 'status', 'messageService',
        function ($scope, $uibModalInstance, searchService, arachneSettings, status, messages) {

            $scope.facet = status.facet;
            $scope.currentQuery = status.currentQuery;
            $scope.currentFacetValuePage = 0;
            $scope.facetValueRequest = undefined;

            $scope.searchFacetValue = function (name) {
                $scope.facetValueRequest = searchService.getFacetValue(name);
            };

            $scope.getPages = function () {
                return $scope.facet.values.length / arachneSettings.facetLimit;
                // TODO use the following when backend can give full count of facet values
                // return searchService.getFacetValueSize() / arachneSettings.facetLimit;
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };

            $scope.loadMoreFacetValues = function (facet) {
                searchService.loadMoreFacetValues(facet).then(function (hasMore) {
                    facet.hasMore = hasMore;
                }, function (response) {
                    if (response.status === '404') messages.add('backend_missing');
                    else messages.add('search_' + response.status);
                });
            };

            $scope.previousFacetValuePage = function() {
                $scope.currentFacetValuePage -= 1;
            };

            $scope.nextFacetValuePage = function() {
                $scope.currentFacetValuePage += 1;
            };
        }]);
