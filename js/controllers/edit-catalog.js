'use strict';

angular.module('arachne.controllers')

    .controller('EditCatalogController', ['$scope', '$uibModalInstance', 'Catalog', 'CatalogEntry',
        function ($scope, $uibModalInstance, Catalog, CatalogEntry) {
            $scope.catalog = Catalog;
            $scope.edit = CatalogEntry;
        }
    ]);