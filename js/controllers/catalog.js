'use strict';

angular.module('arachne.controllers', ['ui.bootstrap'])

/**
 * Handles the layout for viewing a catalog.
 *
 * @author: Sebastian Cuy
 */
    .controller('CatalogController', ['$scope', '$stateParams', function ($scope, $stateParams) {
        $scope.id = $stateParams.id;
    }
    ]);