'use strict';

angular.module('arachne.controllers')

    .controller('SearchController', ['$rootScope', '$scope', 'searchService', 'categoryService', '$filter', 'arachneSettings', '$location', 'Catalog', 'message', '$uibModal', '$http', 'Entity', 'authService',
        function ($rootScope, $scope, searchService, categoryService, $filter, arachneSettings, $location, Catalog, message, $uibModal, $http, Entity, authService) {

            $rootScope.hideFooter = false;
            $scope.user = authService.getUser();

            $scope.currentQuery = searchService.currentQuery();
            $scope.q = angular.copy($scope.currentQuery.q);
            //$scope.user = authService.getUser();

            $scope.sortableFields = arachneSettings.sortableFields;
            // ignore unknown sort fields
            if (arachneSettings.sortableFields.indexOf($scope.currentQuery.sort) == -1) {
                delete $scope.currentQuery.sort;
            }

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = categories;
            });

            //-------------------- Query to Catalog --------------
            $scope.toCatalog = function () {
                var count = searchService.getSize();
                var off = 0;
                var error = false;
                $scope.catalogEntries = [];

                if (count >= 1000)
                    return;

                while (count >= 0) {
                    var query = angular.extend({offset: off, limit: 50}, $scope.currentQuery.toFlatObject());
                    var entities = Entity.query(query);

                    setTimeout(function () {
                        if (!entities.entities) {
                            //zu lagsam, mehr Zeit
                            setTimeout(function () {
                                for (var i = 0; i <= entities.entities.length - 1; i++) {
                                    $scope.catalogEntries[off + i] = {
                                        "arachneEntityId": entities.entities[i].entityId,
                                        "label": entities.entities[i].title,
                                        "text": entities.entities[i].subtitle
                                    }
                                }
                                off += 50;
                            }, 1000);

                        } else {
                            for (var i = 0; i <= entities.entities.length - 1; i++) {
                                $scope.catalogEntries[off + i] = {
                                    "arachneEntityId": entities.entities[i].entityId,
                                    "label": entities.entities[i].title,
                                    "text": entities.entities[i].subtitle
                                }
                            }
                            off += 50;
                        }

                    }, 500);

                    count -= 50;
                }

                var text = $scope.currentQuery.toFlatObject().q;

                for (var i = 0; i <= $scope.currentQuery.toFlatObject().fq.length - 1; i++) {
                    text = text + " " + $scope.currentQuery.toFlatObject().fq[i];
                }
                if (!error) {
                    var bufferCatalog = {
                        author: $scope.user.username,
                        root: {
                            label: $scope.currentQuery.label,
                            text: text,
                            children: $scope.catalogEntries
                        }
                    };
                    var catalogFromSearch = $uibModal.open({
                        templateUrl: 'partials/Modals/editCatalog.html',
                        controller: 'EditCatalogController',
                        resolve: {
                            catalog: function () {
                                return bufferCatalog
                            }
                        }
                    });
                    catalogFromSearch.close = function (newCatalog) {
                        newCatalog.public = false;
                        Catalog.save({}, newCatalog, function (result) {
                        });
                        catalogFromSearch.dismiss();
                    }
                }
            };

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

        }
    ]);