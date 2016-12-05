'use strict';

angular.module('arachne.controllers')

    .controller('EditCatalogController', ['$scope', '$uibModalInstance', 'catalog',
        function ($scope, $uibModalInstance, catalog) {
            $scope.catalog = catalog;
            $scope.edit = catalog.hasOwnProperty("public");
        }
    ]);