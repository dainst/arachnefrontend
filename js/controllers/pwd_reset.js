'use strict';

angular.module('arachne.controllers')

/**
 * Handles password reset requests.
 *
 * @author: Daniel M. de Oliveira
 */
.controller('PwdResetController', ['$scope', '$location', 'Password', 'message',
function ($scope, $location, Password, message) {


    var handleResetError = function(data){
        if (data.data.message!=undefined)
            message.addMessageForCode(data.data.message,'danger',false);
        else
            message.addMessageForCode('ui.passwordreset.unkownuser','danger',false)
    };

    var handleResetSuccess = function(data){
        message.dontClearOnNextLocationChange();
        message.addMessageForCode('ui.passwordreset.success', 'success');
        $location.path("/");
    };

    $scope.submit = function() {

        if ($scope.user==undefined) {
            message.addMessageForCode('ui.passwordreset.fieldMissing.all','danger',false);
            return;
        }

        Password.save({},
            $scope.user,
            handleResetSuccess,
            handleResetError
        );
    }
}]);