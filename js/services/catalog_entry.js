'use strict';

angular.module('arachne.services')

.factory('CatalogEntry', ['$resource', 'arachneSettings',
function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/catalogentry/:id');

}]);