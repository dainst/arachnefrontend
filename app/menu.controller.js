'use strict';

angular.module('arachne.controllers')

    .controller('MenuController', ['$scope', '$uibModal', 'authService', '$location', '$window',
        function ($scope, $uibModal, authService, $location, $window) {

            $scope.user = authService.getUser();

            $scope.currentPath = $location.path();
            $scope.$on("$locationChangeSuccess", function () {
                $scope.currentPath = $location.path();
            });

            $scope.openLoginModal = function () {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/users/login-form.html',
                    controller: 'LoginController'
                });
                modalInstance.result.then(function (user) {
                    $window.location.reload();
                });
            };

            $scope.logout = function () {
                authService.clearCredentials();
                $scope.user = authService.getUser();
                $window.location.reload();
            }
        }]);