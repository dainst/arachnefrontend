'use strict';

angular.module('arachne.controllers')

/**
 * @author: Jan G. Wieners
 */

    .controller('SearchController', ['$rootScope', '$scope', 'searchService', 'categoryService', '$filter', 'arachneSettings', '$location', 'Catalog', 'message', '$uibModal', '$http', 'Entity', 'authService', '$timeout',
        function ($rootScope, $scope, searchService, categoryService, $filter, arachneSettings, $location, Catalog, message, $uibModal, $http, Entity, authService, $timeout) {

            // To indicate that the query will not be performed because it violates one or more constraints of some sort
            $scope.illegalQuery = false;
            $rootScope.hideFooter = false;
            $scope.user = authService.getUser();
            $scope.currentQuery = searchService.currentQuery();
            $scope.q = angular.copy($scope.currentQuery.q);
            $scope.sortableFields = arachneSettings.sortableFields;

            // Ignore unknown sort fields
            if (arachneSettings.sortableFields.indexOf($scope.currentQuery.sort) == -1) {
                delete $scope.currentQuery.sort;
            }

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = categories;
            });

            $scope.createCatalogTextForCurrentQuery = function () {

                var curQuery = $scope.currentQuery,
                    text = curQuery.toFlatObject().q,
                    facets = curQuery.toFlatObject().fq,
                    len = facets.length;

                for (var i = 0; i < len; i++) {
                    text += " " + curQuery.toFlatObject().fq[i];
                }

                return text;
            };

            $scope.processCatalogEntities = function (entities) {

                var entity, len = entities.length;

                for (var i = len; i--;) {

                    entity = entities[i];

                    $scope.catalogEntries.push({
                        "arachneEntityId": entity.entityId,
                        "label": entity.title,
                        "text": entity.subtitle
                    });
                }

                var catalogFromSearch = $uibModal.open({
                    templateUrl: 'partials/Modals/editCatalog.html',
                    controller: 'EditCatalogController',
                    resolve: {
                        catalog: function () {
                            return {
                                author: $scope.user.username,
                                root: {
                                    label: $scope.currentQuery.label,
                                    text: $scope.createCatalogTextForCurrentQuery(),
                                    children: $scope.catalogEntries
                                }
                            }
                        }
                    }
                });

                catalogFromSearch.close = function (newCatalog) {

                    //newCatalog.public = false;
                    Catalog.save({}, newCatalog, function (result) {
                    });
                    catalogFromSearch.dismiss();
                }
            };

            $scope.createCatalogFromSearch = function () {

                if (searchService.getSize() > 999) {
                    return;
                }

                $scope.catalogEntries = [];

                var entityQuery = Entity.query(angular.extend($scope.currentQuery.toFlatObject(), {
                    offset: 0, limit: 1000
                }));

                entityQuery.$promise.then(function (result) {
                    $scope.processCatalogEntities(result.entities)
                }, function (err) {
                    console.log('Error in retrieving entities.', err);
                });
            };

            $scope.go = function (path) {
                $location.url(path);
            };

            $scope.previousPage = function () {
                if ($scope.currentPage > 1)
                    $scope.currentPage -= 1;
                $scope.onSelectPage();
            };

            $scope.nextPage = function () {
                if ($scope.currentPage < $scope.totalPages)
                    $scope.currentPage += 1;
                $scope.onSelectPage();
            };

            $scope.onSelectPage = function () {
                var newOffset = ($scope.currentPage - 1) * $scope.currentQuery.limit;
                $location.url('search' + $scope.currentQuery.setParam('offset', newOffset).toString());
            };

            $scope.loadMoreFacetValues = function (facet) {
                searchService.loadMoreFacetValues(facet).then(function (hasMore) {
                    facet.hasMore = hasMore;
                    console.log(facet.name, facet.hasMore);
                }, function (response) {
                    if (response.status == '404') message.addMessageForCode('backend_missing');
                    else message.addMessageForCode('search_' + response.status);
                });
            };


            if (parseInt($scope.currentQuery.limit) + parseInt($scope.currentQuery.offset) > 10000) {

                $timeout(function () { // unfortunately we have to do this to wait for the translations to load.
                    message.clear();
                    message.addMessageForCode('ui_search_too_big', 'warning', false);
                    $scope.illegalQuery = true;
                }, 1000);

            } else {

                searchService.getCurrentPage().then(function (entities) {

                    $scope.entities = entities;
                    $scope.resultSize = searchService.getSize();
                    $scope.totalPages = Math.ceil($scope.resultSize / $scope.currentQuery.limit);
                    $scope.currentPage = $scope.currentQuery.offset / $scope.currentQuery.limit + 1;
                    $scope.facets = searchService.getFacets();
                    var insert = [];

                    for (var i = 0; i < $scope.facets.length; i++) {

                        var facet = $scope.facets[i];
                        facet.open = false;
                        if (facet.values.length < $scope.currentQuery.fl) {
                            facet.hasMore = false;
                        } else {
                            facet.hasMore = true;
                        }
                        arachneSettings.openFacets.forEach(function (openName) {
                            if (facet.name.slice(0, openName.length) == openName) {
                                insert.unshift($scope.facets.splice(i--, 1)[0]);
                                facet.open = true;
                            }
                        });
                    }
                    insert.forEach(function (facet) {
                        $scope.facets.unshift(facet);
                    });
                    $scope.cells = $filter('cellsFromEntities')(entities, $scope.currentQuery);
                }, function (response) {
                    $scope.resultSize = 0;
                    $scope.error = true;
                    if (response.status == '404') message.addMessageForCode('backend_missing');
                    else message.addMessageForCode('search_' + response.status);
                });

            }

        }
    ]);