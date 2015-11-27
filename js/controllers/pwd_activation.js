'use strict';

angular.module('arachne.controllers')

/**
 * set new Passwort
 */
.controller('PwdActivationController', ['$scope', '$stateParams', '$filter', '$http',  'arachneSettings',
function ($scope, $stateParams, $filter, $http, arachneSettings) {
    var token = $stateParams.token;
    $scope.success = false;
    $scope.error = "";

    $scope.submit = function() {
        if ($scope.password && $scope.passwordConfirm) {
            $scope.usrData.password = $filter('md5')($scope.password);
            $scope.usrData.passwordConfirm = $filter('md5')($scope.passwordConfirm);
        }
        $http.post(arachneSettings.dataserviceUri + "/user/activation/" + token, $scope.usrData, {
            "headers": { "Content-Type": "application/json" }
        }).success(function(data) {
            $scope.error = "";
            $scope.success = true;
        }).error(function(data) {
            $scope.error = data.message;
        });
    }
}]);
