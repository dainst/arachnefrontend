'use strict';

angular.module('arachne.controllers')

//Edit User Form
.controller('EditUserController', ['$rootScope', '$scope', '$http', '$filter', 'arachneSettings', 'registerService', 'authService', '$modal',
function ($rootScope, $scope, $http, $filter, arachneSettings, registerService, authService, $modal) {

    $rootScope.hideFooter = false;

    $scope.userBuffer = authService.getUser();

    var buffer = {};
    $scope.user = {};
    $scope.success = false;
    $scope.error = "";

    $http.get(arachneSettings.dataserviceUri + "/userinfo/" + $scope.userBuffer.username
    ).success(function(data) {

            //Original values -> Values the User can change
            buffer.email = data.email;
            buffer.firstname = data.firstname;
            buffer.lastname = data.lastname;
            buffer.institution = data.institution;
            buffer.homepage = data.homepage;
            buffer.country = data.country;
            buffer.place = data.place;
            buffer.street = data.street;
            buffer.zip = data.zip;
            buffer.username = data.username;
            buffer.phone = data.phone;

            //Values to change
            $scope.user = data;

        }).error(function(data) {
            $scope.error = data.message;
        });

    $scope.submit = function() {

        //check E-Mail validation
        if($scope.user.email != $scope.user.emailValidation && $scope.user.email != buffer.email)
        {
            console.log("emailValidation failed");
            var msg = "emailValidation";
            var emailFail = $modal.open({
                templateUrl: 'partials/Modals/errorModal.html',
                controller: function ($scope) { $scope.msg = msg},
                resolve: { msg: function() { return msg } }
            });
            emailFail.close = function() {
                emailFail.dismiss();
            };
        }
        else if(!$scope.user.iAmHuman)
        {
            //check Human Validation
            console.log("HumanValidation failed");
            var msg = "iAmHuman";
            var iAmHuman = $modal.open({
                templateUrl: 'partials/Modals/errorModal.html',
                controller: function ($scope) { $scope.msg = msg},
                resolve: { msg: function() { return msg } }
            });
            iAmHuman.close = function() {
                iAmHuman.dismiss();
            };
        }
        else
        {
            var sendUser = {};
            sendUser.iAmHuman = $scope.user.iAmHuman;

            //check for updates
            for(var item in buffer)
            {
                if($scope.user[item] != buffer[item])
                    sendUser[item] = $scope.user[item];
            }

            //send changed Data to Backend
            $http.put(arachneSettings.dataserviceUri + "/userinfo/" + $scope.userBuffer.username, sendUser, {
                "headers": { "Content-Type": "application/json" }
            }).success(function(data) {
                $scope.error = "";
                $scope.success = true;
            }).error(function(data) {
                $scope.error = data.message;
            });
        }
    }
}]);