'use strict';

angular.module('arachne.controllers')

    .controller('EditCatalogController', ['$scope', '$uibModalInstance', 'catalog', 'edit',
        function ($scope, $uibModalInstance, catalog, edit) {
            $scope.catalog = catalog;
            $scope.edit = edit;
        }
    ]);