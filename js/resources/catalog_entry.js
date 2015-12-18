'use strict';

angular.module('arachne.resources')

.factory('CatalogEntry', ['$resource', 'arachneSettings',
function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/catalogentry/:id');

}]);