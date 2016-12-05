'use strict';

angular.module('arachne.controllers')

//Contact Form Controller
    .controller('ContactController', ['$scope', '$http', '$uibModal', 'contactService',
        function ($scope, $http, $uibModal, contactService) {

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