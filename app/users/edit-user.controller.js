'use strict';

angular.module('arachne.controllers')

/**
 * Edit User Form.
 *
 * $scope
 *   user the logged in users personal information.
 *   submit function which sends the user data to the backend in order to update personal information.
 */
    .controller('EditUserController', ['$scope', '$http', '$sce', 'arachneSettings', 'authService', 'messageService', '$timeout', 'transl8',
        function ($scope, $http, $sce, arachneSettings, authService, messages, $timeout, transl8) {

            $scope.formChange = false;

            $scope.dataChanged = function () {
                $scope.formChange = true;
            };

            window.onbeforeunload = function () {

                if ($scope.formChange) {
                    return transl8.getTranslation('ui_unsaved-changes');
                }
            };

            $scope.$on('$locationChangeStart', function (event, next, current) {

                if ($scope.formChange && next !== current) {

                    var answer = confirm(transl8.getTranslation('ui_unsaved-changes'));
                    if (!answer) {
                        event.preventDefault();
                    }
                }
            });

            var HEADERS = {
                "headers": {"Content-Type": "application/json"}
            };

            /**
             * Pushes a new message to the message service
             * and removes the last shown message.
             *
             * @param msgKey
             * @param level
             */
            var putMsg = function (msgKey, level) {
                messages.clear();
                messages.add(msgKey, level, false);
            };

            /**
             * The backend will reject modification of some fields. These
             * will be filtered out here.
             *
             * @param user
             * @return a new user object without non writable properties.
             */
            var filterWriteProtectedProperties = function (user) {
                var newUser = JSON.parse(JSON.stringify(user));
                delete newUser.groupID;
                if (newUser.datasetGroups !== undefined) {
                    delete newUser.datasetGroups;
                }
                delete newUser.emailValidation;
                return newUser;
            };

            $scope.user = authService.getUser();

            if ($scope.user) {

                $http.get(arachneSettings.dataserviceUri + "/userinfo/" + authService.getUser().username)
                    .then(function (result) {

                        var data = result.data;
                        $scope.user = data;
                        $scope.user.emailValidation = $scope.user.email;
                    }).catch(function (data) {
                    console.log("no user info found for user " + authService.getUser().username);
                });
            } else {
                $timeout(function () {
                    putMsg('ui_not_logged_in', 'warning')
                }, 500);
            }


            $scope.submit = function () {

                $scope.formChange = false;

                if ($scope.user.email != $scope.user.emailValidation) {
                    putMsg('ui.update.emailNotSame', 'danger');
                    return;
                }

                $http.put(arachneSettings.dataserviceUri + "/userinfo/" + authService.getUser().username,
                    filterWriteProtectedProperties($scope.user),
                    HEADERS
                ).then(function (data) {
                    putMsg('ui.update.success', 'success')
                }).catch(function (data) {
                    putMsg(data.message, 'danger');
                });
            }
        }]);