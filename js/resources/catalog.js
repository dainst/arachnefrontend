'use strict';

angular.module('arachne.resources')

.factory('Catalog', ['$resource', 'arachneSettings',
function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/catalog/:id', null, {
        update: { method: 'PUT' }
    });

}]);