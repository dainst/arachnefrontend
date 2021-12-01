'use strict';

angular.module('arachne.directives')

    .directive('arSchemaorgJsonld', [function () {
        return {
            scope: 
            	{ entity: '=', lastmodified: '=' },
            replace: true,
            template: require('./ar-schemaorg-jsonld.html')
        }
   }]);
