'use strict';

angular.module('arachne.controllers')

    .controller('CategoryController', ['$rootScope', '$scope', '$uibModal', 'Query', '$http', 'arachneSettings', 'categoryService', '$location', 'Entity',
        function ($rootScope, $scope, $uibModal, Query, $http, arachneSettings, categoryService, $location, Entity) {

            $rootScope.hideFooter = false;

            $scope.category = $location.search().c;

            categoryService.getCategoriesAsync().then(function (categories) {

                $scope.title = categories[$scope.category].title;
                $scope.queryTitle = categories[$scope.category].queryTitle;
                $scope.imgUri = categories[$scope.category].imgUri;
                $scope.subtitle = categories[$scope.category].subtitle;
                $scope.mapfacet = categories[$scope.category].geoFacet;
                $scope.currentQuery = new Query().addFacet("facet_kategorie", $scope.queryTitle);
                $scope.currentQuery.q = "*";

                Entity.query($scope.currentQuery.toFlatObject(), function (response) {
                    $scope.facets = response.facets;
                    $scope.resultSize = response.size;
                });
            });

            $scope.search = function() {
                var query = $scope.currentQuery.setParam('q', $scope.q);
                $location.url('/search' + query.toString());
            }

        }
    ]);