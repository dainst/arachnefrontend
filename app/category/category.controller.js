'use strict';

angular.module('arachne.controllers')

    .controller('CategoryController', ['$rootScope', '$scope', '$uibModal', 'Query', '$http', 'arachneSettings', 'categoryService', '$location', 'Entity', '$filter',
        function ($rootScope, $scope, $uibModal, Query, $http, arachneSettings, categoryService, $location, Entity, $filter) {


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

            $scope.search = function() {
                var query = $scope.currentQuery.setParam('q', $scope.q);
                $location.url('/search' + query.toString());
            }

            function loadFacets() {

                    $scope.currentCategoryQuery = new Query().addFacet("facet_kategorie", $scope.queryTitle);
                    $scope.currentCategoryQuery.q = "*";

                    Entity.query($scope.currentCategoryQuery.toFlatObject(), function (response) {
                        var filteredFacets = response.facets.filter( function(facet){ return facet.name != "facet_geo"});

                        filteredFacets = filteredFacets.sort(function (a, b) {
                            if($filter('transl8')(a.name).toLowerCase() < $filter('transl8')(b.name).toLowerCase()) return -1;
                            if($filter('transl8')(a.name).toLowerCase() > $filter('transl8')(b.name).toLowerCase()) return 1;
                            return 0;
                        });

                        var itemCounter = 0;
                        var pageCounter = 0;
                        $scope.facets = [[]];
                        $scope.facetCount = filteredFacets.length;

                        $scope.currentFacetPage = 0;
                        $scope.currentEntityPage = 0;

                        for(var i = 0; i < filteredFacets.length; i++) {
                            if(itemCounter == $scope.panelSize) {
                                $scope.facets.push([]);
                                pageCounter += 1;
                                itemCounter = 0;
                            }

                            if(filteredFacets[i].name == $scope.currentFacet){
                                $scope.currentFacetPage = pageCounter;
                            }

                            $scope.facets[pageCounter].push(filteredFacets[i]);
                            itemCounter += 1;
                        }
                        $scope.resultSize = response.size;
                    });
                
            }

            function loadFacetValues() {

                if ($location.search().fq) {

                    if ($scope.currentFacet == $location.search().fq
                            && $scope.currentValue == $location.search().fv
                            && $scope.groupedBy == $location.search().group
                            && $scope.facetValues){
                        return;
                    }

                    if($scope.groupedBy != $location.search().group){
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

                    $http.get(url).then(function (data) {

                        var preprocessedValues = data.facetValues.filter( function(value) {
                            return value.trim() != ""}
                            );

                        preprocessedValues = preprocessedValues.map(function(value) {
                            return value.trim();
                        });

                        // Filtering duplicates
                        var temp = preprocessedValues.filter(function(value, index, self){
                            return index == self.indexOf(value);
                        });
                        preprocessedValues = temp.sort(function (a, b) {
                            if(a.toLowerCase() < b.toLowerCase()) return -1;
                            if(a.toLowerCase() > b.toLowerCase()) return 1;
                            return 0;
                        });

                        var itemCounter = 0;
                        var pageCounter = 0;
                        $scope.facetValues = [[]];
                        $scope.valuesCount = preprocessedValues.length;

                        if(preprocessedValues.length + 2 < $scope.panelSize) {
                            $scope.valueRows = 1;
                        }
                        else {
                            $scope.valueRows = 2;
                        }

                        if($scope.facets != undefined) {
                            var currentIndex = 0;
                            for (var i = 0; i < $scope.facets[0].length; i++) {
                                if($scope.facets[0][i].name == $scope.currentFacet) {
                                    currentIndex = i; //This will be needed at thursday, 14.02.2017
                                    break;
                                }
                            }
                        }

                        $scope.currentValuePage = 0;
                        $scope.currentEntityPage = 0;
                        for(var i = 0; i < preprocessedValues.length; i++) {
                            if(itemCounter + 2 == $scope.panelSize * 2) {
                                $scope.facetValues.push([]);
                                pageCounter += 1;
                                itemCounter = 0;
                            }

                            $scope.facetValues[pageCounter].push(preprocessedValues[i]);
                            if(preprocessedValues[i] == $scope.currentValue){
                                $scope.currentValuePage = pageCounter;
                            }

                            itemCounter += 1;
                        }
                    });
                } else {
                    $scope.facetValues = undefined;
                    $scope.currentValue = undefined;
                }
            }

            $rootScope.$on('$locationChangeSuccess', function () {
                loadFacetValues();
                updatePreviewResultSize();
            });

            function getCurrentQuery() {
                var query = new Query();

                query = query.addFacet("facet_kategorie", $scope.queryTitle)

                if($location.search().fq && $location.search().fv){
                    query = query.addFacet($location.search().fq, $location.search().fv)
                }

                query.q = "*";
                return query;
            }

            function updatePreviewResultSize() {
                var query = getCurrentQuery();
                query.limit = $scope.entitiesSize;
                query.offset = $scope.currentEntityPage * $scope.entitiesSize
                Entity.query(query.toFlatObject(), function (response) {
                    $scope.entityResultSize = response.size;
                    $scope.entities = response.entities;
                    $scope.entitiesPageLength = Math.ceil(response.size/$scope.entitiesSize);
                });
            }

            $scope.previousFacetPage = function() {
                $scope.currentFacetPage -= 1;
            };
            $scope.nextFacetPage = function() {
                $scope.currentFacetPage += 1;
            };

            $scope.previousValuePage = function() {
                $scope.currentValuePage -= 1;
            };
            $scope.nextValuePage = function() {
                $scope.currentValuePage += 1;
            };

            $scope.previousEntityPage = function() {
                $scope.currentEntityPage -= 1;
                updatePreviewResultSize();
            };
            $scope.nextEntityPage = function() {
                $scope.currentEntityPage += 1;
                updatePreviewResultSize();
            };

            $scope.startIndexSearch = function() {
                $location.url("search" + getCurrentQuery().toString());
            };
        }
    ]);