'use strict';

angular.module('arachne.controllers')

/**
 * Handles password change requests.
 *
 * @author: Patrick Jominet
 */
    .controller('PwdChangeController', ['$scope', '$location', 'PwdChange', 'messageService', 'md5',
        function ($scope, $location, PwdChange, messages, md5) {

            var hashPasswords = function () {
                $scope.user.password = md5.createHash($scope.user.password || '');
                $scope.user.newPassword = md5.createHash($scope.user.newPassword || '');
                $scope.user.newPasswordValidation = md5.createHash($scope.user.newPasswordValidation || '');
            };


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

                checkNewPassword();
                hashPasswords();
                console.log($scope.user);
                PwdChange.save({},
                    $scope.user,
                    handleChangeSuccess,
                    handleChangeError
                );
            }
        }]);