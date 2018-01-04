'use strict';

angular.module('arachne.controllers')

    .controller('LoginController', ['$scope', '$uibModalInstance', 'authService', '$timeout',
        function ($scope, $uibModalInstance, authService, $timeout) {

            $scope.loginData = {};
            $scope.loginerror = false;

            $scope.login = function () {

                authService.setCredentials($scope.loginData.user, $scope.loginData.password, function (response) {
                    $scope.loginerror = false;
                    var closeModal = function () {
                        $uibModalInstance.close(authService.getUser());
                    };
                    $timeout(closeModal, 500);
                }, function (response) {
                    console.log("!!!!");
                    $scope.loginerror = true;
                });

            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
        }]);