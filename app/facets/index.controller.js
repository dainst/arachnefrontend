angular.module('arachne.controllers')
    .controller('IndexController', ['$rootScope', '$scope', 'categoryService', 'Entity', 'Query', '$stateParams', '$http','$filter', '$location',
        function ($rootScope, $scope, categoryService, Entity, Query, $stateParams, $http, $filter, $location) {
            $scope.currentCategory = undefined;
            $scope.currentFacet = undefined;
            $scope.currentValue = undefined;
            $scope.groupedBy = undefined;

            $scope.entityResultSize = 0;

            $scope.minPanelSize = 14;
            $scope.panelSize = 14;

        	categoryService.getCategoriesAsync().then(function (categories) {

        	    var temp = [];
                for (var key in categories) {
                    if (categories[key].status != 'none') {
                        temp.push(categories[key]);
                    }
                }

                if(temp.length >= $scope.minPanelSize) $scope.panelSize = temp.length;

                $scope.categories = temp.sort(function (a, b) {
                    if(a.title < b.title) return -1;
                    if(a.title > b.title) return 1;
                    return 0;
                });
            });

            $rootScope.$on('$locationChangeSuccess', function () {
                load()
            });

            function loadFacets() {
                if ($stateParams.c) { 
                    if ($stateParams.c == $scope.currentCategory) return;

                    $scope.currentCategory = $stateParams.c;
                    $scope.currentFacet = undefined;
                    $scope.currentCategoryQuery = new Query().addFacet("facet_kategorie", $stateParams.c);
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

                        for(var i = 0; i < filteredFacets.length; i++) {
                            if(itemCounter == $scope.panelSize) {
                                $scope.facets.push([]);
                                pageCounter += 1;
                                itemCounter = 0;
                            }

                            $scope.facets[pageCounter].push(filteredFacets[i]);
                            itemCounter += 1;
                        }

                        if($scope.currentFacetPage == undefined) $scope.currentFacetPage = 0;
                        $scope.resultSize = response.size;
                    });
                } else {
                    $scope.facets = undefined;
                    $scope.facetValues = undefined;
                }
            }

            $scope.previousFacetPage = function() {
                $scope.currentFacetPage -= 1;
            };

            $scope.nextFacetPage = function() {
                $scope.currentFacetPage += 1;
            };

            function loadFacetValues() {

                if ($stateParams.fq) {
                    if ($scope.currentFacet == $stateParams.fq
                            && $scope.currentValue == $stateParams.fv
                            && $scope.groupedBy == $stateParams.group){
                        return;
                    }

                    $scope.currentFacet = $stateParams.fq;
                    $scope.currentValue = $stateParams.fv;

                    var url = '/data/index/' + $stateParams.fq;
                    if ($stateParams.group) {
                        $scope.groupedBy = $stateParams.group;
                        url += "?group=" + $scope.groupedBy;
                    } else {
                        $scope.groupedBy = undefined;
                    }
                    $http.get(url).success(function (data) {
                        var preprocessedValues = data.facetValues.filter( function(value){ return value.trim() != ""});
                        preprocessedValues = preprocessedValues.map(function(value) {
                            return value.trim();
                        });
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

                        for(var i = 0; i < preprocessedValues.length; i++) {
                            if(itemCounter + 2 == $scope.panelSize * 2) {
                                $scope.facetValues.push([]);
                                pageCounter += 1;
                                itemCounter = 0;
                            }
                            $scope.facetValues[pageCounter].push(preprocessedValues[i]);
                            itemCounter += 1;
                        }

                        if($scope.currentValuePage == undefined) $scope.currentValuePage = 0;
                    });
                } else {
                    $scope.facetValues = undefined;
                    $scope.currentFacetValue = undefined;
                }
            }

            $scope.previousValuePage = function() {
                $scope.currentValuePage -= 1;
            };

            $scope.nextValuePage = function() {
                $scope.currentValuePage += 1;
            };

            $scope.startIndexSearch = function() {
                $location.url("search" + getCurrentQuery().toString());
            };

            function updatePreviewResultSize() {
                Entity.query(getCurrentQuery().toFlatObject(), function (response) {
                    $scope.entityResultSize = response.size;
                });
            }

            function getCurrentQuery() {
                var query = new Query();

                if($stateParams.c){
                    query = query.addFacet("facet_kategorie", $stateParams.c)
                }

                if($stateParams.fq && $stateParams.fv){
                    query = query.addFacet($stateParams.fq, $stateParams.fv)
                }

                query.q = "*";
                return query;
            }

            function load() {
                loadFacets();
                loadFacetValues();
                updatePreviewResultSize();
            }

            load();
        }
    ]);
