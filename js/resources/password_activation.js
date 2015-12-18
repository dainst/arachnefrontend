'use strict';

angular.module('arachne.resources')

.factory('PasswordActivation', ['$resource', 'arachneSettings',
function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/user/activation/:token', {}, {
        save : {
            isArray: false,
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }
    });
}]);