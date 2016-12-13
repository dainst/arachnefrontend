'use strict';

angular.module('arachne.controllers')

    .controller('DeleteCatalogController', ['$scope', '$uibModalInstance',
        function ($scope, $uibModalInstance) {

            $scope.catalogName = $scope.catalog.root.label;
            $scope.inputCatalogName = "";
        }
    ]);