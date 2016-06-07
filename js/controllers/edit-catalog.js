'use strict';

angular.module('arachne.controllers', ['ui.bootstrap'])

    .controller('EditCatalogController', ['$scope', '$uibModalInstance', 'Entity', 'entry',
        function ($scope, $uibModalInstance, catalog, edit) {
            $scope.catalog = catalog;
            $scope.edit = edit;
        }
    ]);