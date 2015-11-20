'use strict';

angular.module('arachne.controllers')

/**
* Register Form
*/
.controller('RegisterController', ['$rootScope', '$scope', '$http', '$filter', 'arachneSettings', 'registerService',
function ($rootScope, $scope, $http, $filter, arachneSettings, registerService) {

    $rootScope.hideFooter = false;

    $scope.user = {};
    $scope.success = false;
    $scope.error = "";

    $scope.submit = function() {
        if ($scope.password && $scope.passwordValidation) {
            $scope.user.password = $filter('md5')($scope.password);
            $scope.user.passwordValidation = $filter('md5')($scope.passwordValidation);
        }
        registerService.sendContact($scope.user,
            function (data) {
                $scope.error = "";
                $scope.success = true;
            },
            function (error) {
                $scope.error = data.message;
            }
        );
    }
        /*$http.post(arachneSettings.dataserviceUri + "/user/register", $scope.user, {
         "headers": { "Content-Type": "application/json" }
         }).success(function(data) {
         $scope.error = "";
         $scope.success = true;
         }).error(function(data) {
         $scope.error = data.message;
         });*/

}
]);