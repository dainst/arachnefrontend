'use strict';

angular.module('arachne.services')

/**
 * register
 */
.factory('registerService', ['$http', 'arachneSettings', '$resource',
function($http, arachneSettings, $resource) {
    var registerService = $resource('', {}, {
        resetpwd : {
            url: arachneSettings.dataserviceUri + '/user/register',
            isArray: false,
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }
    });
    return {
        register : function(pwd, successMethod, errorMethod){
            return registerService.register(pwd, successMethod, errorMethod);
        }
    }
}]);