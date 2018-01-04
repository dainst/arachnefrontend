'use strict';

angular.module('arachne.controllers')

//Contact Form Controller
    .controller('ContactController', ['$scope', '$uibModal', 'contactService', 'transl8',
        function ($scope, $uibModal, contactService, transl8) {

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

            $scope.success = false;
            $scope.error = "";

            $scope.submit = function () {
                contactService.sendContact($scope.usrData,
                    function (data) {
                        $scope.error = "";
                        $scope.success = true;
                    },
                    function (error) {
                        $scope.error = data.message;
                    }
                );
            }
        }]);