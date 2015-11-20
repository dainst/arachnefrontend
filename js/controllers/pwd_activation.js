'use strict';

angular.module('arachne.controllers')

/**
 * set new Passwort
 */
.controller('PwdActivationController', ['$scope', '$routeParams', '$filter', '$http',  'arachneSettings',
function ($scope, $routeParams, $filter, $http, arachneSettings) {
    var token = $routeParams.token;
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
