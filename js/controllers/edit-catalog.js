'use strict';

angular.module('arachne.controllers')

    .controller('EditCatalogController', ['$scope', '$uibModalInstance', 'catalog', 'Entity',
        function ($scope, $uibModalInstance, catalog, Entity) {
            $scope.catalog = catalog;
            $scope.edit = Entity;
        }
    ]);