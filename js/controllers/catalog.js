'use strict';

angular.module('arachne.controllers')

/**
 * Handles the layout for viewing a catalog.
 *
 * @author: Sebastian Cuy
 */
    .controller('CatalogController', ['$scope', '$stateParams', function ($scope, $stateParams) {
        $scope.id = $stateParams.id;
    }
    ]);