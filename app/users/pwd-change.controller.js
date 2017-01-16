'use strict';

angular.module('arachne.controllers')

/**
 * Handles password reset requests.
 *
 * @author: Patrick Jominet
 */
    .controller('PwdChangeController', ['$scope', '$location', 'PwdChange', 'messageService',
        function ($scope, $location, PwdChange, messages) {

            var handleChangeError = function (data) {
                if (data.data.message != undefined)
                    messages.add(data.data.message, 'danger', false);
                else
                    messages.add('ui.passwordchange.wrongpassword', 'danger', false)
            };

            var handleChangeSuccess = function () {
                messages.dontClearOnNextLocationChange();
                messages.add('ui.passwordchange.success', 'success');
                $location.path("/user");
            };

            var checkNewPassword =function () {
                if($scope.user.newPassword != $scope.user.newPasswordValidation)
                    messages.add('ui.passwordchange.wrongCheck', 'danger', false);
            };

            $scope.submit = function () {

                if ($scope.user == undefined) {
                    messages.add('ui.passwordreset.fieldMissing.all', 'danger', false);
                    return;
                }

                console.log($scope.user);
                console.log($scope.user.password);
                checkNewPassword();
                PwdChange.save({},
                    $scope.user,
                    handleChangeSuccess,
                    handleChangeError
                );
            }
        }]);