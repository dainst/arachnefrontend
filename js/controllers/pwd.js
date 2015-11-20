'use strict';

angular.module('arachne.controllers')

//create Passwort reset request
.controller('PwdController', ['$scope', '$http',  'arachneSettings', 'resetService',
function ($scope, $http, arachneSettings, resetService) {

    $scope.success = false;
    $scope.error = "";

    $scope.submit = function() {
        resetService.resetpwd($scope.usrData,
            function(data){
                $scope.error = "";
                $scope.success = true;
            },
            function(error){
                $scope.error = data.message;
            }
        );
    }
}]);