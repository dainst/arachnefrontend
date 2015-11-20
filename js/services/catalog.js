'use strict';

angular.module('arachne.services')

.factory('Catalog', ['$resource', 'arachneSettings',
function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/catalog/:id', null, {
        'update': { method:'PUT' }
    });

}]);