'use strict';

angular.module('arachne.directives')

    .directive('arEntityLinks', function() {
        return {
            scope: { entity: '=' },
            templateUrl: 'app/entity/ar-entity-links.html'
        }
    });