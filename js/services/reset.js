'use strict';

angular.module('arachne.services')

/**
 * reset request
 */
.factory('resetService', ['$http', 'arachneSettings', '$resource',
function($http, arachneSettings, $resource) {

    var resetService = $resource('', {}, {
        resetpwd : {
            url: arachneSettings.dataserviceUri + '/user/reset',
            isArray: false,
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }
    });
    return {
        resetpwd : function(pwd, successMethod, errorMethod){
            return resetService.resetpwd(pwd, successMethod, errorMethod);
        }
    }
}]);