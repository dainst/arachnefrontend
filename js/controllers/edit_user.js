'use strict';

angular.module('arachne.controllers')

/**
 * Edit User Form.
 *
 * $scope
 *   user the logged in users personal information.
 *   submit function which sends the user data to the backend in order to update personal information.
 */
.controller('EditUserController', [ '$scope', '$http', 'arachneSettings', 'authService', 'message',
function ($scope, $http, arachneSettings, authService, message) {

    var HEADERS = {
        "headers": { "Content-Type": "application/json" }
    };

    /**
     * Pushes a new message to the message service
     * and removes the last shown message.
     *
     * @param msgKey
     * @param level
     */
    var putMsg= function(msgKey,level) {
        message.clear();
        message.addMessageForCode(msgKey,level,false);
    };

    /**
     * The backend will reject modification of some fields. These
     * will be filtered out here.
     *
     * @param user
     * @return a new user object without non writable properties.
     */
    var filterWriteProtectedProperties= function(user) {
        var newUser= JSON.parse(JSON.stringify(user));
        delete newUser.groupID;
        delete newUser.datasetGroups;
        delete newUser.emailValidation;
        return newUser;
    };


    $http.get(arachneSettings.dataserviceUri + "/userinfo/" + authService.getUser().username
    ).success(function(data) {
            $scope.user = data;
            $scope.user.emailValidation= $scope.user.email;
    }).error(function(data) {
            console.log("no user info found for user "+ authService.getUser().username);
    });


    $scope.submit = function() {

        if($scope.user.email != $scope.user.emailValidation) {
            putMsg('ui.update.emailNotSame','danger');
            return;
        }

        $http.put(arachneSettings.dataserviceUri + "/userinfo/" + authService.getUser().username,
            filterWriteProtectedProperties($scope.user),
            HEADERS
        ).success(function(data) {
            putMsg('ui.update.success','success')
        }).error(function(data) {
            putMsg(data.message,'danger');
        });
    }
}]);