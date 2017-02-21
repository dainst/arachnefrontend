'use strict';

angular.module('arachne.controllers')

/**
 * Handles password change requests.
 *
 * @author: Patrick Jominet
 */
    .controller('PwdChangeController', ['$scope', '$location', 'PwdChange', 'messageService', '$filter',
        function ($scope, $location, PwdChange, messages, $filter) {

            /**
             * The original user object will be copied so the original does not get modified.
             * The copy get send to the backend and will contain the md5 encrypted pwd. If that would
             * modify the reference which is bound to the scope
             * and the request would be rejected, the md5 passes would enter
             * the form and upon a successful request it would be encrypted again and as a result
             * unusable as it would be different from what the user entered.
             * @param user
             */
            var copyUser = function (user) {
                var changedUser = JSON.parse(JSON.stringify(user));

                if (user.password)
                    changedUser.password = $filter('md5')(user.password);
                if (user.newPassword)
                    changedUser.newPassword = $filter('md5')(user.newPassword);
                if (user.newPasswordValidation)
                    changedUser.newPasswordValidation = $filter('md5')(user.newPasswordValidation);

                return changedUser;
            };


            var handleChangeError = function (data) {
                if (data.data.message != undefined)
                    messages.add(data.data.message, 'danger', false);
                else
                    messages.add('ui.passwordchange.wrongpassword', 'danger', false);
                clearInput();
            };

            var handleChangeSuccess = function () {
                messages.dontClearOnNextLocationChange();
                messages.add('ui.passwordchange.success', 'success');
                $location.path("/user");
            };

            /**
             * check if the new password and its validation match up
             * @param user
             */
            var checkNewPassword = function (user) {
                if(user.newPassword != user.newPasswordValidation)
                    messages.add('ui.passwordchange.wrongCheck', 'danger', false);
                if(user.password == user.newPassword)
                    messages.add('ui.passwordchange.illegal', 'danger', false);
            };

            /**
             * reset form to prevent entered data to be to send again
             * or the hash being copied into the form and being visible
             */
            var clearInput = function () {
              $scope.user = null;
            };

            $scope.submit = function () {

                if ($scope.user == undefined) {
                    messages.add('ui.passwordreset.fieldMissing.all', 'danger', false);
                    return;
                }

                var changedUser = copyUser($scope.user);
                checkNewPassword(changedUser);
                PwdChange.save({},
                    changedUser,
                    handleChangeSuccess,
                    handleChangeError
                );
            }
        }]);