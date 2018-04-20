'use strict';

angular.module('arachne.controllers')

/**
 * Handles display of login form for access via /login URL
 *
 * @author: Sebastian Cuy
 */
.controller('LoginController', ['$scope', '$location', '$uibModal', '$window', 'authService',
    function ($scope, $location, $uibModal, $window, authService) {

        var user = authService.getUser();

        if (user) {
            $window.location.href = '/';
        } else {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/users/login-form.html',
                controller: 'LoginFormController'
            });
            modalInstance.result.then(function (user) {
                $window.location.href = '/';
            });
        }

    }
]);
