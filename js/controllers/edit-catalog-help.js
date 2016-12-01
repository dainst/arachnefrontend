'use strict';

angular.module('arachne.controllers')

    .controller('EditCatalogHelpController', ['$scope',
        function ($scope) {
            $scope.currentPage = 0;
            $scope.totalPages = 5;

            $scope.nextPage = function() {
                if ($scope.currentPage < $scope.totalPages - 1) {
                    $scope.currentPage++;
                }
            };

            $scope.previousPage = function() {
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                }
            };
        }
    ]);