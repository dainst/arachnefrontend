'use strict';

angular.module('arachne.controllers', ['ui.bootstrap'])

    .controller('EditCatalogEntryController', ['$scope', '$uibModalInstance', 'Entity', 'entry',
        function ($scope, $uibModalInstance, Entity, entry) {
            $scope.entry = entry;
            $scope.edit = true;
            if ($scope.entry.arachneEntityId) {
                $scope.entity = Entity.get({id:$scope.entry.arachneEntityId});
            }
        }
    ]);