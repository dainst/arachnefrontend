'use strict';

angular.module('arachne.directives')

    .directive('arSchemaorgJsonld', [function () {
        return {
            scope: 
            	{ entity: '=', lastmodified: '=' },
            replace: true,
            templateUrl: 'app/entity/ar-schemaorg-jsonld.html'
        }
   }]);