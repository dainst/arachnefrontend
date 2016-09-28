'use strict';

angular.module('arachne.resources')

.factory('CatalogEntry', ['$resource', 'arachneSettings',
function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/catalog/entry/:id', null, {
        update: { method:'PUT' },
        list: {
        	method: 'GET',
        	url: arachneSettings.dataserviceUri + '/catalog/list/:entityId',
        	isArray: true
        }
    });

}]);