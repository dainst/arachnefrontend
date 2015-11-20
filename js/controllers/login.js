'use strict';

angular.module('arachne.controllers')

.controller('LoginController', ['$scope', '$modalInstance', 'authService', '$timeout', '$modal', '$window',
function($scope, $modalInstance, authService, $timeout, $modal, $window){

    $scope.loginData = {};
    $scope.loginerror = false;

    $scope.login = function() {

        authService.setCredentials($scope.loginData.user, $scope.loginData.password, function(response) {
            $scope.loginerror = false;
            var closeModal = function () {
                $modalInstance.close(authService.getUser());
                $route.reload();
            }
            $timeout(closeModal, 500);
        }, function(response) {
            $scope.loginerror = true;
        });

    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);