'use strict';

angular.module('arachne.controllers')

/**
 * Handles display of login form for access via /login URL
 *
 * @author: Sebastian Cuy
 */
.controller('LoginController', ['$scope', '$location', '$uibModal',
        '$window', 'authService', '$stateParams',
    function ($scope, $location, $uibModal,
            $window, authService, $stateParams) {

        var user = authService.getUser();
        var redirectUrl = $stateParams.redirectTo || '/';

        if (user) {
            $window.location.href = redirectUrl;
        } else {
            var modalInstance = $uibModal.open({
                template: require('./login-form.html'),
                controller: 'LoginFormController'
            });
            modalInstance.result.then(function (user) {
                $window.location.href = redirectUrl;
            });
        }

    }
]);
