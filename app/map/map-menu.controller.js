'use strict';

angular.module('arachne.widgets.map')

    .controller('MapMenuController', ['$scope', 'searchService',
        function ($scope, searchService) {

            $scope.leftMenuToggled = true;
            $scope.rightMenuToggled = true;

            $scope.overlaysActive = function () {
                return (searchService.currentQuery().overlays ? true : false);
            }
        }
    ]);