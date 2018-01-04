'use strict';

angular.module('arachne.controllers')

    .controller('CategoryController', ['$rootScope', '$scope', '$uibModal', 'Query', '$http', 'arachneSettings', 'categoryService', '$location', 'Entity', '$filter', 'indexService',
        function ($rootScope, $scope, $uibModal, Query, $http, arachneSettings, categoryService, $location, Entity, $filter, indexService) {


            $scope.currentFacet = undefined;
            $scope.currentValue = undefined;
            $scope.groupedBy = undefined;
            $scope.entityResultSize = 0;
            $scope.minPanelSize = 14;
            $scope.panelSize = 14;

            $scope.entitiesSize = 10;
            $scope.currentEntityPage = 0;
            $scope.entitiesPageLength = 0;

            $rootScope.hideFooter = false;
            $scope.category = $location.search().c;

            $scope.entities = [];

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.title = categories[$scope.category].title;
                $scope.queryTitle = categories[$scope.category].queryTitle;
                $scope.imgUri = categories[$scope.category].imgUri;
                $scope.subtitle = categories[$scope.category].subtitle;
                $scope.mapfacet = categories[$scope.category].geoFacet;
                $scope.currentQuery = new Query().addFacet("facet_kategorie", $scope.queryTitle);
                $scope.currentQuery.q = "*";

                Entity.query($scope.currentQuery.toFlatObject(), function (response) {
                    //$scope.facets = response.facets;
                    $scope.resultSize = response.size;
                });

                loadFacets();
                loadFacetValues();
                updatePreviewResultSize();
            });

            $scope.search = function () {
                var query = $scope.currentQuery.setParam('q', $scope.q);
                $location.url('/search' + query.toString());
            };

            function loadFacets() {

                indexService.loadFacetsAsync($scope.queryTitle).then(function (filteredFacets) {

                    var itemsPerPage = 0;
                    var pageCounter = 0;
                    $scope.facets = [[]];
                    $scope.facetCount = filteredFacets.length;

                    $scope.currentFacetPage = 0;
                    $scope.currentEntityPage = 0;

                    for (var i = 0; i < filteredFacets.length; i++) {
                        if (itemsPerPage === $scope.panelSize) {
                            $scope.facets.push([]);
                            pageCounter += 1;
                            itemsPerPage = 0;
                        }

                        if (filteredFacets[i].name === $scope.currentFacet) {
                            $scope.currentFacetPage = pageCounter;
                        }

                        $scope.facets[pageCounter].push(filteredFacets[i]);
                        itemsPerPage += 1;
                    }
                });

            }

            function loadFacetValues() {

                if ($location.search().fq) {

                    if ($scope.currentFacet === $location.search().fq
                        && $scope.currentValue === $location.search().fv
                        && $scope.groupedBy === $location.search().group
                        && $scope.facetValues) {
                        return;
                    }

                    if ($scope.groupedBy !== $location.search().group) {
                        $scope.currentValuePage = 0;
                    }

                    $scope.currentFacet = $location.search().fq;
                    $scope.currentValue = $location.search().fv;

                    var url = '/data/index/' + $scope.queryTitle + '/' + $location.search().fq;
                    if ($location.search().group) {
                        $scope.groupedBy = $location.search().group;
                        url += "?group=" + $scope.groupedBy;
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
                } else {
                    $scope.facetValues = undefined;
                    $scope.currentValue = undefined;
                }
            }

            $scope.$on('$locationChangeSuccess', function(event, url) {
                console.log(url);
                if ($rootScope.isOnPage(url, ['category'])) {
                    loadFacetValues();
                    updatePreviewResultSize();
                }
            });

            function getCurrentQuery() {
                var query = new Query();

                query = query.addFacet("facet_kategorie", $scope.queryTitle);

                if ($location.search().fq && $location.search().fv) {
                    query = query.addFacet($location.search().fq, $location.search().fv)
                }

                query.q = "*";
                return query;
            }

            function updatePreviewResultSize() {
                var query = getCurrentQuery();
                query.limit = $scope.entitiesSize;
                query.offset = $scope.currentEntityPage * $scope.entitiesSize;
                Entity.query(query.toFlatObject(), function (response) {
                    $scope.entityResultSize = response.size;
                    $scope.entities = response.entities;
                    $scope.entitiesPageLength = Math.ceil(response.size / $scope.entitiesSize);
                });
            }

            $scope.previousFacetPage = function () {
                $scope.currentFacetPage -= 1;
            };
            $scope.nextFacetPage = function () {
                $scope.currentFacetPage += 1;
            };

            $scope.previousValuePage = function () {
                $scope.currentValuePage -= 1;
            };
            $scope.nextValuePage = function () {
                $scope.currentValuePage += 1;
            };

            $scope.previousEntityPage = function () {
                $scope.currentEntityPage -= 1;
                updatePreviewResultSize();
            };
            $scope.nextEntityPage = function () {
                $scope.currentEntityPage += 1;
                updatePreviewResultSize();
            };

            $scope.startIndexSearch = function () {
                $location.url("search" + getCurrentQuery().toString());
            };
        }
    ]);