angular.module('arachne.controllers')
    .controller('IndexController', ['$rootScope', '$scope', 'categoryService', 'Entity', 'Query', '$stateParams', '$http','$filter',
        function ($rootScope, $scope, categoryService, Entity, Query, $stateParams, $http, $filter) {
            $scope.currentCategory = undefined;
            $scope.currentFacet = undefined;
            $scope.currentValue = undefined;
            $scope.groupedBy = undefined;
            $scope.entities = [];
            $scope.entityResultSize = 0;

        	categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = [];
                for (var key in categories) {
                    if (categories[key].status != 'none') {
                        $scope.categories.push(categories[key]);
                    }
                }
            });

            $rootScope.$on('$locationChangeSuccess', function () {
                load()
            });
            
            function loadFacets() {
                if ($stateParams.c) { 
                    if ($stateParams.c == $scope.currentCategory) return;
                    $scope.currentCategory = $stateParams.c
                    $scope.currentCategoryQuery = new Query().addFacet("facet_kategorie", $stateParams.c);
                    $scope.currentCategoryQuery.q = "*";
                    
                    Entity.query($scope.currentCategoryQuery.toFlatObject(), function (response) {
                        $scope.facets = response.facets;
                        $scope.resultSize = response.size;
                    });
                }
            }

            function loadFacetValues() {
                if ($stateParams.fq) {
                    if ($scope.currentFacet == $stateParams.fq && $scope.groupedBy == $stateParams.group) return;

                    var url = '/data/index/' + $stateParams.fq;
                    if ($stateParams.group) {
                        $scope.groupedBy = $stateParams.group;
                        url += "?group=" + $scope.groupedBy;
                    } else {
                        $scope.groupedBy = undefined;
                    }
                    $http.get(url).success(function (data) {
                        $scope.values = data.facetValues;
                        $scope.currentFacet = $stateParams.fq
                    });
                } else {
                    $scope.values = [];
                    $scope.currentFacet = undefined;
                    $scope.entityResultSize = 0;
                }
            }
            
            function loadEntities() {
                if ($stateParams.fv) {
                    if ($scope.currentValue == $stateParams.fv) return;

                    $scope.currentQuery = new Query().addFacet("facet_kategorie", $stateParams.c).addFacet($stateParams.fq, $stateParams.fv);
                    $scope.currentQuery.q = "*";
                    
                    Entity.query($scope.currentQuery.toFlatObject(), function (response) {
                        $scope.entities = $filter('cellsFromEntities')(response.entities, $scope.currentQuery);
                        $scope.currentValue = $stateParams.fv
                        window.scrollTo({'top':0})
                        $scope.entityResultSize = response.size;
                    });
                } else {
                    $scope.entities = [];
                    $scope.currentValue = undefined;
                    $scope.entityResultSize = 0;
                }
            }
            function load() {
                loadFacets();
                loadFacetValues();
                loadEntities();
            }
            load();
        }
    ]);
